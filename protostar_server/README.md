# protostar-server

FastAPI 服务端，管理需求、产物批准与运行记录。

## 用途

提供 REST API（`/api/v1`），支持本地会话认证、需求登记、spec/plan/tasks 顺序批准、运行启动与结果查询。绑定 `127.0.0.1`，不对外暴露。

## 环境变量

| 变量 | 必须 | 说明 |
|---|---|---|
| `DATABASE_URL` | ✓ | PostgreSQL 连接串，格式 `postgresql+psycopg://<user>:<pw>@<host>/<db>` |
| `ADMIN_PASSWORD` | 仅 seed 时 | 初始 admin 账户密码 |

## 依赖

- Python 3.11+
- FastAPI, SQLAlchemy 2 (async), psycopg3, Alembic, bcrypt, Uvicorn

## 数据库迁移

```bash
cd protostar_server
DATABASE_URL=postgresql+psycopg://localhost/protostar_dev uv run alembic upgrade head
```

`downgrade base` 再 `upgrade head` 可重复执行。

## 初始数据

```bash
DATABASE_URL=postgresql+psycopg://localhost/protostar_dev ADMIN_PASSWORD=<pw> uv run python -m app.seed
```

幂等，连跑两次不报错。

## 启动

```bash
DATABASE_URL=postgresql+psycopg://localhost/protostar_dev uv run uvicorn app.main:app --host 127.0.0.1 --port 8000
```

日志显示 `127.0.0.1:8000`，非 `0.0.0.0`（SC-004）。无 OIDC/OAuth 路由（FR-010）。
