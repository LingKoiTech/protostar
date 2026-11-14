from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from app.database import async_session_factory
from app.models.artifact import Artifact
from app.models.requirement import Requirement
from app.models.local_user import LocalUser
from app.deps import get_current_user
from app.schemas.artifacts import ArtifactUpsert, ArtifactResponse
import uuid

router = APIRouter()

_VALID_TYPES = {"spec", "plan", "tasks"}


async def _get_db() -> AsyncSession:
    async with async_session_factory() as session:
        yield session


@router.put("/artifacts/{artifact_type}", response_model=ArtifactResponse)
async def upsert_artifact(
    artifact_type: str,
    body: ArtifactUpsert,
    db: AsyncSession = Depends(_get_db),
    user: LocalUser = Depends(get_current_user),
) -> ArtifactResponse:
    if artifact_type not in _VALID_TYPES:
        raise HTTPException(status_code=400, detail=f"type must be one of {_VALID_TYPES}")

    result = await db.execute(
        select(Requirement).where(Requirement.id == body.requirement_id)
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Requirement not found")

    result = await db.execute(
        select(Artifact).where(
            Artifact.requirement_id == body.requirement_id,
            Artifact.type == artifact_type,
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        existing.file_path = body.file_path
        await db.commit()
        await db.refresh(existing)
        return ArtifactResponse.model_validate(existing)
    else:
        artifact = Artifact(
            requirement_id=body.requirement_id,
            type=artifact_type,
            file_path=body.file_path,
        )
        db.add(artifact)
        try:
            await db.commit()
            await db.refresh(artifact)
        except IntegrityError:
            await db.rollback()
            raise HTTPException(status_code=409, detail="Artifact conflict")
        return JSONResponse(
            content=ArtifactResponse.model_validate(artifact).model_dump(mode="json"),
            status_code=201,
        )


@router.get("/artifacts", response_model=list[ArtifactResponse])
async def list_artifacts_by_requirement(
    requirement_id: uuid.UUID,
    db: AsyncSession = Depends(_get_db),
    user: LocalUser = Depends(get_current_user),
) -> list[ArtifactResponse]:
    result = await db.execute(
        select(Artifact).where(Artifact.requirement_id == requirement_id)
    )
    artifacts = result.scalars().all()
    return [ArtifactResponse.model_validate(a) for a in artifacts]


@router.get("/artifacts/{artifact_type}", response_model=ArtifactResponse)
async def get_artifact(
    artifact_type: str,
    requirement_id: uuid.UUID,
    db: AsyncSession = Depends(_get_db),
    user: LocalUser = Depends(get_current_user),
) -> ArtifactResponse:
    if artifact_type not in _VALID_TYPES:
        raise HTTPException(status_code=400, detail=f"type must be one of {_VALID_TYPES}")

    result = await db.execute(
        select(Artifact).where(
            Artifact.requirement_id == requirement_id,
            Artifact.type == artifact_type,
        )
    )
    artifact = result.scalar_one_or_none()
    if artifact is None:
        raise HTTPException(status_code=404, detail="Artifact not found")
    return ArtifactResponse.model_validate(artifact)
