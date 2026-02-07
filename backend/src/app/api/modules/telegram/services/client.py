import logging

import httpx

from app.clients.base import HttpClient
from app.settings import TelegramConfig

logger = logging.getLogger(__name__)

TELEGRAM_API_BASE_URL = "https://api.telegram.org/bot{token}"


class TelegramClient(HttpClient):

    def __init__(self, client: httpx.AsyncClient, config: TelegramConfig):
        super().__init__(
            client=client,
            base_url=TELEGRAM_API_BASE_URL.format(token=config.bot_token),
            default_timeout=10.0,
        )

    async def send_message(
        self, chat_id: int, text: str, parse_mode: str = "HTML"
    ) -> bool:
        try:
            await self.post(
                "/sendMessage",
                json={"chat_id": chat_id, "text": text, "parse_mode": parse_mode},
            )
            return True
        except Exception as e:
            logger.error("Failed to send telegram message: %s", e)
            return False
