"""Facebook auth gateway for database operations."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.modules.users.models import FacebookAuth


class FacebookAuthGateway:
    """Gateway for FacebookAuth database operations."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get(self) -> FacebookAuth | None:
        """Get the shared FacebookAuth record."""
        query = select(FacebookAuth).limit(1)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def set_token(self, long_token: str) -> FacebookAuth:
        """Set the shared long-lived token."""
        fb_auth = await self.get()

        if fb_auth:
            fb_auth.long_token = long_token
        else:
            fb_auth = FacebookAuth(long_token=long_token)
            self.session.add(fb_auth)

        return fb_auth
