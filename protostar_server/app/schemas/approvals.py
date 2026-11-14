from datetime import datetime
from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel


class ApprovalCreate(BaseModel):
    artifact_id: UUID
    decision: Literal["approved", "rejected"]


class ApprovalResponse(BaseModel):
    id: UUID
    artifact_id: UUID
    approver: str
    decided_at: datetime
    decision: Literal["approved", "rejected"]

    model_config = {"from_attributes": True}


class RequirementApprovalState(BaseModel):
    requirement_id: UUID
    spec: Optional[ApprovalResponse] = None
    plan: Optional[ApprovalResponse] = None
    tasks: Optional[ApprovalResponse] = None
