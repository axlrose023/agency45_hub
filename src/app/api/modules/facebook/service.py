"""Facebook service - thin layer for routes."""

import logging
from datetime import date

from fastapi import HTTPException, status

from app.api.modules.facebook.schema import (
    AdResponse,
    AdSetResponse,
    CampaignResponse,
)
from app.api.modules.facebook.services import FacebookSDKService
from app.api.modules.users.models import User
from app.clients.facebook import FacebookAPIError
from app.database.uow import UnitOfWork

logger = logging.getLogger(__name__)

# Common Graph API rate-limit codes:
# 4: Application limit, 17: User limit, 32: Page limit, 613: Ads API limit.
RATE_LIMIT_ERROR_CODES = {4, 17, 32, 613}


class FacebookService:
    """Thin service layer for Facebook routes."""

    def __init__(self, uow: UnitOfWork, sdk: FacebookSDKService):
        self.uow = uow
        self.sdk = sdk

    def _build_time_range(
        self, since: date | None, until: date | None
    ) -> dict[str, str]:
        """Build time range dict from dates."""
        if since is not None and until is not None:
            if since > until:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="since must be less than or equal to until in time_range",
                )
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

    @staticmethod
    def _is_rate_limit_error(error: FacebookAPIError) -> bool:
        if error.error_code in RATE_LIMIT_ERROR_CODES:
            return True

        message = (error.message or "").lower()
        return (
            "rate limit" in message
            or "request limit" in message
            or "too many calls" in message
        )

    def _raise_facebook_http_exception(self, error: FacebookAPIError) -> None:
        logger.warning(
            "Facebook API error code=%s message=%s",
            error.error_code,
            error.message,
        )

        if self._is_rate_limit_error(error):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Facebook временно ограничил запросы. Подождите немного и повторите позже.",
                headers={"Retry-After": "300"},
            ) from error

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Facebook API временно недоступен. Попробуйте позже.",
        ) from error

    async def exchange_token(self, short_lived_token: str) -> None:
        """Exchange short-lived token for long-lived token and save it."""
        try:
            data = await self.sdk.exchange_token(short_lived_token)
        except FacebookAPIError as error:
            self._raise_facebook_http_exception(error)
        long_token = data["access_token"]

        await self.uow.facebook_auth.set_token(long_token)
        await self.uow.commit()

    async def get_ad_accounts(self, user: User) -> list[dict]:
        """Get ad accounts based on user role."""
        access_token = await self._get_access_token()
        try:
            all_accounts = await self.sdk.get_ad_accounts(access_token)
        except FacebookAPIError as error:
            self._raise_facebook_http_exception(error)

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

        try:
            campaigns = await self.sdk.get_campaigns(
                account_id, access_token, time_range
            )
        except FacebookAPIError as error:
            self._raise_facebook_http_exception(error)
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

        try:
            adsets = await self.sdk.get_adsets(
                campaign_id, account_id, access_token, time_range
            )
        except FacebookAPIError as error:
            self._raise_facebook_http_exception(error)
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

        try:
            ads = await self.sdk.get_ads(adset_id, access_token, time_range)
        except FacebookAPIError as error:
            self._raise_facebook_http_exception(error)
        return [AdResponse(**a) for a in ads]
