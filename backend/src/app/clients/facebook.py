import asyncio
import json
import logging
from typing import Any

import httpx

from app.clients.base import HttpClient, HttpClientError
from app.settings import FacebookConfig

logger = logging.getLogger(__name__)


class FacebookAPIError(HttpClientError):
    def __init__(self, message: str, error_code: int | None = None, **kwargs):
        self.error_code = error_code
        super().__init__(message, **kwargs)


class FacebookClient(HttpClient):
    def __init__(self, client: httpx.AsyncClient, config: FacebookConfig):
        super().__init__(
            client=client,
            base_url=f"{config.base_url}/{config.api_version}",
            default_timeout=60.0,
        )
        self.config = config

    def _get_active_filter(self) -> str:
        return json.dumps(
            [
                {
                    "field": "effective_status",
                    "operator": "IN",
                    "value": self.config.active_statuses,
                }
            ]
        )

    async def _fetch_with_pagination(
        self,
        endpoint: str,
        access_token: str,
        params: dict[str, Any] | None = None,
    ) -> list[dict[str, Any]]:
        params = params or {}
        params["access_token"] = access_token
        items: list[dict[str, Any]] = []

        url = self._build_url(endpoint)

        while url:
            response = await self.client.get(url, params=params, timeout=60.0)
            data = response.json()

            if "error" in data:
                error = data["error"]
                raise FacebookAPIError(
                    message=error.get("message", str(error)),
                    error_code=error.get("code"),
                    response_body=data,
                )

            items.extend(data.get("data", []))
            url = data.get("paging", {}).get("next")
            params = None

        return items

    async def exchange_code(self, code: str, redirect_uri: str) -> dict[str, Any]:
        response = await self.get(
            "/oauth/access_token",
            params={
                "client_id": self.config.app_id,
                "client_secret": self.config.app_secret,
                "redirect_uri": redirect_uri,
                "code": code,
            },
        )
        data = response.json()

        if "error" in data:
            error = data["error"]
            raise FacebookAPIError(
                message=error.get("message", str(error)),
                error_code=error.get("code"),
                response_body=data,
            )

        return data

    async def exchange_token(self, short_lived_token: str) -> dict[str, Any]:
        response = await self.get(
            "/oauth/access_token",
            params={
                "grant_type": "fb_exchange_token",
                "client_id": self.config.app_id,
                "client_secret": self.config.app_secret,
                "fb_exchange_token": short_lived_token,
            },
        )
        data = response.json()

        if "error" in data:
            error = data["error"]
            raise FacebookAPIError(
                message=error.get("message", str(error)),
                error_code=error.get("code"),
                response_body=data,
            )

        return data

    async def get_ad_accounts(self, access_token: str) -> list[dict[str, Any]]:
        return await self._fetch_with_pagination(
            "me/adaccounts",
            access_token,
            params={
                "fields": "account_id,name,currency,account_status",
            },
        )

    async def get_campaigns(
        self,
        account_id: str,
        access_token: str,
        time_range: dict[str, str],
        active_only: bool = True,
    ) -> list[dict[str, Any]]:
        params: dict[str, Any] = {
            "fields": "id,name,status,objective,updated_time",
        }
        if active_only:
            params["filtering"] = self._get_active_filter()

        campaigns = await self._fetch_with_pagination(
            f"act_{account_id}/campaigns",
            access_token,
            params=params,
        )

        if not campaigns:
            return []

        all_insights = await self._fetch_with_pagination(
            f"act_{account_id}/insights",
            access_token,
            params={
                "time_range": json.dumps(time_range),
                "level": "campaign",
                "fields": f"campaign_id,{self.config.campaign_insight_fields}",
            },
        )

        insights_by_campaign: dict[str, dict[str, Any]] = {}
        for insight in all_insights:
            campaign_id = insight.get("campaign_id")
            if campaign_id:
                cleaned = dict(insight)
                cleaned.pop("date_start", None)
                cleaned.pop("date_stop", None)
                cleaned.pop("campaign_id", None)

                actions = cleaned.pop("actions", None)
                cleaned.pop("cost_per_action_type", None)

                conversations = None
                if actions:
                    for a in actions:
                        if a.get("action_type") == "onsite_conversion.messaging_conversation_started_7d":
                            conversations = a.get("value")
                            break

                cleaned["conversations"] = conversations

                if cleaned:
                    insights_by_campaign[campaign_id] = cleaned

        result = []
        for campaign in campaigns:
            insight = insights_by_campaign.get(campaign["id"])
            if not insight:
                continue

            # Skip campaigns with no activity in the period
            spend = float(insight.get("spend") or 0)
            impressions = int(float(insight.get("impressions") or 0))
            if spend == 0 and impressions == 0:
                continue

            result.append(
                {
                    "campaign_id": campaign["id"],
                    "campaign_name": campaign.get("name"),
                    "objective": campaign.get("objective"),
                    "status": campaign.get("status"),
                    "updated_time": campaign.get("updated_time"),
                    "insights": insight,
                }
            )

        return result

    async def get_adsets(
        self,
        campaign_id: str,
        account_id: str,
        access_token: str,
        time_range: dict[str, str],
    ) -> list[dict[str, Any]]:
        adsets = await self._fetch_with_pagination(
            f"{campaign_id}/adsets",
            access_token,
            params={
                "fields": "id,name,targeting,status",
            },
        )

        if not adsets:
            return []

        all_insights = await self._fetch_with_pagination(
            f"act_{account_id}/insights",
            access_token,
            params={
                "time_range": json.dumps(time_range),
                "level": "adset",
                "fields": f"adset_id,{self.config.ad_insight_fields}",
                "filtering": json.dumps(
                    [
                        {
                            "field": "campaign.id",
                            "operator": "EQUAL",
                            "value": campaign_id,
                        }
                    ]
                ),
            },
        )

        insights_by_adset: dict[str, dict[str, Any]] = {}
        for insight in all_insights:
            adset_id = insight.get("adset_id")
            if adset_id:
                cleaned = dict(insight)
                cleaned.pop("date_start", None)
                cleaned.pop("date_stop", None)
                cleaned.pop("adset_id", None)
                if cleaned:
                    insights_by_adset[adset_id] = cleaned

        result = []
        for adset in adsets:
            insight = insights_by_adset.get(adset["id"])
            if not insight:
                continue

            result.append(
                {
                    "adset_id": adset["id"],
                    "adset_name": adset.get("name"),
                    "targeting": adset.get("targeting", {}),
                    "status": adset.get("status"),
                    "insights": insight,
                }
            )

        return result

    async def get_ads(
        self,
        adset_id: str,
        access_token: str,
        time_range: dict[str, str],
    ) -> list[dict[str, Any]]:
        ads = await self._fetch_with_pagination(
            f"{adset_id}/ads",
            access_token,
            params={
                "fields": "id,name,status,creative{id,thumbnail_url,body,title,link_url,image_url,video_id}",
            },
        )

        if not ads:
            return []

        semaphore = asyncio.Semaphore(5)

        async def fetch_ad_insight(ad: dict[str, Any]) -> dict[str, Any] | None:
            async with semaphore:
                insights = await self._fetch_with_pagination(
                    f"{ad['id']}/insights",
                    access_token,
                    params={
                        "fields": self.config.ad_insight_fields,
                        "time_range": json.dumps(time_range),
                    },
                )

            if not insights:
                return None

            insight = dict(insights[0])
            insight.pop("date_start", None)
            insight.pop("date_stop", None)
            if not insight:
                return None

            return {
                "ad_id": ad["id"],
                "ad_name": ad.get("name"),
                "status": ad.get("status"),
                "creative": ad.get("creative", {}),
                "insights": insight,
            }

        results = await asyncio.gather(*[fetch_ad_insight(ad) for ad in ads])
        return [r for r in results if r is not None]
