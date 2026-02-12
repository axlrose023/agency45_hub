"""add_multiadmin

Revision ID: ma0001
Revises: tg0002
Create Date: 2026-02-11 12:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "ma0001"
down_revision: str | None = "tg0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Add created_by_id to users (nullable — root admins have no creator)
    op.add_column(
        "users",
        sa.Column("created_by_id", sa.UUID(), nullable=True),
    )
    op.create_foreign_key(
        op.f("users_created_by_id_fkey"),
        "users",
        "users",
        ["created_by_id"],
        ["id"],
    )

    # Add owner_id to facebook_auth (per-admin token)
    op.add_column(
        "facebook_auth",
        sa.Column("owner_id", sa.UUID(), nullable=True),
    )
    op.create_foreign_key(
        op.f("facebook_auth_owner_id_fkey"),
        "facebook_auth",
        "users",
        ["owner_id"],
        ["id"],
    )
    op.create_unique_constraint(
        op.f("facebook_auth_owner_id_ukey"),
        "facebook_auth",
        ["owner_id"],
    )

    # Drop short_token column (unused)
    op.drop_column("facebook_auth", "short_token")


def downgrade() -> None:
    op.add_column(
        "facebook_auth",
        sa.Column("short_token", sa.Text(), nullable=True),
    )
    op.drop_constraint(
        op.f("facebook_auth_owner_id_ukey"), "facebook_auth", type_="unique"
    )
    op.drop_constraint(
        op.f("facebook_auth_owner_id_fkey"), "facebook_auth", type_="foreignkey"
    )
    op.drop_column("facebook_auth", "owner_id")

    op.drop_constraint(
        op.f("users_created_by_id_fkey"), "users", type_="foreignkey"
    )
    op.drop_column("users", "created_by_id")
