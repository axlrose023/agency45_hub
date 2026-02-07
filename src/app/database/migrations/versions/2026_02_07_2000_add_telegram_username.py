"""add_telegram_username

Revision ID: tg0002
Revises: fb0001
Create Date: 2026-02-07 20:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "tg0002"
down_revision: str | None = "fb0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("telegram_username", sa.String(length=255), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("users", "telegram_username")
