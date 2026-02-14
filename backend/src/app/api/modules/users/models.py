import uuid

from sqlalchemy import UUID, BigInteger, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, DateTimeMixin, UUID7IDMixin


class FacebookAuth(Base, UUID7IDMixin, DateTimeMixin):
    __tablename__ = "facebook_auth"

    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), unique=True
    )
    long_token: Mapped[str | None] = mapped_column(Text, nullable=True)


class User(Base, UUID7IDMixin, DateTimeMixin):
    __tablename__ = "users"

    username: Mapped[str] = mapped_column(String, index=True)
    password: Mapped[str] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(default=True)
    is_admin: Mapped[bool] = mapped_column(default=False)
    ad_account_id: Mapped[str | None] = mapped_column(String, nullable=True)
    created_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    telegram_chat_id: Mapped[int | None] = mapped_column(
        BigInteger, unique=True, nullable=True
    )
    telegram_username: Mapped[str | None] = mapped_column(String(255), nullable=True)
    telegram_token: Mapped[str | None] = mapped_column(String(36), nullable=True)
    telegram_daily_enabled: Mapped[bool] = mapped_column(default=False)
    locale: Mapped[str | None] = mapped_column(String(5), nullable=True, default="ua")
