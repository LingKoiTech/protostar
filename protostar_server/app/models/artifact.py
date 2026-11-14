import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Artifact(Base):
    __tablename__ = "artifacts"
    __table_args__ = (
        # 每条需求下每种类型只有一份活跃产物
        UniqueConstraint("requirement_id", "type", name="uq_artifacts_requirement_type"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    requirement_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("requirements.id"), nullable=False
    )
    type: Mapped[str] = mapped_column(
        Enum("spec", "plan", "tasks", name="artifact_type"), nullable=False
    )
    file_path: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_now, onupdate=_now
    )
