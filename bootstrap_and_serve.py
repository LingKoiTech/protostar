"""
Bootstrap protostar_dev on a pgserver instance and start uvicorn.
Run with: C:\Users\miao\Projects\LingKoiTech\protostar\.venv\Scripts\python.exe bootstrap_and_serve.py
pgserver must already be installed in the venv (or via --with pgserver flag externally).
"""
import os
import pathlib
import subprocess
import sys

REPO    = pathlib.Path(__file__).parent
SRVDIR  = REPO / "protostar_server"
VENV_PY = REPO / ".venv" / "Scripts" / "python.exe"
PGDATA  = pathlib.Path("C:/protostar-pgdata")

# pgserver installed in venv? check
try:
    import pgserver
except ImportError:
    print("pgserver not in this venv; run: uv pip install pgserver (python 3.11)", file=sys.stderr)
    sys.exit(1)

pg = pgserver.get_server(pgdata=PGDATA, cleanup_mode="stop")
base_uri = pg.get_uri()
db_uri   = pg.get_uri("protostar_dev").replace("postgresql://", "postgresql+psycopg://")
print(f"pgserver running: {base_uri}", flush=True)

# create DB
import psycopg
try:
    c = psycopg.connect(base_uri, autocommit=True)
    c.execute("CREATE DATABASE protostar_dev")
    c.close()
    print("protostar_dev created", flush=True)
except psycopg.errors.DuplicateDatabase:
    print("protostar_dev already exists", flush=True)

env = os.environ.copy()
env.setdefault("DATABASE_URL",        db_uri)
# 安全关键变量：缺省时报错退出
for _var in ("ADMIN_PASSWORD", "SECRET_KEY", "WORKER_BEARER_TOKEN"):
    if not env.get(_var):
        print(f"ERROR: {_var} not set. Load .env before running this script.", file=sys.stderr)
        sys.exit(1)

VENV_BIN = REPO / ".venv" / "Scripts"
alembic  = VENV_BIN / "alembic.exe"
uvicorn  = VENV_BIN / "uvicorn.exe"

print("=== alembic upgrade head ===", flush=True)
r = subprocess.run([str(alembic), "upgrade", "head"],
                   cwd=str(SRVDIR), env=env, capture_output=False)
if r.returncode != 0:
    sys.exit(r.returncode)

print("=== seed ===", flush=True)
r = subprocess.run([str(VENV_PY), "-m", "app.seed"],
                   cwd=str(SRVDIR), env=env, capture_output=False)
if r.returncode != 0:
    sys.exit(r.returncode)

print("=== uvicorn on 127.0.0.1:8000 ===", flush=True)
# exec-replace so the process becomes uvicorn
os.execve(str(uvicorn),
          [str(uvicorn), "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
          env)
