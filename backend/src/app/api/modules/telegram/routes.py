import asyncio
import logging
from typing import Literal
from uuid import UUID

from dishka import FromDishka
from dishka.integrations.fastapi import DishkaRoute
from fastapi import APIRouter, Depends

from app.api.modules.auth.services.auth import AuthenticateUser
from app.api.modules.telegram.schema import (
    BroadcastRequest,
    TelegramChatIdResponse,
    TelegramRegisterResponse,
    ToggleDailyRequest,
)
from app.api.modules.telegram.service import TelegramService
from app.api.modules.users.models import User

logger = logging.getLogger(__name__)
router = APIRouter(route_class=DishkaRoute)


@router.get("/register", response_model=TelegramRegisterResponse)
async def get_registration_link(
    service: FromDishka[TelegramService],
    current_user: User = Depends(AuthenticateUser()),
    locale: Literal["ua", "ru"] = "ua",
) -> TelegramRegisterResponse:
    return await service.get_registration_link(current_user.id, locale)


@router.delete("/logout", status_code=204)
async def logout(
    service: FromDishka[TelegramService],
    current_user: User = Depends(AuthenticateUser()),
) -> None:
    await service.logout(current_user.id)


@router.get("/chat_id", response_model=TelegramChatIdResponse)
async def get_chat_id(
    service: FromDishka[TelegramService],
    current_user: User = Depends(AuthenticateUser()),
) -> TelegramChatIdResponse:
    return await service.get_chat_id(current_user.id)


@router.post("/broadcast", status_code=202)
async def send_broadcast(
    request: BroadcastRequest,
    service: FromDishka[TelegramService],
    current_user: User = Depends(AuthenticateUser()),
) -> None:
    await service.validate_broadcast(current_user.id)
    asyncio.create_task(
        _run_broadcast_in_background(
            current_user.id, request.period, request.locale,
        )
    )


async def _run_broadcast_in_background(
    user_id: UUID,
    period: str,
    locale: str,
) -> None:
    from aiogram import Bot
    from httpx import AsyncClient

    from app.api.modules.telegram.services.broadcast import TelegramBroadcastService
    from app.clients.facebook import FacebookClient
    from app.database.engine import SessionFactory
    from app.database.uow import UnitOfWork
    from app.settings import get_config

    config = get_config()
    bot = Bot(token=config.telegram.bot_token)
    try:
        async with AsyncClient(timeout=60.0) as http_client:
            fb_client = FacebookClient(http_client, config.facebook)
            async with SessionFactory() as session:
                uow = UnitOfWork(session)
                user = await uow.users.get_by_id(user_id)
                if not user:
                    return
                service = TelegramBroadcastService(
                    bot=bot,
                    fb_client=fb_client,
                    user_gw=uow.users,
                    fb_auth_gw=uow.facebook_auth,
                    telegram_gw=uow.telegram,
                )
                sent = await service.send_report_for_user(user, period, locale)
                if sent:
                    logger.info("Broadcast sent for user %s, period=%s", user_id, period)
                else:
                    logger.warning("Broadcast skipped for user %s, period=%s", user_id, period)
    except Exception as e:
        logger.error("Background broadcast failed for user %s: %s", user_id, e)
    finally:
        await bot.session.close()


@router.post("/daily-toggle", status_code=204)
async def toggle_daily(
    request: ToggleDailyRequest,
    service: FromDishka[TelegramService],
    current_user: User = Depends(AuthenticateUser()),
) -> None:
    await service.toggle_daily(current_user.id, request.enabled)
