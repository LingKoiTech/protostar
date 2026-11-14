from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class WorkerRegisterResponse(BaseModel):
    worker_session_id: UUID
    token: str


class WorkerTaskResponse(BaseModel):
    run_id: UUID
    task_ref: str
    tasks_approval_id: UUID
    command: str


class WorkerRunUpdate(BaseModel):
    model: Optional[str] = None
    session_id: Optional[str] = None
    work_dir: Optional[str] = None


class WorkerOutputCreate(BaseModel):
    stdout: Optional[str] = None
    stderr: Optional[str] = None
    exit_code: Optional[int] = None
    failure_reason: Optional[str] = None


class WorkerOutputResponse(BaseModel):
    run_id: UUID
    status: str
