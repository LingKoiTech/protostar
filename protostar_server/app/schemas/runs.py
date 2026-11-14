from datetime import datetime
from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel


class RunCreate(BaseModel):
    task_ref: str
    tasks_approval_id: UUID


class RunResponse(BaseModel):
    id: UUID
    task_ref: str
    backend: str
    model: Optional[str] = None
    session_id: Optional[str] = None
    work_dir: Optional[str] = None
    status: Literal["running", "completed", "failed"]
    started_at: datetime
    finished_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class RunOutputResponse(BaseModel):
    run_id: UUID
    stdout: Optional[str] = None
    stderr: Optional[str] = None
    exit_code: Optional[int] = None
    failure_reason: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
