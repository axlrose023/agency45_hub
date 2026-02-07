from datetime import datetime
from typing import Any

from app.clients.facebook import FacebookClient


class FacebookSDKService:
    def __init__(self, client: FacebookClient):
        self.client = client

    @staticmethod
    def get_current_month_range() -> dict[str, str]:
        today = datetime.now()
        start = today.replace(day=1).strftime("%Y-%m-%d")
        end = today.strftime("%Y-%m-%d")
        return {"since": start, "until": end}

    async def exchange_code(self, code: str, redirect_uri: str) -> dict[str, Any]:
        return await self.client.exchange_code(code, redirect_uri)

    async def exchange_token(self, short_lived_token: str) -> dict[str, Any]:
        return await self.client.exchange_token(short_lived_token)

    async def get_ad_accounts(self, access_token: str) -> list[dict[str, Any]]:
        return await self.client.get_ad_accounts(access_token)

    async def get_campaigns(
        self,
        account_id: str,
        access_token: str,
        time_range: dict[str, str],
    ) -> list[dict[str, Any]]:
        return await self.client.get_campaigns(account_id, access_token, time_range)

    async def get_adsets(
        self,
        campaign_id: str,
        account_id: str,
        access_token: str,
        time_range: dict[str, str],
    ) -> list[dict[str, Any]]:
        return await self.client.get_adsets(
            campaign_id, account_id, access_token, time_range
        )

    async def get_ads(
        self,
        adset_id: str,
        access_token: str,
        time_range: dict[str, str],
    ) -> list[dict[str, Any]]:
        return await self.client.get_ads(adset_id, access_token, time_range)
