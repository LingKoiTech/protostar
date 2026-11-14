from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone
from typing import Optional
from app.database import async_session_factory
from app.models.worker_session import WorkerSession
from app.models.run import Run
from app.models.run_output import RunOutput
from app.models.approval_record import ApprovalRecord
from app.schemas.worker import (
    WorkerRegisterResponse,
    WorkerTaskResponse,
    WorkerRunUpdate,
    WorkerOutputCreate,
    WorkerOutputResponse,
)
import bcrypt
import secrets
import sys
import uuid
from pathlib import Path

router = APIRouter()

_OUTPUT_LIMIT = 8192

# 002-healthcheck 的可执行脚本（server 侧解析为真实命令下发给 worker）
_HEALTHCHECK_SCRIPT = Path(__file__).resolve().parents[2] / "scripts" / "healthcheck_task.py"


def _resolve_command(task_ref: str) -> str:
    """把 task_ref 解析为 worker 可直接执行的命令。

    command 字符串由 worker 用 shlex.split 拆分后交给 subprocess，
    因此路径统一用正斜杠并用双引号包裹，兼容 Windows 路径中的空格。
    """
    if task_ref == "002-healthcheck":
        python = Path(sys.executable).as_posix()
        script = _HEALTHCHECK_SCRIPT.as_posix()
        return f'"{python}" "{script}"'
    return task_ref


async def _get_db() -> AsyncSession:
    async with async_session_factory() as session:
        yield session


async def _verify_worker(authorization: Optional[str], db: AsyncSession) -> WorkerSession:
    if authorization is None or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Worker token required")
    token = authorization.removeprefix("Bearer ").strip()
    result = await db.execute(select(WorkerSession))
    for ws in result.scalars().all():
        if bcrypt.checkpw(token.encode(), ws.token_hash.encode()):
            return ws
    raise HTTPException(status_code=401, detail="Invalid worker token")


@router.post("/worker/register", status_code=201, response_model=WorkerRegisterResponse)
async def worker_register(db: AsyncSession = Depends(_get_db)) -> WorkerRegisterResponse:
    # 002 单 worker 约束
    result = await db.execute(select(WorkerSession))
    if result.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="Worker already registered")

    token = secrets.token_urlsafe(32)
    token_hash = bcrypt.hashpw(token.encode(), bcrypt.gensalt()).decode()
    ws = WorkerSession(token_hash=token_hash)
    db.add(ws)
    await db.commit()
    await db.refresh(ws)
    return WorkerRegisterResponse(worker_session_id=ws.id, token=token)


@router.post("/worker/heartbeat")
async def worker_heartbeat(
    authorization: Optional[str] = Header(default=None),
    db: AsyncSession = Depends(_get_db),
) -> dict:
    ws = await _verify_worker(authorization, db)
    ws.last_heartbeat_at = datetime.now(timezone.utc)
    await db.commit()
    return {"ok": True}


@router.get("/worker/tasks/next")
async def tasks_next(
    authorization: Optional[str] = Header(default=None),
    db: AsyncSession = Depends(_get_db),
):
    """领取下一个待执行的 Run（FR-009：SELECT FOR UPDATE 保证唯一领取）。"""
    await _verify_worker(authorization, db)

    # SELECT FOR UPDATE SKIP LOCKED：领取尚未开始执行（work_dir 为 None 或 __pending__）的 running Run
    result = await db.execute(
        select(Run)
        .where(Run.status == "running", Run.work_dir.is_(None))
        .with_for_update(skip_locked=True)
        .limit(1)
    )
    run = result.scalar_one_or_none()
    if run is None:
        # 若存在任何 running Run（SKIP LOCKED 跳过了它），说明已被其他 worker 占用 → 409（FR-009）
        # 若完全没有 running Run → 204
        any_running = await db.execute(
            select(Run).where(Run.status == "running").limit(1)
        )
        if any_running.scalar_one_or_none() is not None:
            raise HTTPException(status_code=409, detail="A running task already exists")
        return Response(status_code=204)

    # 标记已领取（占位 work_dir）
    run.work_dir = "__pending__"
    await db.commit()
    await db.refresh(run)

    # 把 task_ref 解析为 worker 可直接执行的命令（002-healthcheck → python + 脚本绝对路径）
    return {
        "run_id": str(run.id),
        "task_ref": run.task_ref,
        "tasks_approval_id": str(run.tasks_approval_id),
        "command": _resolve_command(run.task_ref),
    }


@router.patch("/worker/runs/{run_id}")
async def update_run(
    run_id: uuid.UUID,
    body: WorkerRunUpdate,
    authorization: Optional[str] = Header(default=None),
    db: AsyncSession = Depends(_get_db),
) -> dict:
    ws = await _verify_worker(authorization, db)
    result = await db.execute(select(Run).where(Run.id == run_id))
    run = result.scalar_one_or_none()
    if run is None:
        raise HTTPException(status_code=404, detail="Run not found")
    if body.model is not None:
        run.model = body.model
    if body.session_id is not None:
        run.session_id = body.session_id
    if body.work_dir is not None:
        run.work_dir = body.work_dir
    await db.commit()
    return {"ok": True}


@router.post("/worker/runs/{run_id}/output", status_code=201, response_model=WorkerOutputResponse)
async def submit_output(
    run_id: uuid.UUID,
    body: WorkerOutputCreate,
    authorization: Optional[str] = Header(default=None),
    db: AsyncSession = Depends(_get_db),
) -> WorkerOutputResponse:
    await _verify_worker(authorization, db)

    result = await db.execute(select(Run).where(Run.id == run_id))
    run = result.scalar_one_or_none()
    if run is None:
        raise HTTPException(status_code=404, detail="Run not found")

    # 重复写入检查
    existing = await db.execute(select(RunOutput).where(RunOutput.run_id == run_id))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="Output already submitted for this run")

    # 有界截断 ≤8KB（FR-007）
    def _truncate(s: Optional[str]) -> Optional[str]:
        if s is None:
            return None
        encoded = s.encode("utf-8")
        if len(encoded) > _OUTPUT_LIMIT:
            return encoded[:_OUTPUT_LIMIT].decode("utf-8", errors="replace") + "\n[truncated]"
        return s

    output = RunOutput(
        run_id=run_id,
        stdout=_truncate(body.stdout),
        stderr=_truncate(body.stderr),
        exit_code=body.exit_code,
        failure_reason=body.failure_reason,
    )
    db.add(output)

    # 更新 Run 状态
    if body.exit_code == 0:
        run.status = "completed"
    else:
        run.status = "failed"
    run.finished_at = datetime.now(timezone.utc)

    try:
        await db.commit()
        await db.refresh(output)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Output already submitted")

    return WorkerOutputResponse(run_id=run_id, status=run.status)
