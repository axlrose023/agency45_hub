from aiogram import Dispatcher

from app.api.modules.telegram.services.handlers.start import register_start_handler


def setup_handlers(dp: Dispatcher) -> None:
    register_start_handler(dp)
