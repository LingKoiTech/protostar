import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


class ApprovalRecord(Base):
    __tablename__ = "approval_records"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    artifact_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("artifacts.id"), nullable=False
    )
    # approver 由 server 从有效 Session 解析后写入，不由客户端传入（FR-004）
    approver: Mapped[str] = mapped_column(String, nullable=False)
    decided_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_now
    )
    decision: Mapped[str] = mapped_column(
        Enum("approved", "rejected", name="approval_decision"), nullable=False
    )
