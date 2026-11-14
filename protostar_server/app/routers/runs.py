from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from app.database import async_session_factory
from app.models.run import Run
from app.models.run_output import RunOutput
from app.models.approval_record import ApprovalRecord
from app.models.artifact import Artifact
from app.models.local_user import LocalUser
from app.deps import get_current_user
from app.schemas.runs import RunCreate, RunResponse, RunOutputResponse
import uuid

router = APIRouter()

_OUTPUT_LIMIT = 8192


async def _get_db() -> AsyncSession:
    async with async_session_factory() as session:
        yield session


@router.post("/runs", status_code=201, response_model=RunResponse)
async def create_run(
    body: RunCreate,
    db: AsyncSession = Depends(_get_db),
    user: LocalUser = Depends(get_current_user),
) -> RunResponse:
    # 确认 tasks_approval_id 存在且 decision=approved
    result = await db.execute(
        select(ApprovalRecord).where(ApprovalRecord.id == body.tasks_approval_id)
    )
    approval = result.scalar_one_or_none()
    if approval is None or approval.decision != "approved":
        raise HTTPException(status_code=403, detail="tasks must be approved before starting a run")

    # 确认对应 artifact 类型为 tasks（FR-005）
    result = await db.execute(select(Artifact).where(Artifact.id == approval.artifact_id))
    artifact = result.scalar_one_or_none()
    if artifact is None or artifact.type != "tasks":
        raise HTTPException(status_code=403, detail="Approval must reference a tasks artifact")

    run = Run(
        task_ref=body.task_ref,
        tasks_approval_id=body.tasks_approval_id,
    )
    db.add(run)
    try:
        await db.commit()
        await db.refresh(run)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="A run for this task_ref is already running")

    return RunResponse.model_validate(run)


@router.get("/runs", response_model=list[RunResponse])
async def list_runs(
    db: AsyncSession = Depends(_get_db),
    user: LocalUser = Depends(get_current_user),
) -> list[RunResponse]:
    result = await db.execute(select(Run).order_by(Run.started_at.desc()).limit(100))
    return [RunResponse.model_validate(r) for r in result.scalars().all()]


@router.get("/runs/{run_id}", response_model=RunResponse)
async def get_run(
    run_id: uuid.UUID,
    db: AsyncSession = Depends(_get_db),
    user: LocalUser = Depends(get_current_user),
) -> RunResponse:
    result = await db.execute(select(Run).where(Run.id == run_id))
    run = result.scalar_one_or_none()
    if run is None:
        raise HTTPException(status_code=404, detail="Run not found")
    return RunResponse.model_validate(run)


@router.get("/runs/{run_id}/output", response_model=RunOutputResponse)
async def get_run_output(
    run_id: uuid.UUID,
    db: AsyncSession = Depends(_get_db),
    user: LocalUser = Depends(get_current_user),
) -> RunOutputResponse:
    result = await db.execute(select(RunOutput).where(RunOutput.run_id == run_id))
    output = result.scalar_one_or_none()
    if output is None:
        raise HTTPException(status_code=404, detail="Run output not found")
    return RunOutputResponse.model_validate(output)
