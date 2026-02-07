"""Telegram gateway for database operations."""

import uuid

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.modules.users.models import User


class TelegramGateway:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def set_telegram_token(self, user_id: uuid.UUID) -> str:
        """Generate and set a new telegram token for user."""
        token = str(uuid.uuid4())
        stmt = update(User).where(User.id == user_id).values(telegram_token=token)
        await self.session.execute(stmt)
        await self.session.flush()
        return token

    async def get_user_by_token(self, token: str) -> User | None:
        """Get user by telegram token."""
        stmt = select(User).where(User.telegram_token == token)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_user_by_chat_id(self, chat_id: int) -> User | None:
        """Get user by telegram chat ID."""
        stmt = select(User).where(User.telegram_chat_id == chat_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def clear_token(self, user_id: uuid.UUID) -> None:
        """Clear telegram token for user."""
        stmt = update(User).where(User.id == user_id).values(telegram_token=None)
        await self.session.execute(stmt)
        await self.session.flush()

    async def update_telegram_chat_id(
        self,
        user_id: uuid.UUID,
        chat_id: int,
        username: str | None = None,
    ) -> None:
        """Link telegram chat to user and clear token."""
        stmt = (
            update(User)
            .where(User.id == user_id)
            .values(
                telegram_chat_id=chat_id,
                telegram_username=username,
                telegram_token=None,
            )
        )
        await self.session.execute(stmt)
        await self.session.flush()

    async def get_chat_id_by_user_id(self, user_id: uuid.UUID) -> int | None:
        """Get telegram chat ID for user."""
        stmt = select(User.telegram_chat_id).where(User.id == user_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def logout_user(self, user_id: uuid.UUID) -> None:
        """Disconnect telegram from user."""
        stmt = (
            update(User)
            .where(User.id == user_id)
            .values(telegram_chat_id=None, telegram_username=None, telegram_token=None)
        )
        await self.session.execute(stmt)
        await self.session.flush()
