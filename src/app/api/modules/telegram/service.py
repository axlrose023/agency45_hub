"""Telegram service for user connection."""

from typing import Literal
from uuid import UUID

from app.api.modules.telegram.schema import (
    TelegramChatIdResponse,
    TelegramRegisterResponse,
)
from app.database.uow import UnitOfWork
from app.settings import TelegramConfig


class TelegramService:
    def __init__(self, uow: UnitOfWork, config: TelegramConfig):
        self.uow = uow
        self.config = config

    async def get_registration_link(
        self, user_id: UUID, locale: Literal["ua", "ru"] = "ua"
    ) -> TelegramRegisterResponse:
        """Generate registration link for telegram bot."""
        token = await self.uow.telegram.set_telegram_token(user_id)
        await self.uow.commit()
        link = f"{self.config.bot_link}?start={token}_{locale}"
        return TelegramRegisterResponse(registration_link=link)

    async def logout(self, user_id: UUID) -> None:
        """Disconnect telegram from user."""
        await self.uow.telegram.logout_user(user_id)
        await self.uow.commit()

    async def get_chat_id(self, user_id: UUID) -> TelegramChatIdResponse:
        """Get telegram chat data for user."""
        user = await self.uow.users.get_by_id(user_id)
        if not user:
            return TelegramChatIdResponse(chat_id=None, telegram_username=None)

        return TelegramChatIdResponse(
            chat_id=user.telegram_chat_id,
            telegram_username=user.telegram_username,
        )
