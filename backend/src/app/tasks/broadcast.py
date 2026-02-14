import logging

from app.api.modules.telegram.services.broadcast import TelegramBroadcastService
from app.clients.facebook import FacebookClient
from app.database.engine import SessionFactory
from app.database.uow import UnitOfWork
from app.settings import get_config
from app.tiq import broker

logger = logging.getLogger(__name__)

config = get_config()


# 06:00 UTC = 09:00 Kyiv (Ukraine is on permanent UTC+3 since 2022)
@broker.task(schedule=[{"cron": "0 6 * * *"}])
async def send_daily_broadcast() -> None:
    logger.info("Starting daily broadcast task")

    from aiogram import Bot
    from httpx import AsyncClient

    bot = Bot(token=config.telegram.bot_token)
    try:
        async with AsyncClient(timeout=60.0) as http_client:
            fb_client = FacebookClient(http_client, config.facebook)

            async with SessionFactory() as session:
                uow = UnitOfWork(session)
                service = TelegramBroadcastService(
                    bot=bot,
                    fb_client=fb_client,
                    user_gw=uow.users,
                    fb_auth_gw=uow.facebook_auth,
                    telegram_gw=uow.telegram,
                )
                await service.send_daily_reports()
    finally:
        await bot.session.close()

    logger.info("Daily broadcast task completed")
