import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.methods import DeleteWebhook

from app.api.modules.telegram.services.handlers import setup_handlers
from app.settings import TelegramConfig

logger = logging.getLogger(__name__)


class TelegramBotService:

    def __init__(self, config: TelegramConfig):
        self.bot = Bot(token=config.bot_token)
        self.dp = Dispatcher()
        setup_handlers(self.dp)

    async def start_polling(self) -> None:
        while True:
            try:
                await self.bot(DeleteWebhook(drop_pending_updates=True))
                await self.dp.start_polling(self.bot, handle_signals=False)
            except Exception as e:
                logger.error("Polling stopped with error: %s, restarting in 5 seconds...", e)
                await asyncio.sleep(5)
