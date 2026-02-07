from pydantic import BaseModel


class TelegramRegisterResponse(BaseModel):
    registration_link: str


class TelegramChatIdResponse(BaseModel):
    chat_id: int | None
    telegram_username: str | None = None
