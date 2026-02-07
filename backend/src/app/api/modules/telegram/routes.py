from typing import Literal

from dishka import FromDishka
from dishka.integrations.fastapi import DishkaRoute
from fastapi import APIRouter, Depends

from app.api.modules.auth.services.auth import AuthenticateUser
from app.api.modules.telegram.schema import (
    TelegramChatIdResponse,
    TelegramRegisterResponse,
)
from app.api.modules.telegram.service import TelegramService
from app.api.modules.users.models import User

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
