"""Facebook Graph API client."""

import json
import logging
from typing import Any

import httpx

from app.clients.base import HttpClient, HttpClientError
from app.settings import FacebookConfig

logger = logging.getLogger(__name__)


class FacebookAPIError(HttpClientError):
    """Facebook API specific error."""

    def __init__(self, message: str, error_code: int | None = None, **kwargs):
        self.error_code = error_code
        super().__init__(message, **kwargs)


class FacebookClient(HttpClient):
    """Client for Facebook Graph API."""

    def __init__(self, client: httpx.AsyncClient, config: FacebookConfig):
        super().__init__(
            client=client,
            base_url=f"{config.base_url}/{config.api_version}",
            default_timeout=60.0,
        )
        self.config = config

    def _get_active_filter(self) -> str:
        """Build active status filter from config."""
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
        """Fetch all pages from a paginated endpoint."""
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
            params = {}

        return items

    async def exchange_code(
        self, code: str, redirect_uri: str
    ) -> dict[str, Any]:
        """Exchange OAuth authorization code for an access token."""
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
        """Exchange short-lived token for long-lived token."""
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
        """Get all ad accounts for the authenticated user."""
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
    ) -> list[dict[str, Any]]:
        """Get active campaigns for an ad account with non-empty insights."""
        campaigns = await self._fetch_with_pagination(
            f"act_{account_id}/campaigns",
            access_token,
            params={
                "fields": "id,name,status,objective",
                "filtering": self._get_active_filter(),
            },
        )

        result = []
        for campaign in campaigns:
            insights = await self._fetch_with_pagination(
                f"act_{account_id}/insights",
                access_token,
                params={
                    "time_range": json.dumps(time_range),
                    "level": "campaign",
                    "fields": self.config.campaign_insight_fields,
                    "filtering": json.dumps(
                        [
                            {
                                "field": "campaign.id",
                                "operator": "EQUAL",
                                "value": campaign["id"],
                            }
                        ]
                    ),
                },
            )

            if not insights:
                continue

            insight = dict(insights[0])
            insight.pop("date_start", None)
            insight.pop("date_stop", None)
            if not insight:
                continue

            result.append(
                {
                    "campaign_id": campaign["id"],
                    "campaign_name": campaign.get("name"),
                    "objective": campaign.get("objective"),
                    "status": campaign.get("status"),
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
        """Get active adsets for a campaign with non-empty insights."""
        adsets = await self._fetch_with_pagination(
            f"{campaign_id}/adsets",
            access_token,
            params={
                "fields": "id,name,targeting,status",
                "filtering": self._get_active_filter(),
            },
        )

        result = []
        for adset in adsets:
            insights = await self._fetch_with_pagination(
                f"act_{account_id}/insights",
                access_token,
                params={
                    "time_range": json.dumps(time_range),
                    "level": "adset",
                    "fields": self.config.ad_insight_fields,
                    "filtering": json.dumps(
                        [
                            {
                                "field": "adset.id",
                                "operator": "EQUAL",
                                "value": adset["id"],
                            }
                        ]
                    ),
                },
            )

            if not insights:
                continue

            insight = dict(insights[0])
            insight.pop("date_start", None)
            insight.pop("date_stop", None)
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
        """Get active ads for an adset with non-empty insights."""
        ads = await self._fetch_with_pagination(
            f"{adset_id}/ads",
            access_token,
            params={
                "fields": "id,name,status,creative{id,thumbnail_url,body,title,link_url,image_url,video_id}",
                "filtering": self._get_active_filter(),
            },
        )

        result = []
        for ad in ads:
            insights = await self._fetch_with_pagination(
                f"{ad['id']}/insights",
                access_token,
                params={
                    "fields": self.config.ad_insight_fields,
                    "time_range": json.dumps(time_range),
                },
            )

            if not insights:
                continue

            insight = dict(insights[0])
            insight.pop("date_start", None)
            insight.pop("date_stop", None)
            if not insight:
                continue

            result.append(
                {
                    "ad_id": ad["id"],
                    "ad_name": ad.get("name"),
                    "status": ad.get("status"),
                    "creative": ad.get("creative", {}),
                    "insights": insight,
                }
            )

        return result
