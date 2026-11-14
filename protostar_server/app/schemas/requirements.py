from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Literal, Optional
from uuid import UUID

from pydantic import BaseModel

if TYPE_CHECKING:
    from app.models.requirement import Requirement
    from app.models.project import Project


class RequirementCreate(BaseModel):
    title: str
    scope: str
    type: str = "feature"
    priority: str = "P2"


class RequirementResponse(BaseModel):
    id: UUID
    title: str
    scope: str
    status: Literal["active", "closed"]
    project_id: UUID
    created_at: datetime
    updated_at: datetime
    seq_number: int
    display_number: str
    type: str
    priority: str

    model_config = {"from_attributes": True}


class RequirementPatch(BaseModel):
    title: Optional[str] = None
    scope: Optional[str] = None
    type: Optional[str] = None
    priority: Optional[str] = None


def _to_response(req: "Requirement", project: "Project") -> RequirementResponse:
    return RequirementResponse(
        id=req.id,
        title=req.title,
        scope=req.scope,
        status=req.status,
        project_id=req.project_id,
        created_at=req.created_at,
        updated_at=req.updated_at,
        seq_number=req.seq_number,
        display_number=f"{project.code}-{req.seq_number}",
        type=req.type,
        priority=req.priority,
    )
