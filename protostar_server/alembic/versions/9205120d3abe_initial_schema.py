"""initial_schema

Revision ID: 9205120d3abe
Revises:
Create Date: 2026-11-13
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '9205120d3abe'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ENUM types
    approval_decision = sa.Enum('approved', 'rejected', name='approval_decision')
    approval_decision.create(op.get_bind(), checkfirst=True)

    artifact_type_enum = sa.Enum('spec', 'plan', 'tasks', name='artifact_type')
    artifact_type_enum.create(op.get_bind(), checkfirst=True)

    requirement_status_enum = sa.Enum('active', 'closed', name='requirement_status')
    requirement_status_enum.create(op.get_bind(), checkfirst=True)

    run_status_enum = sa.Enum('running', 'completed', 'failed', name='run_status')
    run_status_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        'projects',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'local_users',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('username', sa.String(), nullable=False),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('username'),
    )

    op.create_table(
        'sessions',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['local_users.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'worker_sessions',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('token_hash', sa.String(), nullable=False),
        sa.Column('last_heartbeat_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('token_hash'),
    )

    op.create_table(
        'requirements',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('scope', sa.String(), nullable=False),
        sa.Column('status', sa.Enum('active', 'closed', name='requirement_status', create_type=False), nullable=False),
        sa.Column('project_id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    # Partial unique index: at most one active requirement per project (FR-002)
    op.create_index(
        'uq_requirements_project_active',
        'requirements',
        ['project_id'],
        unique=True,
        postgresql_where=sa.text("status = 'active'"),
    )

    op.create_table(
        'artifacts',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('requirement_id', sa.UUID(), nullable=False),
        sa.Column('type', sa.Enum('spec', 'plan', 'tasks', name='artifact_type', create_type=False), nullable=False),
        sa.Column('file_path', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['requirement_id'], ['requirements.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('requirement_id', 'type', name='uq_artifacts_requirement_type'),
    )

    op.create_table(
        'approval_records',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('artifact_id', sa.UUID(), nullable=False),
        sa.Column('approver', sa.String(), nullable=False),
        sa.Column('decided_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('decision', sa.Enum('approved', 'rejected', name='approval_decision', create_type=False), nullable=False),
        sa.ForeignKeyConstraint(['artifact_id'], ['artifacts.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    op.create_table(
        'runs',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('task_ref', sa.String(), nullable=False),
        sa.Column('tasks_approval_id', sa.UUID(), nullable=False),
        sa.Column('backend', sa.String(), nullable=False),
        sa.Column('work_dir', sa.String(), nullable=True),
        sa.Column('model', sa.String(), nullable=True),
        sa.Column('session_id', sa.String(), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('finished_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.Enum('running', 'completed', 'failed', name='run_status', create_type=False), nullable=False),
        sa.ForeignKeyConstraint(['tasks_approval_id'], ['approval_records.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    # Partial unique index: at most one running run per task_ref (FR-009)
    op.create_index(
        'uq_runs_task_ref_running',
        'runs',
        ['task_ref'],
        unique=True,
        postgresql_where=sa.text("status = 'running'"),
    )

    op.create_table(
        'run_outputs',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('run_id', sa.UUID(), nullable=False),
        sa.Column('stdout', sa.String(), nullable=True),
        sa.Column('stderr', sa.String(), nullable=True),
        sa.Column('exit_code', sa.Integer(), nullable=True),
        sa.Column('failure_reason', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['run_id'], ['runs.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('run_id'),
    )


def downgrade() -> None:
    op.drop_table('run_outputs')
    op.drop_index('uq_runs_task_ref_running', table_name='runs')
    op.drop_table('runs')
    op.drop_table('approval_records')
    op.drop_table('artifacts')
    op.drop_index('uq_requirements_project_active', table_name='requirements')
    op.drop_table('requirements')
    op.drop_table('worker_sessions')
    op.drop_table('sessions')
    op.drop_table('local_users')
    op.drop_table('projects')

    sa.Enum(name='run_status').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='requirement_status').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='artifact_type').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='approval_decision').drop(op.get_bind(), checkfirst=True)
