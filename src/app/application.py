import asyncio
import contextlib
import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from dishka.integrations.fastapi import setup_dishka
from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.api import register_routers
from app.api.modules.telegram.services.bot import TelegramBotService
from app.ioc import get_async_container
from app.services.logging import setup_logging
from app.settings import get_config

config = get_config()
setup_logging(config.env)
logger = logging.getLogger(__name__)

# Telegram bot service
_telegram_bot = TelegramBotService(config.telegram)

router = APIRouter()


@router.get("/ping")
async def ping() -> None | dict:
    """Ping endpoint to check if the service is alive."""
    return {"message": "pong"}


async def _ensure_default_admin() -> None:
    """Create default admin user (admin/admin, is_admin=True) if it does not exist."""
    import bcrypt

    from app.api.modules.users.models import User
    from app.database.uow import UnitOfWork

    container = get_async_container()
    async with container() as request_container:
        uow = await request_container.get(UnitOfWork)
        existing = await uow.users.get_by_username("admin")
        if existing is not None:
            return
        hashed = bcrypt.hashpw(b"admin", bcrypt.gensalt(rounds=12)).decode()
        user = User(
            username="admin",
            password=hashed,
            is_active=True,
            is_admin=True,
        )
        await uow.users.create(user)
        await uow.commit()
    logger.info("Default admin user created (username: admin, password: admin)")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    logger.info("Starting application...")

    await _ensure_default_admin()

    logger.info("Starting telegram bot polling...")
    bot_task = asyncio.create_task(_telegram_bot.start_polling())

    yield

    bot_task.cancel()
    with contextlib.suppress(asyncio.CancelledError):
        await bot_task

    logger.info("Shutting down application...")


def get_production_app() -> FastAPI:
    """Get the FastAPI application instance."""
    app = FastAPI(
        title=config.api.title,
        version=config.api.version,
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=config.api.allowed_hosts,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_routers(router)
    app.include_router(router)

    setup_dishka(get_async_container(), app)

    # Setup Prometheus metrics
    instrumentator = Instrumentator()
    instrumentator.instrument(app).expose(app)

    return app
