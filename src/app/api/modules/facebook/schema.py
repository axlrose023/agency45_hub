from datetime import date
from typing import Any

from pydantic import BaseModel, Field


class TimeRangeParams(BaseModel):
    since: date = Field(description="Start date for insights")
    until: date = Field(description="End date for insights")


class ExchangeTokenRequest(BaseModel):
    short_lived_token: str = Field(description="Short-lived user access token")


class ExchangeCodeRequest(BaseModel):
    code: str = Field(description="OAuth authorization code from Facebook redirect")
    redirect_uri: str = Field(description="Redirect URI used in the OAuth flow")


class InsightsData(BaseModel):
    spend: str | None = None
    impressions: str | None = None
    clicks: str | None = None
    cpc: str | None = None
    cpm: str | None = None
    ctr: str | None = None
    reach: str | None = None


class AdAccountResponse(BaseModel):
    account_id: str
    name: str | None = None
    currency: str | None = None
    account_status: int | None = None


class CampaignResponse(BaseModel):
    campaign_id: str
    campaign_name: str | None = None
    objective: str | None = None
    status: str | None = None
    insights: dict[str, Any] | None = None


class AdSetResponse(BaseModel):
    adset_id: str
    adset_name: str | None = None
    targeting: dict[str, Any] = Field(default_factory=dict)
    status: str | None = None
    insights: dict[str, Any] | None = None


class CreativeData(BaseModel):
    id: str | None = None
    thumbnail_url: str | None = None
    body: str | None = None
    title: str | None = None
    link_url: str | None = None
    image_url: str | None = None
    video_id: str | None = None


class AdResponse(BaseModel):
    ad_id: str
    ad_name: str | None = None
    status: str | None = None
    creative: dict[str, Any] = Field(default_factory=dict)
    insights: dict[str, Any] | None = None
