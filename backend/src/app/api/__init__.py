from fastapi import APIRouter


def register_routers(router: APIRouter) -> None:
    from app.api.modules.auth.routes import router as auth_router
    from app.api.modules.facebook.routes import router as facebook_router
    from app.api.modules.telegram.routes import router as telegram_router
    from app.api.modules.users.routes import router as users_router

    router.include_router(auth_router, prefix="/auth", tags=["Auth"])
    router.include_router(users_router, prefix="/users", tags=["Users"])
    router.include_router(facebook_router, prefix="/facebook", tags=["Facebook"])
    router.include_router(telegram_router, prefix="/telegram", tags=["Telegram"])
