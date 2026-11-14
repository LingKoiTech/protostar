"""add_requirement_type_priority

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-11-14
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE TYPE requirement_type AS ENUM ('feature', 'bug', 'improvement', 'research')")
    op.execute("CREATE TYPE requirement_priority AS ENUM ('P0', 'P1', 'P2')")
    op.add_column('requirements', sa.Column('type', sa.Enum('feature', 'bug', 'improvement', 'research', name='requirement_type', create_type=False), nullable=False, server_default='feature'))
    op.add_column('requirements', sa.Column('priority', sa.Enum('P0', 'P1', 'P2', name='requirement_priority', create_type=False), nullable=False, server_default='P2'))
    op.execute("UPDATE requirements SET type = 'feature' WHERE type IS NULL")
    op.execute("UPDATE requirements SET priority = 'P2' WHERE priority IS NULL")


def downgrade() -> None:
    op.drop_column('requirements', 'priority')
    op.drop_column('requirements', 'type')
    op.execute('DROP TYPE IF EXISTS requirement_priority')
    op.execute('DROP TYPE IF EXISTS requirement_type')
