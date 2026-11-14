import pgserver
import pathlib
import subprocess
import os
import sys
import time

pg = pgserver.get_server(pgdata=pathlib.Path(r'C:/protostar-pgdata'), cleanup_mode='stop')
base_uri = pg.get_uri()
db_uri = pg.get_uri('protostar_dev').replace('postgresql://', 'postgresql+psycopg://')
print(f'pgserver: {base_uri}', flush=True)

# 建库（忽略已存在）
r = subprocess.run(
    [sys.executable, '-c',
     f'import psycopg; c=psycopg.connect("{base_uri}",autocommit=True); c.execute("CREATE DATABASE protostar_dev"); c.close()'],
    capture_output=True, text=True
)
if r.returncode != 0 and 'already exists' not in r.stderr:
    print('CREATE DB error:', r.stderr, flush=True)
    sys.exit(1)

env = os.environ.copy()
env.setdefault('DATABASE_URL', db_uri)
# 安全关键变量：缺省时报错退出
for _var in ('ADMIN_PASSWORD', 'SECRET_KEY', 'WORKER_BEARER_TOKEN'):
    if not env.get(_var):
        print(f'ERROR: {_var} not set. Load .env before running this script.', file=sys.stderr)
        sys.exit(1)

# alembic upgrade
r2 = subprocess.run(['uv','run','--group','dev','alembic','upgrade','head'],
                    cwd=r'C:/Users/miao/Projects/LingKoiTech/protostar/protostar_server',
                    env=env, capture_output=True, text=True)
print('alembic:', r2.stdout.strip() or '(no output)', flush=True)
if r2.returncode != 0:
    print('alembic error:', r2.stderr[-500:], flush=True)
    sys.exit(1)

# seed
r3 = subprocess.run(['uv','run','python','-m','app.seed'],
                    cwd=r'C:/Users/miao/Projects/LingKoiTech/protostar/protostar_server',
                    env=env, capture_output=True, text=True)
print('seed:', r3.stdout.strip() or '(no output)', flush=True)

# start uvicorn (replaces this process)
print('Starting uvicorn on 127.0.0.1:8000...', flush=True)
os.environ.update(env)
os.execv(sys.executable,
         [sys.executable, '-m', 'uvicorn', 'app.main:app',
          '--host', '127.0.0.1', '--port', '8000'])
