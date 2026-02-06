"""Facebook API routes."""

from datetime import date

from dishka.integrations.fastapi import DishkaRoute, FromDishka
from fastapi import APIRouter, Depends, Query

from app.api.modules.auth.services.auth import AdminRequired, AuthenticateUser
from app.api.modules.facebook.schema import (
    AdResponse,
    AdSetResponse,
    CampaignResponse,
    ExchangeTokenRequest,
)
from app.api.modules.facebook.service import FacebookService
from app.api.modules.users.models import User

router = APIRouter(route_class=DishkaRoute)


@router.post("/auth/exchange-token", status_code=204)
async def exchange_token(
    request: ExchangeTokenRequest,
    service: FromDishka[FacebookService],
    current_user: User = Depends(AdminRequired()),
) -> None:
    """Exchange short-lived Facebook token for long-lived token (admin only)."""
    await service.exchange_token(request.short_lived_token)


@router.get("/ad-accounts")
async def get_ad_accounts(
    service: FromDishka[FacebookService],
    current_user: User = Depends(AuthenticateUser()),
) -> list[dict]:
    """Get ad accounts. Admin sees all, user sees only assigned."""
    return await service.get_ad_accounts(current_user)


@router.get(
    "/ad-accounts/{account_id}/campaigns", response_model=list[CampaignResponse]
)
async def get_campaigns(
    account_id: str,
    service: FromDishka[FacebookService],
    current_user: User = Depends(AuthenticateUser()),
    since: date | None = Query(None, description="Start date (YYYY-MM-DD)"),
    until: date | None = Query(None, description="End date (YYYY-MM-DD)"),
) -> list[CampaignResponse]:
    """Get campaigns for an ad account with insights."""
    return await service.get_campaigns(
        current_user, account_id, since=since, until=until
    )


@router.get(
    "/ad-accounts/{account_id}/campaigns/{campaign_id}/adsets",
    response_model=list[AdSetResponse],
)
async def get_adsets(
    account_id: str,
    campaign_id: str,
    service: FromDishka[FacebookService],
    current_user: User = Depends(AuthenticateUser()),
    since: date | None = Query(None, description="Start date (YYYY-MM-DD)"),
    until: date | None = Query(None, description="End date (YYYY-MM-DD)"),
) -> list[AdSetResponse]:
    """Get adsets for a campaign with insights."""
    return await service.get_adsets(
        current_user, campaign_id, account_id, since=since, until=until
    )


@router.get("/adsets/{adset_id}/ads", response_model=list[AdResponse])
async def get_ads(
    adset_id: str,
    service: FromDishka[FacebookService],
    _: User = Depends(AuthenticateUser()),
    since: date | None = Query(None, description="Start date (YYYY-MM-DD)"),
    until: date | None = Query(None, description="End date (YYYY-MM-DD)"),
) -> list[AdResponse]:
    """Get ads for an adset with insights."""
    return await service.get_ads(adset_id, since=since, until=until)
