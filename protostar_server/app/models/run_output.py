import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


class RunOutput(Base):
    __tablename__ = "run_outputs"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    # 一次运行只有一份输出（UNIQUE FK）
    run_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("runs.id"), unique=True, nullable=False
    )
    # 有界截断 ≤8KB（FR-007）；截断逻辑在 worker 写入前执行
    stdout: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    stderr: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    exit_code: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    failure_reason: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_now
    )
