import asyncio
import os
import sys
import uuid

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

# psycopg3 async requires SelectorEventLoop on Windows
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# ── engine & session ──────────────────────────────────────────────────────────

TEST_DB_URL = os.environ["DATABASE_URL"]

test_engine = create_async_engine(TEST_DB_URL, echo=False)
test_session_factory = async_sessionmaker(test_engine, expire_on_commit=False)


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_schema():
    """Ensure schema exists (alembic upgrade head must have been run first)."""
    async with test_engine.connect() as conn:
        await conn.execute(text("SELECT 1"))
    yield
    await test_engine.dispose()


@pytest_asyncio.fixture(autouse=True)
async def clean_tables():
    """Truncate all data tables before each test."""
    async with test_engine.begin() as conn:
        await conn.execute(text(
            "TRUNCATE run_outputs, runs, approval_records, artifacts, "
            "requirements, sessions, worker_sessions, local_users, projects "
            "RESTART IDENTITY CASCADE"
        ))
    yield


@pytest_asyncio.fixture
async def db() -> AsyncSession:
    async with test_session_factory() as session:
        yield session


@pytest_asyncio.fixture
async def client():
    # Override the app's DB with the test DB
    import app.database as db_module
    db_module.async_session_factory = test_session_factory

    from app.main import app
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture
async def seeded(db):
    """Seed default project and admin user."""
    import bcrypt
    from app.models import Project, LocalUser

    pw = "testpw"
    pw_hash = bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()
    project = Project(name="default")
    db.add(project)
    await db.flush()
    user = LocalUser(username="admin", password_hash=pw_hash)
    db.add(user)
    await db.commit()
    return {"project_id": project.id, "user_id": user.id, "password": pw}


@pytest_asyncio.fixture
async def session_cookie(client, seeded):
    """Log in and return cookie string."""
    res = await client.post("/api/v1/auth/login",
                            json={"username": "admin", "password": seeded["password"]})
    assert res.status_code == 200
    cookie = res.cookies.get("ps_session")
    assert cookie is not None
    return f"ps_session={cookie}"


@pytest_asyncio.fixture
async def worker_token(client):
    """Register a worker and return Bearer token."""
    res = await client.post("/api/v1/worker/register")
    assert res.status_code == 201
    return res.json()["token"]


@pytest_asyncio.fixture
async def active_requirement(client, session_cookie, seeded):
    res = await client.post("/api/v1/requirements",
                            json={"title": "test req", "scope": "scope"},
                            headers={"Cookie": session_cookie})
    assert res.status_code == 201
    return res.json()


@pytest_asyncio.fixture
async def approved_spec(client, session_cookie, active_requirement):
    req_id = active_requirement["id"]
    r = await client.put(f"/api/v1/artifacts/spec",
                         json={"requirement_id": req_id,
                               "file_path": "specs/002/spec.md"},
                         headers={"Cookie": session_cookie})
    assert r.status_code in (200, 201)
    art_id = r.json()["id"]
    r2 = await client.post("/api/v1/approvals",
                           json={"artifact_id": art_id, "decision": "approved"},
                           headers={"Cookie": session_cookie})
    assert r2.status_code == 201
    return {"artifact_id": art_id, "approval_id": r2.json()["id"]}


@pytest_asyncio.fixture
async def approved_plan(client, session_cookie, active_requirement, approved_spec):
    req_id = active_requirement["id"]
    r = await client.put("/api/v1/artifacts/plan",
                         json={"requirement_id": req_id,
                               "file_path": "specs/002/plan.md"},
                         headers={"Cookie": session_cookie})
    assert r.status_code in (200, 201)
    art_id = r.json()["id"]
    r2 = await client.post("/api/v1/approvals",
                           json={"artifact_id": art_id, "decision": "approved"},
                           headers={"Cookie": session_cookie})
    assert r2.status_code == 201
    return {"artifact_id": art_id, "approval_id": r2.json()["id"]}


@pytest_asyncio.fixture
async def approved_tasks(client, session_cookie, active_requirement, approved_plan):
    req_id = active_requirement["id"]
    r = await client.put("/api/v1/artifacts/tasks",
                         json={"requirement_id": req_id,
                               "file_path": "specs/002/tasks.md"},
                         headers={"Cookie": session_cookie})
    assert r.status_code in (200, 201)
    art_id = r.json()["id"]
    r2 = await client.post("/api/v1/approvals",
                           json={"artifact_id": art_id, "decision": "approved"},
                           headers={"Cookie": session_cookie})
    assert r2.status_code == 201
    return {"artifact_id": art_id, "approval_id": r2.json()["id"]}
