"""
启动 002 最小闭环服务：同一进程内拉起 pgserver（保持存活）+ alembic + seed + uvicorn。

用法：.venv/Scripts/python.exe bootstrap_server.py
（不要用 uv / os.execv；uvicorn.run 阻塞在本进程，pgserver 句柄因此不会被提前回收）

监听地址固定 127.0.0.1:8000（T027 / SC-004：仅 loopback 可达）。
"""
import os
import pathlib
import subprocess
import sys
import asyncio

REPO = pathlib.Path(__file__).resolve().parent
SRVDIR = REPO / "protostar_server"
VENV_PY = REPO / ".venv" / "Scripts" / "python.exe"
PGDATA = pathlib.Path("C:/protostar-pgdata")
HOST = "127.0.0.1"
PORT = 8000

# psycopg 异步连接在 Windows 上需要 SelectorEventLoop（Proactor 不支持其等待机制）；
# 必须在 uvicorn 创建事件循环之前设置，app.main 里的同样设置来得太晚。
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

import pgserver  # noqa: E402  (必须在 venv 内运行)

pg = pgserver.get_server(pgdata=PGDATA, cleanup_mode="stop")

# 确保 protostar_dev 存在（重复创建视为成功）
import psycopg  # noqa: E402

try:
    with psycopg.connect(pg.get_uri(), autocommit=True) as conn:
        conn.execute("CREATE DATABASE protostar_dev")
    print("protostar_dev created", flush=True)
except psycopg.errors.DuplicateDatabase:
    print("protostar_dev already exists", flush=True)

db_uri = pg.get_uri("protostar_dev").replace(
    "postgresql://", "postgresql+psycopg://"
)

os.environ.setdefault("DATABASE_URL", db_uri)
# 安全关键变量：缺省时报错退出，不使用弱默认值
for _var in ("ADMIN_PASSWORD", "SECRET_KEY", "WORKER_BEARER_TOKEN"):
    if not os.environ.get(_var):
        print(f"ERROR: {_var} not set. Load .env before running this script.", file=sys.stderr)
        sys.exit(1)

print(f"pgserver ready: {pg.get_uri()}", flush=True)
print(f"DATABASE_URL={db_uri}", flush=True)

print("=== alembic upgrade head ===", flush=True)
subprocess.run(
    [str(VENV_PY), "-m", "alembic", "upgrade", "head"],
    cwd=str(SRVDIR),
    check=True,
)

print("=== seed ===", flush=True)
subprocess.run(
    [str(VENV_PY), "-m", "app.seed"],
    cwd=str(SRVDIR),
    check=True,
)

# seed 只在首次创建 admin 时写密码；重复启动时把密码对齐到当前 ADMIN_PASSWORD，
# 保证本地验收环境的登录凭据确定。
_ADMIN_RESET = """
import asyncio, bcrypt, os, selectors

loop = asyncio.SelectorEventLoop(selectors.SelectSelector())

async def main():
    from sqlalchemy import select
    from app.database import async_session_factory
    from app.models.local_user import LocalUser
    async with async_session_factory() as db:
        user = (
            await db.execute(select(LocalUser).where(LocalUser.username == "admin"))
        ).scalar_one_or_none()
        if user is not None:
            user.password_hash = bcrypt.hashpw(
                os.environ["ADMIN_PASSWORD"].encode(), bcrypt.gensalt()
            ).decode()
            await db.commit()
            print("admin password reset")

loop.run_until_complete(main())
loop.close()
"""

print("=== reset admin password ===", flush=True)
# 仅对本机 pgserver（127.0.0.1）执行密码重置；外部数据库不无条件覆盖 admin 口令
_db_url = os.environ.get("DATABASE_URL", "")
if "127.0.0.1" in _db_url or "localhost" in _db_url:
    subprocess.run([str(VENV_PY), "-c", _ADMIN_RESET], cwd=str(SRVDIR), check=True)
else:
    print("非本机数据库，跳过 admin 密码重置（由运维显式管理）", flush=True)

sys.path.insert(0, str(SRVDIR))

import uvicorn  # noqa: E402


class _SelectorLoopConfig(uvicorn.Config):
    """uvicorn 0.54 在 win32 硬编码 ProactorEventLoop，psycopg 异步无法在其上运行。"""

    def get_loop_factory(self):
        return asyncio.SelectorEventLoop


config = _SelectorLoopConfig(
    "app.main:app", host=HOST, port=PORT, loop="asyncio", log_level="info"
)

print(f"=== uvicorn on http://{HOST}:{PORT} ===", flush=True)
uvicorn.Server(config).run()
