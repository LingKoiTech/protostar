"""add_requirement_number

Revision ID: a1b2c3d4e5f6
Revises: 9205120d3abe
Create Date: 2026-11-14
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "9205120d3abe"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("projects", sa.Column("code", sa.String(), nullable=False, server_default="PRO"))
    op.add_column("projects", sa.Column("next_requirement_number", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("requirements", sa.Column("seq_number", sa.Integer(), nullable=False, server_default="0"))
    op.drop_index("uq_requirements_project_active", table_name="requirements")
    op.execute(
        """UPDATE requirements r SET seq_number = sub.rn
           FROM (
               SELECT id, ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY created_at) AS rn
               FROM requirements
           ) sub
           WHERE r.id = sub.id"""
    )
    op.execute(
        """UPDATE projects p
           SET next_requirement_number = COALESCE(
               (SELECT MAX(seq_number) FROM requirements WHERE project_id = p.id),
               0
           )"""
    )
    op.create_unique_constraint(
        "uq_requirements_project_seq",
        "requirements",
        ["project_id", "seq_number"],
    )


def downgrade() -> None:
    op.drop_constraint("uq_requirements_project_seq", "requirements", type_="unique")
    op.drop_column("requirements", "seq_number")
    op.drop_column("projects", "next_requirement_number")
    op.drop_column("projects", "code")
    op.create_index(
        "uq_requirements_project_active",
        "requirements",
        ["project_id"],
        unique=True,
        postgresql_where=sa.text("status = 'active'"),
    )
