"""add_facebook_auth

Revision ID: fb0001
Revises: aac9c3981adb
Create Date: 2026-02-06 12:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "fb0001"
down_revision: str | None = "aac9c3981adb"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Add user columns
    op.add_column(
        "users",
        sa.Column("is_admin", sa.Boolean(), nullable=False, server_default="false"),
    )
    op.add_column(
        "users",
        sa.Column("ad_account_id", sa.String(), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("telegram_chat_id", sa.BigInteger(), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("telegram_token", sa.String(36), nullable=True),
    )
    op.create_unique_constraint(
        op.f("users_telegram_chat_id_ukey"),
        "users",
        ["telegram_chat_id"],
    )

    # Create facebook_auth table (shared tokens for all users)
    op.create_table(
        "facebook_auth",
        sa.Column("short_token", sa.Text(), nullable=True),
        sa.Column("long_token", sa.Text(), nullable=True),
        sa.Column("id", sa.UUID(), server_default=sa.text("uuidv7()"), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("facebook_auth_pkey")),
    )


def downgrade() -> None:
    op.drop_table("facebook_auth")
    op.drop_constraint(op.f("users_telegram_chat_id_ukey"), "users", type_="unique")
    op.drop_column("users", "telegram_token")
    op.drop_column("users", "telegram_chat_id")
    op.drop_column("users", "ad_account_id")
    op.drop_column("users", "is_admin")
