from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from app.database import async_session_factory
from app.models.worker_session import WorkerSession
from app.schemas.health import HealthResponse

router = APIRouter()


async def _get_db() -> AsyncSession:
    async with async_session_factory() as session:
        yield session


@router.get("/health", response_model=HealthResponse)
async def health(db: AsyncSession = Depends(_get_db)) -> HealthResponse:
    # DB 连接探测
    db_status = "ok"
    try:
        await db.execute(text("SELECT 1"))
    except Exception:
        db_status = "error"

    # worker 最近心跳
    worker_last_seen: str | None = None
    try:
        result = await db.execute(
            select(WorkerSession.last_heartbeat_at)
            .where(WorkerSession.last_heartbeat_at.is_not(None))
            .order_by(WorkerSession.last_heartbeat_at.desc())
            .limit(1)
        )
        row = result.scalar_one_or_none()
        if row is not None:
            worker_last_seen = row.isoformat()
    except Exception:
        pass

    return HealthResponse(
        status="ok" if db_status == "ok" else "error",
        db=db_status,
        worker_last_seen=worker_last_seen,
    )
