from typing import Literal

from pydantic import BaseModel


class TelegramRegisterResponse(BaseModel):
    registration_link: str


class TelegramChatIdResponse(BaseModel):
    chat_id: int | None
    telegram_username: str | None = None
    telegram_daily_enabled: bool = False


class BroadcastRequest(BaseModel):
    period: Literal["today", "yesterday", "week", "month", "last30"]
    locale: Literal["ua", "ru"] = "ua"


class ToggleDailyRequest(BaseModel):
    enabled: bool
