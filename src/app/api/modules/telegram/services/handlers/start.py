import logging

from aiogram import Dispatcher, types
from aiogram.filters import CommandStart

from app.api.modules.telegram.gateway import TelegramGateway
from app.api.modules.telegram.services.messages import (
    detect_telegram_locale,
    get_message,
    normalize_locale,
)
from app.database.engine import SessionFactory

logger = logging.getLogger(__name__)


def parse_start_payload(payload: str | None) -> tuple[str | None, str | None]:
    """Parse '/start <token>_<locale>' payload."""
    if not payload:
        return None, None

    token, separator, payload_locale = payload.rpartition("_")
    if separator and token and payload_locale in {"ua", "ru"}:
        return token, payload_locale
    # Backward compatibility for previously generated links with "uk".
    if separator and token and payload_locale == "uk":
        return token, "ua"
    return payload, None


def register_start_handler(dp: Dispatcher) -> None:
    @dp.message(CommandStart())
    async def start_command(message: types.Message) -> None:
        chat_id = message.chat.id
        fallback_locale = detect_telegram_locale(
            message.from_user.language_code if message.from_user else None
        )

        async with SessionFactory() as session:
            gateway = TelegramGateway(session)

            parts = message.text.split(maxsplit=1) if message.text else []
            payload = parts[1] if len(parts) > 1 else None
            token, payload_locale = parse_start_payload(payload)
            response_locale = (
                normalize_locale(payload_locale) if payload_locale else fallback_locale
            )
            existing_user_with_chat_id = await gateway.get_user_by_chat_id(chat_id)

            if not token:
                if existing_user_with_chat_id:
                    await message.answer(
                        get_message("already_registered", response_locale)
                    )
                else:
                    await message.answer(get_message("use_link", response_locale))
                return

            user = await gateway.get_user_by_token(token)

            if not user:
                await message.answer(get_message("invalid_token", response_locale))
                return

            # Check if this chat_id is already used by another user
            if existing_user_with_chat_id and existing_user_with_chat_id.id != user.id:
                logger.debug(
                    "Disconnecting chat_id %s from user %s to connect user %s",
                    chat_id,
                    existing_user_with_chat_id.id,
                    user.id,
                )
                await gateway.logout_user(existing_user_with_chat_id.id)
                await session.flush()

            if user.telegram_chat_id == chat_id:
                logger.debug(
                    "User %s already has chat_id %s, clearing token", user.id, chat_id
                )
                await gateway.clear_token(user.id)
                await session.commit()
                await message.answer(get_message("already_registered", response_locale))
                return

            logger.debug(
                "Updating chat_id %s for user %s (previous: %s)",
                chat_id,
                user.id,
                user.telegram_chat_id,
            )
            await gateway.update_telegram_chat_id(user.id, chat_id)
            await session.commit()

            await session.refresh(user)
            if user.telegram_chat_id == chat_id:
                logger.debug("Updated chat_id %s for user %s", chat_id, user.id)
                await message.answer(get_message("success", response_locale))
            else:
                logger.error(
                    "Failed to update chat_id for user %s: expected %s, got %s",
                    user.id,
                    chat_id,
                    user.telegram_chat_id,
                )
                await message.answer(get_message("save_error", response_locale))
