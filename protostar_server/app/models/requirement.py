import uuid
from datetime import datetime, timezone
from typing import Literal
from sqlalchemy import String, DateTime, ForeignKey, Enum, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base

RequirementStatus = Literal["active", "closed"]


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Requirement(Base):
    __tablename__ = "requirements"
    __table_args__ = (
        UniqueConstraint("project_id", "seq_number", name="uq_requirements_project_seq"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String, nullable=False)
    scope: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(
        Enum("active", "closed", name="requirement_status"),
        nullable=False,
        default="active",
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id"), nullable=False
    )
    seq_number: Mapped[int] = mapped_column(Integer, nullable=False)
    type: Mapped[str] = mapped_column(
        Enum("feature", "bug", "improvement", "research", name="requirement_type", create_type=False),
        nullable=False,
        default="feature",
    )
    priority: Mapped[str] = mapped_column(
        Enum("P0", "P1", "P2", name="requirement_priority", create_type=False),
        nullable=False,
        default="P2",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_now, onupdate=_now
    )
