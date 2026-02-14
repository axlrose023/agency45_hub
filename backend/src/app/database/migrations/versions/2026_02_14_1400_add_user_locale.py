"""add_user_locale

Revision ID: loc001
Revises: tg0003
Create Date: 2026-02-14 14:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "loc001"
down_revision: str | None = "tg0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("locale", sa.String(5), nullable=True, server_default=sa.text("'ua'")),
    )


def downgrade() -> None:
    op.drop_column("users", "locale")
