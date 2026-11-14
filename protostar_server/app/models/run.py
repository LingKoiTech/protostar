import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, DateTime, ForeignKey, Enum, Index, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Run(Base):
    __tablename__ = "runs"
    __table_args__ = (
        # 局部唯一索引：同一 task_ref 只允许一条 running 记录（FR-009）
        Index(
            "uq_runs_task_ref_running",
            "task_ref",
            unique=True,
            postgresql_where="status = 'running'",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    task_ref: Mapped[str] = mapped_column(String, nullable=False)
    tasks_approval_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("approval_records.id"), nullable=False
    )
    backend: Mapped[str] = mapped_column(String, nullable=False, default="omp")
    work_dir: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    model: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    session_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_now
    )
    finished_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    status: Mapped[str] = mapped_column(
        Enum("running", "completed", "failed", name="run_status"),
        nullable=False,
        default="running",
    )
