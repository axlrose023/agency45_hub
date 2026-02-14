import uuid

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.modules.users.models import User


class TelegramGateway:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def set_telegram_token(self, user_id: uuid.UUID) -> str:
        token = str(uuid.uuid4())
        stmt = update(User).where(User.id == user_id).values(telegram_token=token)
        await self.session.execute(stmt)
        await self.session.flush()
        return token

    async def get_user_by_token(self, token: str) -> User | None:
        stmt = select(User).where(User.telegram_token == token)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_user_by_chat_id(self, chat_id: int) -> User | None:
        stmt = select(User).where(User.telegram_chat_id == chat_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def clear_token(self, user_id: uuid.UUID) -> None:
        stmt = update(User).where(User.id == user_id).values(telegram_token=None)
        await self.session.execute(stmt)
        await self.session.flush()

    async def update_telegram_chat_id(
        self,
        user_id: uuid.UUID,
        chat_id: int,
        username: str | None = None,
        locale: str | None = None,
    ) -> None:
        values: dict[str, object] = {
            "telegram_chat_id": chat_id,
            "telegram_username": username,
            "telegram_token": None,
        }
        if locale:
            values["locale"] = locale
        stmt = update(User).where(User.id == user_id).values(**values)
        await self.session.execute(stmt)
        await self.session.flush()

    async def get_chat_id_by_user_id(self, user_id: uuid.UUID) -> int | None:
        stmt = select(User.telegram_chat_id).where(User.id == user_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_users_with_telegram(self, daily_only: bool = False) -> list[User]:
        conditions = [
            User.telegram_chat_id.isnot(None),
            User.is_active.is_(True),
        ]
        if daily_only:
            conditions.append(User.telegram_daily_enabled.is_(True))
        stmt = select(User).where(*conditions)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def toggle_daily(self, user_id: uuid.UUID, enabled: bool) -> None:
        stmt = (
            update(User)
            .where(User.id == user_id)
            .values(telegram_daily_enabled=enabled)
        )
        await self.session.execute(stmt)
        await self.session.flush()

    async def logout_user(self, user_id: uuid.UUID) -> None:
        stmt = (
            update(User)
            .where(User.id == user_id)
            .values(telegram_chat_id=None, telegram_username=None, telegram_token=None)
        )
        await self.session.execute(stmt)
        await self.session.flush()
