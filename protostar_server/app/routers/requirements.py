from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update as sa_update
from app.database import async_session_factory
from app.models.requirement import Requirement
from app.models.project import Project
from app.models.local_user import LocalUser
from app.deps import get_current_user
from app.schemas.requirements import RequirementCreate, RequirementResponse, RequirementPatch, _to_response
import uuid

router = APIRouter()


async def _get_db() -> AsyncSession:
    async with async_session_factory() as session:
        yield session


async def _get_default_project(db: AsyncSession) -> Project:
    result = await db.execute(select(Project).where(Project.name == "default"))
    project = result.scalar_one_or_none()
    if project is None:
        raise HTTPException(status_code=503, detail="Default project not initialized")
    return project


@router.post("/requirements", status_code=201, response_model=RequirementResponse)
async def create_requirement(
    body: RequirementCreate,
    db: AsyncSession = Depends(_get_db),
    user: LocalUser = Depends(get_current_user),
) -> RequirementResponse:
    if not body.title.strip():
        raise HTTPException(status_code=400, detail="title must not be empty")
    if not body.scope.strip():
        raise HTTPException(status_code=400, detail="scope must not be empty")

    VALID_TYPES = {"feature", "bug", "improvement", "research"}
    VALID_PRIORITIES = {"P0", "P1", "P2"}
    if body.type not in VALID_TYPES:
        raise HTTPException(status_code=400, detail=f"type must be one of {VALID_TYPES}")
    if body.priority not in VALID_PRIORITIES:
        raise HTTPException(status_code=400, detail=f"priority must be one of {VALID_PRIORITIES}")

    project = await _get_default_project(db)

    result = await db.execute(
        sa_update(Project)
        .where(Project.id == project.id)
        .values(next_requirement_number=Project.next_requirement_number + 1)
        .returning(Project.next_requirement_number)
    )
    seq = result.scalar_one()
    req = Requirement(
        title=body.title.strip(),
        scope=body.scope.strip(),
        project_id=project.id,
        seq_number=seq,
        type=body.type,
        priority=body.priority,
    )
    db.add(req)
    await db.commit()
    await db.refresh(req)
    await db.refresh(project)
    return _to_response(req, project)


@router.get("/requirements", response_model=list[RequirementResponse])
async def list_requirements(
    db: AsyncSession = Depends(_get_db),
    user: LocalUser = Depends(get_current_user),
    type: str | None = None,
    priority: str | None = None,
) -> list[RequirementResponse]:
    project = await _get_default_project(db)
    query = select(Requirement).where(Requirement.project_id == project.id)
    if type is not None:
        query = query.where(Requirement.type == type)
    if priority is not None:
        query = query.where(Requirement.priority == priority)
    query = query.order_by(Requirement.seq_number.asc()).limit(200)
    result = await db.execute(query)
    reqs = result.scalars().all()
    return [_to_response(r, project) for r in reqs]


@router.get("/requirements/{id_or_display}", response_model=RequirementResponse)
async def get_requirement(
    id_or_display: str,
    db: AsyncSession = Depends(_get_db),
    user: LocalUser = Depends(get_current_user),
) -> RequirementResponse:
    import re
    project = await _get_default_project(db)
    if re.fullmatch(r"[A-Z]+-\d+", id_or_display):
        seq = int(id_or_display.split("-", 1)[1])
        result = await db.execute(
            select(Requirement).where(
                Requirement.project_id == project.id,
                Requirement.seq_number == seq,
            )
        )
        req = result.scalar_one_or_none()
        if req is None:
            raise HTTPException(status_code=404, detail="Requirement not found")
    else:
        try:
            req_id = uuid.UUID(id_or_display)
        except ValueError:
            raise HTTPException(status_code=422, detail="Invalid requirement id format")
        result = await db.execute(select(Requirement).where(Requirement.id == req_id))
        req = result.scalar_one_or_none()
        if req is None:
            raise HTTPException(status_code=404, detail="Requirement not found")
    return _to_response(req, project)


@router.patch("/requirements/{id_or_display}", response_model=RequirementResponse)
async def patch_requirement(
    id_or_display: str,
    body: RequirementPatch,
    db: AsyncSession = Depends(_get_db),
    user: LocalUser = Depends(get_current_user),
) -> RequirementResponse:
    import re
    VALID_TYPES = {"feature", "bug", "improvement", "research"}
    VALID_PRIORITIES = {"P0", "P1", "P2"}
    if body.type is not None and body.type not in VALID_TYPES:
        raise HTTPException(status_code=400, detail=f"type must be one of {VALID_TYPES}")
    if body.priority is not None and body.priority not in VALID_PRIORITIES:
        raise HTTPException(status_code=400, detail=f"priority must be one of {VALID_PRIORITIES}")

    project = await _get_default_project(db)
    if re.fullmatch(r"[A-Z]+-\d+", id_or_display):
        seq = int(id_or_display.split("-", 1)[1])
        result = await db.execute(
            select(Requirement).where(
                Requirement.project_id == project.id,
                Requirement.seq_number == seq,
            )
        )
        req = result.scalar_one_or_none()
        if req is None:
            raise HTTPException(status_code=404, detail="Requirement not found")
    else:
        try:
            req_id = uuid.UUID(id_or_display)
        except ValueError:
            raise HTTPException(status_code=422, detail="Invalid requirement id format")
        result = await db.execute(select(Requirement).where(Requirement.id == req_id))
        req = result.scalar_one_or_none()
        if req is None:
            raise HTTPException(status_code=404, detail="Requirement not found")

    if body.title is not None:
        req.title = body.title.strip()
    if body.scope is not None:
        req.scope = body.scope.strip()
    if body.type is not None:
        req.type = body.type
    if body.priority is not None:
        req.priority = body.priority

    await db.commit()
    await db.refresh(req)
    await db.refresh(project)
    return _to_response(req, project)
