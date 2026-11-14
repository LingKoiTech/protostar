from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import async_session_factory
from app.models.approval_record import ApprovalRecord
from app.models.artifact import Artifact
from app.models.local_user import LocalUser
from app.deps import get_current_user
from app.schemas.approvals import ApprovalCreate, ApprovalResponse, RequirementApprovalState
import uuid

router = APIRouter()

_APPROVAL_ORDER = ["spec", "plan", "tasks"]


async def _get_db() -> AsyncSession:
    async with async_session_factory() as session:
        yield session


@router.post("/approvals", status_code=201, response_model=ApprovalResponse)
async def create_approval(
    body: ApprovalCreate,
    db: AsyncSession = Depends(_get_db),
    user: LocalUser = Depends(get_current_user),
) -> ApprovalResponse:
    # 查 artifact
    result = await db.execute(select(Artifact).where(Artifact.id == body.artifact_id))
    artifact = result.scalar_one_or_none()
    if artifact is None:
        raise HTTPException(status_code=404, detail="Artifact not found")

    artifact_type = artifact.type
    idx = _APPROVAL_ORDER.index(artifact_type)

    # 顺序检查：前置 artifact 必须已 approved（FR-003）
    for prereq_type in _APPROVAL_ORDER[:idx]:
        prereq_result = await db.execute(
            select(Artifact).where(
                Artifact.requirement_id == artifact.requirement_id,
                Artifact.type == prereq_type,
            )
        )
        prereq = prereq_result.scalar_one_or_none()
        if prereq is None:
            raise HTTPException(
                status_code=403,
                detail=f"{prereq_type} artifact must exist before approving {artifact_type}",
            )
        approved_result = await db.execute(
            select(ApprovalRecord).where(
                ApprovalRecord.artifact_id == prereq.id,
                ApprovalRecord.decision == "approved",
            )
        )
        if approved_result.scalar_one_or_none() is None:
            raise HTTPException(
                status_code=403,
                detail=f"{prereq_type} must be approved before approving {artifact_type}",
            )

    record = ApprovalRecord(
        artifact_id=artifact.id,
        approver=user.username,  # server 端写入，不接受客户端传值（FR-004）
        decision=body.decision,
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return ApprovalResponse.model_validate(record)


@router.get("/approvals", response_model=list[ApprovalResponse])
async def list_approvals(
    artifact_id: uuid.UUID,
    db: AsyncSession = Depends(_get_db),
    user: LocalUser = Depends(get_current_user),
) -> list[ApprovalResponse]:
    result = await db.execute(
        select(ApprovalRecord).where(ApprovalRecord.artifact_id == artifact_id)
    )
    records = result.scalars().all()
    return [ApprovalResponse.model_validate(r) for r in records]


@router.get("/approvals/by-requirement", response_model=RequirementApprovalState)
async def get_requirement_approval_state(
    requirement_id: uuid.UUID,
    db: AsyncSession = Depends(_get_db),
    user: LocalUser = Depends(get_current_user),
) -> RequirementApprovalState:
    state: dict = {"requirement_id": requirement_id, "spec": None, "plan": None, "tasks": None}

    for artifact_type in _APPROVAL_ORDER:
        artifact_result = await db.execute(
            select(Artifact).where(
                Artifact.requirement_id == requirement_id,
                Artifact.type == artifact_type,
            )
        )
        artifact = artifact_result.scalar_one_or_none()
        if artifact is None:
            continue

        approval_result = await db.execute(
            select(ApprovalRecord)
            .where(
                ApprovalRecord.artifact_id == artifact.id,
                ApprovalRecord.decision == "approved",
            )
            .order_by(ApprovalRecord.decided_at.desc())
            .limit(1)
        )
        record = approval_result.scalar_one_or_none()
        if record is not None:
            state[artifact_type] = ApprovalResponse.model_validate(record)

    return RequirementApprovalState(**state)
