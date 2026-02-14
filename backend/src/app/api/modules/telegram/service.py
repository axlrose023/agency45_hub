from typing import Literal
from uuid import UUID

from aiogram import Bot
from fastapi import HTTPException, status

from app.api.modules.telegram.schema import (
    TelegramChatIdResponse,
    TelegramRegisterResponse,
)
from app.clients.facebook import FacebookClient
from app.database.uow import UnitOfWork
from app.settings import TelegramConfig


class TelegramService:
    def __init__(
        self,
        uow: UnitOfWork,
        config: TelegramConfig,
        bot: Bot,
        fb_client: FacebookClient,
    ):
        self.uow = uow
        self.config = config
        self.bot = bot
        self.fb_client = fb_client

    async def get_registration_link(
        self, user_id: UUID, locale: Literal["ua", "ru"] = "ua"
    ) -> TelegramRegisterResponse:
        token = await self.uow.telegram.set_telegram_token(user_id)
        await self.uow.commit()
        link = f"{self.config.bot_link}?start={token}_{locale}"
        return TelegramRegisterResponse(registration_link=link)

    async def logout(self, user_id: UUID) -> None:
        await self.uow.telegram.logout_user(user_id)
        await self.uow.commit()

    async def get_chat_id(self, user_id: UUID) -> TelegramChatIdResponse:
        user = await self.uow.users.get_by_id(user_id)
        if not user:
            return TelegramChatIdResponse(chat_id=None, telegram_username=None)

        return TelegramChatIdResponse(
            chat_id=user.telegram_chat_id,
            telegram_username=user.telegram_username,
            telegram_daily_enabled=user.telegram_daily_enabled,
        )

    async def toggle_daily(self, user_id: UUID, enabled: bool) -> None:
        await self.uow.telegram.toggle_daily(user_id, enabled)
        await self.uow.commit()

    async def validate_broadcast(self, user_id: UUID) -> None:
        user = await self.uow.users.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        if not user.telegram_chat_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Telegram not connected. Connect Telegram first.",
            )
