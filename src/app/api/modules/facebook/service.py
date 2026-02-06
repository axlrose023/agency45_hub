"""Facebook service - thin layer for routes."""

from datetime import date

from fastapi import HTTPException, status

from app.api.modules.facebook.schema import (
    AdResponse,
    AdSetResponse,
    CampaignResponse,
)
from app.api.modules.facebook.services import FacebookSDKService
from app.api.modules.users.models import User
from app.database.uow import UnitOfWork


class FacebookService:
    """Thin service layer for Facebook routes."""

    def __init__(self, uow: UnitOfWork, sdk: FacebookSDKService):
        self.uow = uow
        self.sdk = sdk

    def _build_time_range(
        self, since: date | None, until: date | None
    ) -> dict[str, str]:
        """Build time range dict from dates."""
        if since and until:
            return {
                "since": since.strftime("%Y-%m-%d"),
                "until": until.strftime("%Y-%m-%d"),
            }
        return self.sdk.get_current_month_range()

    async def _get_access_token(self) -> str:
        """Get shared long-lived access token."""
        fb_auth = await self.uow.facebook_auth.get()
        if not fb_auth or not fb_auth.long_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Facebook not connected. Admin must authenticate first.",
            )
        return fb_auth.long_token

    def _check_account_access(self, user: User, account_id: str) -> None:
        """Check if user has access to the ad account."""
        if user.is_admin:
            return
        if user.ad_account_id != account_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this ad account.",
            )

    async def exchange_token(self, short_lived_token: str) -> None:
        """Exchange short-lived token for long-lived token and save it."""
        data = await self.sdk.exchange_token(short_lived_token)
        long_token = data["access_token"]

        await self.uow.facebook_auth.set_token(long_token)
        await self.uow.commit()

    async def get_ad_accounts(self, user: User) -> list[dict]:
        """Get ad accounts based on user role."""
        access_token = await self._get_access_token()
        all_accounts = await self.sdk.get_ad_accounts(access_token)

        if user.is_admin:
            return all_accounts

        if not user.ad_account_id:
            return []

        return [
            acc for acc in all_accounts if acc.get("account_id") == user.ad_account_id
        ]

    async def get_campaigns(
        self,
        user: User,
        account_id: str,
        since: date | None = None,
        until: date | None = None,
    ) -> list[CampaignResponse]:
        """Get campaigns for an ad account with insights."""
        self._check_account_access(user, account_id)

        access_token = await self._get_access_token()
        time_range = self._build_time_range(since, until)

        campaigns = await self.sdk.get_campaigns(account_id, access_token, time_range)
        return [CampaignResponse(**c) for c in campaigns]

    async def get_adsets(
        self,
        user: User,
        campaign_id: str,
        account_id: str,
        since: date | None = None,
        until: date | None = None,
    ) -> list[AdSetResponse]:
        """Get adsets for a campaign with insights."""
        self._check_account_access(user, account_id)

        access_token = await self._get_access_token()
        time_range = self._build_time_range(since, until)

        adsets = await self.sdk.get_adsets(
            campaign_id, account_id, access_token, time_range
        )
        return [AdSetResponse(**a) for a in adsets]

    async def get_ads(
        self,
        adset_id: str,
        since: date | None = None,
        until: date | None = None,
    ) -> list[AdResponse]:
        """Get ads for an adset with insights."""
        access_token = await self._get_access_token()
        time_range = self._build_time_range(since, until)

        ads = await self.sdk.get_ads(adset_id, access_token, time_range)
        return [AdResponse(**a) for a in ads]
