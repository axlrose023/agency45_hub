"""Facebook SDK service for Graph API operations."""

from datetime import datetime
from typing import Any

from app.clients.facebook import FacebookClient


class FacebookSDKService:
    """Service for Facebook Graph API operations."""

    def __init__(self, client: FacebookClient):
        self.client = client

    @staticmethod
    def get_current_month_range() -> dict[str, str]:
        """Get current month date range."""
        today = datetime.now()
        start = today.replace(day=1).strftime("%Y-%m-%d")
        end = today.strftime("%Y-%m-%d")
        return {"since": start, "until": end}

    async def exchange_token(self, short_lived_token: str) -> dict[str, Any]:
        """Exchange short-lived token for long-lived token."""
        return await self.client.exchange_token(short_lived_token)

    async def get_ad_accounts(self, access_token: str) -> list[dict[str, Any]]:
        """Get all ad accounts for the authenticated user."""
        return await self.client.get_ad_accounts(access_token)

    async def get_campaigns(
        self,
        account_id: str,
        access_token: str,
        time_range: dict[str, str],
    ) -> list[dict[str, Any]]:
        """Get active campaigns for an ad account with insights."""
        return await self.client.get_campaigns(account_id, access_token, time_range)

    async def get_adsets(
        self,
        campaign_id: str,
        account_id: str,
        access_token: str,
        time_range: dict[str, str],
    ) -> list[dict[str, Any]]:
        """Get active adsets for a campaign with insights."""
        return await self.client.get_adsets(
            campaign_id, account_id, access_token, time_range
        )

    async def get_ads(
        self,
        adset_id: str,
        access_token: str,
        time_range: dict[str, str],
    ) -> list[dict[str, Any]]:
        """Get active ads for an adset with insights."""
        return await self.client.get_ads(adset_id, access_token, time_range)
