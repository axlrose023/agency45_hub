from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.modules.users.models import FacebookAuth


class FacebookAuthGateway:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_owner(self, owner_id: UUID) -> FacebookAuth | None:
        query = select(FacebookAuth).where(FacebookAuth.owner_id == owner_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def set_token(self, owner_id: UUID, long_token: str) -> FacebookAuth:
        fb_auth = await self.get_by_owner(owner_id)

        if fb_auth:
            fb_auth.long_token = long_token
        else:
            fb_auth = FacebookAuth(owner_id=owner_id, long_token=long_token)
            self.session.add(fb_auth)

        return fb_auth
