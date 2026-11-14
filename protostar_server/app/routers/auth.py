from fastapi import APIRouter, Cookie, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone, timedelta
from app.database import async_session_factory
from app.models.local_user import LocalUser
from app.models.session import Session
from app.schemas.auth import LoginRequest, LoginResponse
from typing import Optional
import bcrypt
import uuid

router = APIRouter()

_COOKIE_NAME = "ps_session"
_COOKIE_MAX_AGE = 60 * 60 * 24  # 24h


async def _get_db() -> AsyncSession:
    async with async_session_factory() as session:
        yield session


@router.post("/auth/login", response_model=LoginResponse)
async def login(
    body: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(_get_db),
) -> LoginResponse:
    result = await db.execute(
        select(LocalUser).where(LocalUser.username == body.username)
    )
    user = result.scalar_one_or_none()
    if user is None or not bcrypt.checkpw(
        body.password.encode(), user.password_hash.encode()
    ):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    session = Session(
        expires_at=datetime.now(timezone.utc) + timedelta(hours=24)
    )
    session.user_id = user.id
    db.add(session)
    await db.commit()

    response.set_cookie(
        key=_COOKIE_NAME,
        value=str(session.id),
        httponly=True,
        samesite="strict",
        path="/",
        max_age=_COOKIE_MAX_AGE,
    )
    return LoginResponse(ok=True)


@router.post("/auth/logout")
async def logout(
    response: Response,
    ps_session: Optional[str] = Cookie(default=None),
    db: AsyncSession = Depends(_get_db),
) -> dict:
    if ps_session:
        try:
            sid = uuid.UUID(ps_session)
            result = await db.execute(select(Session).where(Session.id == sid))
            s = result.scalar_one_or_none()
            if s:
                await db.delete(s)
                await db.commit()
        except (ValueError, Exception):
            pass
    response.delete_cookie(_COOKIE_NAME)
    return {"ok": True}
