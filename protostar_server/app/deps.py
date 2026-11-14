from fastapi import APIRouter, Cookie, Header, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID
from app.database import async_session_factory
from app.models.session import Session
from app.models.local_user import LocalUser
from app.models.worker_session import WorkerSession
import bcrypt


async def _get_db() -> AsyncSession:
    async with async_session_factory() as session:
        yield session


async def get_current_user(
    ps_session: Optional[str] = Cookie(default=None),
    db: AsyncSession = Depends(_get_db),
) -> LocalUser:
    """从 ps_session cookie 解析当前操作者；缺失/过期/无效 → 401。"""
    if ps_session is None:
        raise HTTPException(status_code=401, detail="Authentication required")
    try:
        session_id = UUID(ps_session)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid session token")

    result = await db.execute(
        select(Session).where(Session.id == session_id)
    )
    session = result.scalar_one_or_none()
    if session is None or session.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired or not found")

    result = await db.execute(
        select(LocalUser).where(LocalUser.id == session.user_id)
    )
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def get_worker_session(
    authorization: Optional[str] = Header(default=None),
    db: AsyncSession = Depends(_get_db),
) -> WorkerSession:
    """从 Authorization: Bearer 解析 worker 身份；缺失/无效 → 401。"""
    if authorization is None or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Worker token required")
    token = authorization.removeprefix("Bearer ").strip()

    # 对所有 WorkerSession 记录校验 token hash
    result = await db.execute(select(WorkerSession))
    sessions = result.scalars().all()
    for ws in sessions:
        if bcrypt.checkpw(token.encode(), ws.token_hash.encode()):
            return ws
    raise HTTPException(status_code=401, detail="Invalid worker token")
