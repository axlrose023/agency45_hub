from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.api.common.schema import Pagination, PaginationParams


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    username: str
    is_admin: bool
    ad_account_id: str | None = None
    telegram_chat_id: int | None = None
    telegram_username: str | None = None
    telegram_token: str | None = None


class UsersPaginationResponse(Pagination[UserResponse]):
    model_config = ConfigDict(from_attributes=True)
    pass


class UsersPaginationParams(PaginationParams):
    id: UUID | None = None
    username: str | None = None
    username__search: str | None = None


class CreateUserRequest(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)
    ad_account_id: str | None = Field(None, description="Facebook Ad Account ID to assign")

    model_config = ConfigDict(extra="forbid")
