# Tasks: 最小自举构建循环

**Branch**: `002-minimum-bootstrap-loop` | **Date**: 2026-11-13
**Input**: `specs/002-minimum-bootstrap-loop/plan.md`（SHA `792b5de043ac94f8b61a86067c5e7244385d8f4173e88b86ed3afe560b8b9623`）
**Status**: 待审批。本文件是任务分解产物；不批准任何代码实施、合入或发布。任务只有在批准栏被人类填写后，才可作为启动运行的输入（FR-005）。

**输入文档**：`spec.md`、`plan.md`、`research.md`、`data-model.md`、`contracts/server-api.md`、`quickstart.md`。

**约束**：worker 侧仅使用 Python stdlib `subprocess` + `sqlite3` 管理进程与本地状态，调用 server 使用 stdlib `urllib.request`；`protostar_worker/pyproject.toml` 不引入任何第三方运行时依赖（含 HTTP 客户端库如 `httpx`、`requests`）。`protostar_server/pyproject.toml` 的测试依赖（`pytest`、`pytest-asyncio`、`httpx`）仅用于测试，不进入 worker。

---

## P1 Setup（项目初始化）

#### T001 创建三模块目录骨架与依赖配置

**Story**: Setup
**Files**:
- `pyproject.toml` — uv workspace root，管理 `protostar_server` 与 `protostar_worker` 两个 Python 包
- `protostar_server/pyproject.toml` — 运行时依赖：`fastapi`, `pydantic>=2`, `sqlalchemy[asyncio]>=2`, `psycopg[binary]>=3`, `alembic`, `bcrypt`, `uvicorn[standard]`；测试依赖组 `dev`：`pytest`, `pytest-asyncio`, `httpx`（仅测试用，供 T026 的 AsyncClient）
- `protostar_worker/pyproject.toml` — 无第三方运行时依赖；worker 使用 stdlib `subprocess`、`sqlite3`、`urllib.request`、`tempfile`；测试/开发依赖组留空
- `protostar_gui/package.json` — `next@14`, `react`, `react-dom`, `typescript`, `@types/react`, `@types/node`（无图表/流程图库）
- `protostar_gui/tsconfig.json` — Next.js App Router 默认配置

**Cmd**:
```bash
cd protostar_server && uv sync --all-groups
cd ../protostar_worker && uv sync
cd ../protostar_gui && npm install
```

**Verify**: `uv run --project protostar_server python -c "import fastapi, sqlalchemy, psycopg, alembic, bcrypt"` 退出码 0；`uv run --project protostar_worker python -c "import sqlite3, urllib.request, subprocess"` 退出码 0；`protostar_worker/pyproject.toml` 中 `dependencies` 为空数组且不含 `httpx`/`requests`

---

#### T002 配置 .gitignore

**Story**: Setup
**Files**:
- `.gitignore`（protostar 仓库根）— 排除 `local_state.db`、`.env`、`__pycache__/`、`*.pyc`、`node_modules/`、`.next/`、`*.egg-info/`、`.pytest_cache/`

**Cmd**:
```bash
git check-ignore -v protostar_worker/worker/local_state.db
```

**Verify**: 命令输出该路径及匹配规则行，退出码 0

---

## P2 Foundational（阻塞性基础，必须在 User Story 阶段前完成）

#### T003 实现 database.py

**Story**: Foundational
**Files**:
- `protostar_server/app/database.py` — SQLAlchemy 2.x async engine（`postgresql+psycopg://`，连接串从 `DATABASE_URL` 读取）；`async_session_factory`（`AsyncSession`）；`Base` declarative base

**Cmd**:
```bash
cd protostar_server && DATABASE_URL=postgresql+psycopg://localhost/protostar_dev uv run python -c "from app.database import async_engine, async_session_factory, Base; print('ok')"
```

**Verify**: 输出 `ok`，无 ImportError、无连接串硬编码

---

#### T004 实现基础支撑 ORM 模型（4 个）

**Story**: Foundational
**Files**:
- `protostar_server/app/models/__init__.py`
- `protostar_server/app/models/project.py` — `id` UUID PK、`name` TEXT NOT NULL（002 固定值 `default`）、`created_at` TIMESTAMPTZ NOT NULL
- `protostar_server/app/models/local_user.py` — `id` UUID PK、`username` TEXT UNIQUE NOT NULL、`password_hash` TEXT NOT NULL、`created_at` TIMESTAMPTZ NOT NULL
- `protostar_server/app/models/session.py` — `id` UUID PK（同时作 `ps_session` cookie token）、`user_id` UUID FK→LocalUser NOT NULL、`created_at` TIMESTAMPTZ NOT NULL、`expires_at` TIMESTAMPTZ NOT NULL（默认 24h）
- `protostar_server/app/models/worker_session.py` — `id` UUID PK、`token_hash` TEXT UNIQUE NOT NULL、`last_heartbeat_at` TIMESTAMPTZ nullable、`created_at` TIMESTAMPTZ NOT NULL

**Cmd**:
```bash
cd protostar_server && uv run python -c "from app.models.project import Project; from app.models.local_user import LocalUser; from app.models.session import Session; from app.models.worker_session import WorkerSession; print(Project.__tablename__, LocalUser.__tablename__, Session.__tablename__, WorkerSession.__tablename__)"
```

**Verify**: 输出 `projects local_users sessions worker_sessions`，无 ImportError

---

#### T005 实现业务 ORM 模型（5 个）

**Story**: Foundational
**Files**:
- `protostar_server/app/models/requirement.py` — `id`, `title` NOT NULL, `scope` NOT NULL, `status` ENUM(`active`/`closed`) DEFAULT `active`, `project_id` FK→Project NOT NULL, `created_at`, `updated_at`；局部唯一索引 `UNIQUE(project_id) WHERE status='active'`（FR-002）
- `protostar_server/app/models/artifact.py` — `id`, `requirement_id` FK NOT NULL, `type` ENUM(`spec`/`plan`/`tasks`) NOT NULL, `file_path` TEXT NOT NULL（相对路径，无本机绝对前缀）, `created_at`, `updated_at`；唯一约束 `UNIQUE(requirement_id, type)`
- `protostar_server/app/models/approval_record.py` — `id`, `artifact_id` FK NOT NULL, `approver` TEXT NOT NULL, `decided_at` TIMESTAMPTZ NOT NULL, `decision` ENUM(`approved`/`rejected`) NOT NULL（FR-004）
- `protostar_server/app/models/run.py` — `id`, `task_ref` TEXT NOT NULL, `tasks_approval_id` FK→ApprovalRecord NOT NULL, `backend` TEXT NOT NULL DEFAULT `omp`, `work_dir` TEXT nullable, `model` TEXT nullable, `session_id` TEXT nullable, `started_at` TIMESTAMPTZ NOT NULL, `finished_at` TIMESTAMPTZ nullable, `status` ENUM(`running`/`completed`/`failed`) DEFAULT `running`；局部唯一索引 `UNIQUE(task_ref) WHERE status='running'`（FR-009）
- `protostar_server/app/models/run_output.py` — `id`, `run_id` FK UNIQUE NOT NULL, `stdout` TEXT nullable, `stderr` TEXT nullable, `exit_code` INTEGER nullable, `failure_reason` TEXT nullable, `created_at` TIMESTAMPTZ NOT NULL（FR-007）

**Cmd**:
```bash
cd protostar_server && uv run python -c "from app.models.run import Run; from app.models.run_output import RunOutput; from app.models.requirement import Requirement; from app.models.artifact import Artifact; from app.models.approval_record import ApprovalRecord; print('ok')"
```

**Verify**: 输出 `ok`；`Requirement` 的 `__table_args__` 含 `status='active'` 局部唯一索引，`Run` 含 `status='running'` 局部唯一索引

---

#### T006 Alembic 配置与 initial migration

**Story**: Foundational
**Files**:
- `protostar_server/alembic.ini`
- `protostar_server/alembic/env.py` — 从 `app.database`/`app.models` 导入 `Base.metadata`；使用 `DATABASE_URL`
- `protostar_server/alembic/versions/<rev>_initial_schema.py` — 一次建全部九个表（projects、local_users、sessions、worker_sessions、requirements、artifacts、approval_records、runs、run_outputs），含 ENUM 类型与两条局部唯一索引；不保留空 migration

**Cmd**:
```bash
cd protostar_server && uv run alembic upgrade head && psql "$DATABASE_URL" -c '\dt'
```

**Verify**: `alembic upgrade head` 退出码 0；`\dt` 输出九个表名；`alembic downgrade base && alembic upgrade head` 可重复执行不报错

---

#### T007 实现 Pydantic v2 schemas

**Story**: Foundational
**Files**:
- `protostar_server/app/schemas/__init__.py`
- `protostar_server/app/schemas/auth.py` — `LoginRequest`、`LoginResponse`
- `protostar_server/app/schemas/requirements.py` — `RequirementCreate`、`RequirementResponse`
- `protostar_server/app/schemas/artifacts.py` — `ArtifactUpsert`、`ArtifactResponse`
- `protostar_server/app/schemas/approvals.py` — `ApprovalCreate`、`ApprovalResponse`
- `protostar_server/app/schemas/runs.py` — `RunCreate`、`RunResponse`、`RunOutputResponse`
- `protostar_server/app/schemas/worker.py` — `WorkerRegisterResponse`、`WorkerTaskResponse`、`WorkerRunUpdate`、`WorkerOutputCreate`、`WorkerOutputResponse`
- `protostar_server/app/schemas/health.py` — `HealthResponse`（`status`/`db`/`worker_last_seen`）

**Cmd**:
```bash
cd protostar_server && uv run python -c "from app.schemas import auth, requirements, artifacts, approvals, runs, worker, health; print('ok')"
```

**Verify**: 输出 `ok`；字段名与 `contracts/server-api.md` 各响应体一致（`type` 枚举限 `spec|plan|tasks`，`decision` 枚举限 `approved|rejected`）

---

#### T008 实现 FastAPI app 入口、路由挂载、seed 与 loopback 绑定

**Story**: Foundational
**Files**:
- `protostar_server/app/main.py` — FastAPI app，`/api/v1` prefix，挂载 health/auth/requirements/artifacts/approvals/runs/worker 七个 router；启动参数固定 `host="127.0.0.1"`（FR-001/SC-004）；不注册 OIDC/OAuth 路由（FR-010）
- `protostar_server/app/routers/__init__.py`
- `protostar_server/app/seed.py` — 幂等预建 default `Project` 与 `admin` `LocalUser`（密码从 `ADMIN_PASSWORD` 读取，bcrypt 存储）

**Cmd**:
```bash
cd protostar_server && uv run python -m app.seed && uv run uvicorn app.main:app --host 127.0.0.1 --port 8000
```

**Verify**: seed 连跑两次均退出码 0 且不重复插入；`curl http://127.0.0.1:8000/api/v1/health` 返回 JSON；`uvicorn` 日志显示 `127.0.0.1:8000` 而非 `0.0.0.0`

---

## P3 US1 — 启动最小系统（Priority: P1）

**Goal**: 四进程可启动，浏览器可打开页面并看到系统状态。
**Independent Test**: server/worker/GUI/PostgreSQL 启动后 `http://localhost:3000` 显示健康状态；非 loopback 不可达。

#### T009 实现 GET /health

**Story**: US1
**Files**:
- `protostar_server/app/routers/health.py` — 探测 PostgreSQL 连接（`ok`/`error`）；读取最新 `WorkerSession.last_heartbeat_at`；返回 `{"status": "ok"|"error", "db": "ok"|"error", "worker_last_seen": <iso8601>|null}`

**Cmd**:
```bash
curl -s http://127.0.0.1:8000/api/v1/health
```

**Verify**: 返回 200 且含 `status`、`db`、`worker_last_seen` 三字段；停掉 PostgreSQL 后 `db` 变为 `error` 且不返回 200 成功假象

---

#### T010 实现 POST /auth/login 与 POST /auth/logout（本地会话，无 OIDC）

**Story**: US1
**Files**:
- `protostar_server/app/routers/auth.py` — `POST /auth/login`：用户名密码 bcrypt 校验，写 `Session`（24h），`Set-Cookie: ps_session=<token>; HttpOnly; SameSite=Strict; Path=/`；`POST /auth/logout`：删除 Session 并清 cookie；无 OIDC 跳转
- `protostar_server/app/deps.py` — `get_current_user`（解析 `ps_session`，过期/缺失返回 401）、`get_worker_session`（解析 `Authorization: Bearer`）

**Cmd**:
```bash
curl -i -X POST http://127.0.0.1:8000/api/v1/auth/login -H 'Content-Type: application/json' -d '{"username":"admin","password":"<pw>"}'
curl -i -X POST http://127.0.0.1:8000/api/v1/auth/login -H 'Content-Type: application/json' -d '{"username":"admin","password":"wrong"}'
```

**Verify**: 正确密码返回 200 `{"ok":true}` 且响应头含 `Set-Cookie: ps_session=`；错误密码返回 401；无 `/auth/oidc`、`/auth/callback` 类路由

---

#### T011 实现 POST /worker/register 与 POST /worker/heartbeat

**Story**: US1
**Files**:
- `protostar_server/app/routers/worker.py`（注册与心跳部分）— `POST /worker/register`：无认证；生成 token（明文仅返回一次），只存 hash 于 `WorkerSession`；已有注册时 409（002 单 worker）；`POST /worker/heartbeat`：Bearer 校验，刷新 `last_heartbeat_at`

**Cmd**:
```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/worker/register
curl -s -X POST http://127.0.0.1:8000/api/v1/worker/heartbeat -H "Authorization: Bearer <token>"
```

**Verify**: register 返回 201 含 `worker_session_id` 与 `token`，重复调用返回 409；heartbeat 返回 200 `{"ok":true}`，随后 `GET /health` 的 `worker_last_seen` 为近期时间戳；`GET /health` 不再为 null

---

#### T012 实现 GUI 首页 app/page.tsx

**Story**: US1
**Files**:
- `protostar_gui/app/page.tsx` — 服务端读取 `http://127.0.0.1:8000/api/v1/health`（fetch，无额外 HTTP 库）；展示 server/db/worker 状态；任一进程缺失时显示具体缺失项，不显示空成功状态；仅含首页、需求、批准、运行链接，无组织/成员/OIDC 入口
- `protostar_gui/lib/api.ts` — fetch 基址封装（`NEXT_PUBLIC_SERVER_URL`，默认 `http://127.0.0.1:8000/api/v1`）

**Cmd**:
```bash
cd protostar_gui && npm run dev
curl -s http://localhost:3000 | grep -c 'worker'
```

**Verify**: 浏览器 `http://localhost:3000` 显示 db 与 worker 状态；停掉 server 后页面显示"server 不可达"而非成功状态

---

## P4 US2 — 登记需求（Priority: P1）

**Goal**: 操作者可创建并重新查询一条需求；同 project 只允许一条 active。
**Independent Test**: `POST /requirements` 后 `GET /requirements/{id}` 返回同一数据；第二次创建返回 409。

#### T013 实现 POST /requirements 与 GET /requirements/{id}

**Story**: US2
**Files**:
- `protostar_server/app/routers/requirements.py` — `POST /requirements`：`title`/`scope` 空值 400；同 project 已有 active 时 409（含数据库局部唯一索引兜底）；返回 201；`GET /requirements/{id}`：404 when not found；两端口均需 `ps_session`

**Cmd**:
```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/requirements -b 'ps_session=<token>' -H 'Content-Type: application/json' -d '{"title":"T","scope":"S"}'
curl -s http://127.0.0.1:8000/api/v1/requirements/<id> -b 'ps_session=<token>'
curl -s -o /dev/null -w '%{http_code}' -X POST http://127.0.0.1:8000/api/v1/requirements -b 'ps_session=<token>' -H 'Content-Type: application/json' -d '{"title":"T2","scope":"S2"}'
```

**Verify**: 首次 201 含 `id`/`title`/`scope`/`status=active`/`project_id`/`created_at`；第二条返回 409；`GET` 返回 200 且字段一致；无 cookie 返回 401

---

#### T014 实现 GUI 需求页面

**Story**: US2
**Files**:
- `protostar_gui/app/requirements/new/page.tsx` — 创建表单（标题、目标范围），`POST /api/v1/requirements`，成功后跳转 `/requirements/<id>`
- `protostar_gui/app/requirements/[id]/page.tsx` — 按 id 读取 `GET /api/v1/requirements/{id}` 展示 ID/标题/范围/状态/时间
- `protostar_gui/app/requirements/page.tsx` — 002 契约未定义列表端点，页面提供 id 查询入口并回显当前 active 需求（不臆造列表 API）

**Cmd**:
```bash
curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/requirements/new
```

**Verify**: 浏览器创建需求后跳转详情页且 ID 与 `GET /requirements/{id}` 一致；重复创建时页面显示 409 提示，不出现两条 active

---

## P5 US3 — 批准产物（Priority: P1）

**Goal**: spec→plan→tasks 顺序批准生效；越序与服务身份请求被拒；批准产生持久记录。
**Independent Test**: 越序批准返回 403；worker token 调用批准接口返回 401；批准记录含 approver/decided_at/artifact_id/decision。

#### T015 实现 PUT /artifacts/{type} 与 GET /artifacts/{type}

**Story**: US3
**Files**:
- `protostar_server/app/routers/artifacts.py` — `PUT /artifacts/{type}`：`type` 非 `spec|plan|tasks` 返回 400；`requirement_id` 不存在 404；按 `UNIQUE(requirement_id, type)` upsert（首次 201，更新 200）；`GET /artifacts/{type}?requirement_id=<uuid>`：404 when missing；需 `ps_session`

**Cmd**:
```bash
curl -s -X PUT http://127.0.0.1:8000/api/v1/artifacts/spec -b 'ps_session=<token>' -H 'Content-Type: application/json' -d '{"requirement_id":"<rid>","file_path":"specs/002-minimum-bootstrap-loop/spec.md"}'
curl -s 'http://127.0.0.1:8000/api/v1/artifacts/spec?requirement_id=<rid>' -b 'ps_session=<token>'
```

**Verify**: 首次 201、重复 PUT 200 且 `updated_at` 变化；非法 type 400；`file_path` 保存的是相对路径

---

#### T016 实现 POST /approvals（顺序检查 + 服务身份拒绝）

**Story**: US3
**Files**:
- `protostar_server/app/routers/approvals.py`（POST 部分）— `approver` 由 server 从有效 `ps_session` 对应 `LocalUser.username` 写入，客户端传值一律忽略；顺序检查：同一 requirement 下 spec 无 `approved` 时批 plan → 403，plan 无 `approved` 时批 tasks → 403（FR-003）；无 cookie → 401；Bearer worker token 调用 → 401（FR-004）；`decision` 非法 400，artifact 不存在 404；返回 201

**Cmd**:
```bash
curl -s -o /dev/null -w '%{http_code}' -X POST http://127.0.0.1:8000/api/v1/approvals -b 'ps_session=<token>' -H 'Content-Type: application/json' -d '{"artifact_id":"<plan_id>","decision":"approved"}'
curl -s -o /dev/null -w '%{http_code}' -X POST http://127.0.0.1:8000/api/v1/approvals -H "Authorization: Bearer <worker_token>" -H 'Content-Type: application/json' -d '{"artifact_id":"<spec_id>","decision":"approved"}'
```

**Verify**: spec 未批时批 plan 返回 403；按 spec→plan→tasks 顺序批准各返回 201；worker token 与无 cookie 返回 401；响应含 `approver`（非空）与 `decided_at`

---

#### T017 实现 GET /approvals

**Story**: US3
**Files**:
- `protostar_server/app/routers/approvals.py`（GET 部分）— `GET /approvals?artifact_id=<uuid>`：返回该 artifact 的批准记录数组（`id`/`artifact_id`/`approver`/`decided_at`/`decision`）；需 `ps_session`

**Cmd**:
```bash
curl -s 'http://127.0.0.1:8000/api/v1/approvals?artifact_id=<artifact_id>' -b 'ps_session=<token>'
```

**Verify**: 返回 200 JSON 数组；已批准 artifact 至少一条 `decision=approved`；未知 artifact 返回空数组而非 500

---

#### T018 实现 GUI 批准页面 approvals/page.tsx

**Story**: US3
**Files**:
- `protostar_gui/app/approvals/page.tsx` — 按 requirement_id 展示 spec/plan/tasks 三类 artifact（`GET /artifacts/{type}`）与最新批准状态（`GET /approvals`）；批准按钮调用 `POST /approvals` 并刷新；越序失败时展示 server 返回的 403 原因；页面无自动启动运行的按钮（FR-003 场景 3）

**Cmd**:
```bash
curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/approvals
```

**Verify**: 浏览器批准 spec 后显示 `approved` 且 approver 与登录用户名一致；越序点击 plan 显示 403 错误文案；批准 tasks 后页面不自动创建 Run

---

## P6 US4 — 启动运行（Priority: P1）

**Goal**: 已批准 task 可显式启动，worker 用 OMP 在隔离目录真实执行，结果落库并在页面展示。
**Independent Test**: tasks 未批准启动返回 403；启动后 Run 记录含 backend/work_dir/model/session_id/started_at/finished_at；RunOutput 含 stdout/stderr/exit_code；页面显示真实输出。

#### T019 实现 POST /runs

**Story**: US4
**Files**:
- `protostar_server/app/routers/runs.py`（POST 部分）— 校验 `tasks_approval_id` 存在、`decision=approved` 且对应 artifact 为该 requirement 的 tasks 类型，否则 403（FR-005）；同 `task_ref` 已有 `running` Run 返回 409（FR-009，依赖局部唯一索引兜底）；建 Run（`backend="omp"`、`status="running"`、`started_at=now()`），返回 201；需 `ps_session`

**Cmd**:
```bash
curl -s -o /dev/null -w '%{http_code}' -X POST http://127.0.0.1:8000/api/v1/runs -b 'ps_session=<token>' -H 'Content-Type: application/json' -d '{"task_ref":"T028","tasks_approval_id":"<nonexistent>"}'
curl -s -X POST http://127.0.0.1:8000/api/v1/runs -b 'ps_session=<token>' -H 'Content-Type: application/json' -d '{"task_ref":"T028","tasks_approval_id":"<tasks_approval_id>"}'
```

**Verify**: 未批准/无效批准 id 返回 403；批准后返回 201 含 `id`/`task_ref`/`backend=omp`/`status=running`/`started_at`；同 task_ref 重复启动 409

---

#### T020 实现 GET /worker/tasks/next（并发唯一领取）

**Story**: US4
**Files**:
- `protostar_server/app/routers/worker.py`（tasks/next 部分）— Bearer 校验；`SELECT ... FOR UPDATE SKIP LOCKED` 选中 `status='running'` 且未被领取的 Run；无可领取返回 204；返回 `{run_id, task_ref, tasks_approval_id, command}`；返回前确认 Run 仍为 `running` 并保证 `started_at` 已设置（FR-009）

**Cmd**:
```bash
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8000/api/v1/worker/tasks/next -H "Authorization: Bearer <token>"
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8000/api/v1/worker/tasks/next -H "Authorization: Bearer <invalid>"
```

**Verify**: 有任务返回 200 且含 `run_id`/`task_ref`/`command`；无任务返回 204 且 body 为空；无效 token 返回 401；同一 `task_ref` 已有 `running` Run 时第二次请求返回 409（非 204）

---

#### T021 实现 PATCH /worker/runs/{id} 与 POST /worker/runs/{id}/output

**Story**: US4
**Files**:
- `protostar_server/app/routers/worker.py`（PATCH 与 output 部分）
  - `PATCH /worker/runs/{id}`：Bearer 校验；更新 `model`、`session_id`；并接受可选 `work_dir`（`data-model.md` Run.work_dir 的写入路径，契约 §6 之外的补充字段，需在主线程审核时确认）
  - `POST /worker/runs/{id}/output`：Bearer 校验；stdout/stderr 超 8192 bytes 时截断并追加 `\n[truncated]`（FR-007）；写 `RunOutput`；`exit_code=0` → `completed`，否则或 `exit_code is null` + `failure_reason` 非空 → `failed`，同时写 `finished_at`；重复写入 409

**Cmd**:
```bash
curl -s -X PATCH http://127.0.0.1:8000/api/v1/worker/runs/<run_id> -H "Authorization: Bearer <token>" -H 'Content-Type: application/json' -d '{"model":"<model>","session_id":"<sid>","work_dir":"<dir>"}'
curl -s -X POST http://127.0.0.1:8000/api/v1/worker/runs/<run_id>/output -H "Authorization: Bearer <token>" -H 'Content-Type: application/json' -d '{"stdout":"ok","stderr":"","exit_code":0,"failure_reason":null}'
```

**Verify**: PATCH 后 `GET /runs/{id}` 显示 model/session_id 非 null；output 后 `GET /runs/{id}` 为 `completed` 且 `finished_at` 非 null；超 8KB stdout 末尾含 `[truncated]`；同一 run 二次 output 返回 409

---

#### T022 实现 GET /runs/{id} 与 GET /runs/{id}/output

**Story**: US4
**Files**:
- `protostar_server/app/routers/runs.py`（GET 部分）
  - `GET /runs/{id}` — 返回 `id`/`task_ref`/`backend`/`model`/`session_id`/`status`/`started_at`/`finished_at`；404 when missing
  - `GET /runs/{id}/output` — 返回 `run_id`/`stdout`/`stderr`/`exit_code`/`failure_reason`/`created_at`；Run 不存在或输出未写入均 404

**Cmd**:
```bash
curl -s http://127.0.0.1:8000/api/v1/runs/<run_id> -b 'ps_session=<token>'
curl -s http://127.0.0.1:8000/api/v1/runs/<run_id>/output -b 'ps_session=<token>'
```

**Verify**: 两端点均返回 200 且字段与数据库记录一致；未完成的 run 调 output 返回 404；未知 id 返回 404

---

#### T023 实现 worker/omp_runner.py（stdlib subprocess + 隔离目录）

**Story**: US4
**Files**:
- `protostar_worker/worker/omp_runner.py` — `run_omp(command: str, timeout: int = 300) -> dict`：
  1. `tempfile.mkdtemp(prefix="protostar-run-")` 建隔离工作目录（`main.py` 传入的 `work_dir`）
  2. `subprocess.Popen(command, cwd=work_dir, stdout=PIPE, stderr=PIPE, text=True, shell=False)`；命令由 `OMP_PATH` + `shlex.split(OMP_ARGS)` 构造，默认 `[OMP_PATH, "run", task_ref]`
  3. `communicate(timeout=...)`；超时 `kill()` 并写 `failure_reason="timeout"`、`exit_code=None`
  4. stdout/stderr 超 8192 bytes 截断并追加 `\n[truncated]`
  5. 返回 `{stdout, stderr, exit_code, failure_reason, work_dir}`
- 仅用 stdlib；不使用 `requests`/`httpx`

**Cmd**:
```bash
uv run --project protostar_worker python -c "from worker.omp_runner import run_omp; print(run_omp('python -c \"print(1)\"')['exit_code'])"
```

**Verify**: 命令输出 `0`；对 `python -c "import sys; sys.exit(3)"` 返回 `exit_code=3`；`timeout=1` 对 `python -c "import time; time.sleep(5)"` 返回 `failure_reason="timeout"` 且进程被终止（无残留子进程）

---

#### T024 实现 worker/main.py 轮询循环与本地 SQLite 状态

**Story**: US4
**Files**:
- `protostar_worker/worker/local_state.py` — stdlib `sqlite3`：表 `local_runs(task_ref, run_id, status, output_uploaded, updated_at)`；提供 `mark_claimed`/`mark_uploaded`/`load_pending`；`local_state.db` 落于 worker 目录（gitignore）
- `protostar_worker/worker/server_client.py` — stdlib `urllib.request` 封装 register/heartbeat/tasks_next/patch_run/post_output（Bearer header，JSON 编解码），超时与 HTTP 错误显式抛出
- `protostar_worker/worker/main.py` — 启动时校验 `OMP_PATH` 存在（缺失立即退出非 0，fast-fail）；`POST /worker/register` 取 token；循环：心跳 → `GET /worker/tasks/next` → 领取后 `mkdtemp` 并 `PATCH work_dir` → `run_omp` → 回传 model/session_id → `POST /output` → 本地 SQLite 标记 `output_uploaded`；204 时休眠 5s 重试；Ctrl+C 干净退出

**Cmd**:
```bash
cd protostar_worker && OMP_PATH=<omp-path> uv run python -m worker.main --server http://127.0.0.1:8000
```

**Verify**: 启动输出 `Worker ready, polling server...`；`GET /health` 的 `worker_last_seen` 非 null；有 Run 时自动领取并回传，Run 变 `completed`/`failed`；`OMP_PATH` 缺失时进程立即非 0 退出并打印缺失项；`protostar_worker/worker/local_state.db` 在 `.gitignore` 覆盖范围内

---

#### T025 实现 GUI 运行结果页 runs/[id]/page.tsx

**Story**: US4
**Files**:
- `protostar_gui/app/runs/[id]/page.tsx` — 读取 `GET /runs/{id}` 与 `GET /runs/{id}/output`；展示 `task_ref`、`backend`、`model`、`session_id`、实际命令/`work_dir` 摘要、stdout/stderr（保留 `[truncated]` 标记）、`exit_code`、`failure_reason`、`started_at`/`finished_at`；`exit_code` 非 0 或 status=failed 时显示失败样式与原因，不显示空成功（FR-008）

**Cmd**:
```bash
curl -s http://localhost:3000/runs/<run_id> | grep -c 'exit_code\|退出码'
```

**Verify**: 浏览器 `/runs/{id}` 显示的 stdout/stderr/退出码与 `GET /runs/{id}/output` 一致；失败 run 显示 `failure_reason`；未写入输出时显示"结果尚未产生"而非成功

---

## P7 US5 — 单机与单需求约束（Priority: P2）

**Goal**: loopback 绑定、单 active 需求、无 OIDC/组织入口可被验证。
**Independent Test**: 非本机地址不可达；第二条 active 需求被拒；pytest 约束测试全绿。

#### T026 pytest 约束测试（真实 PostgreSQL，不 mock DB）

**Story**: US5
**Files**:
- `protostar_server/tests/conftest.py` — 测试库 `DATABASE_URL`（独立库），建/删 schema，`httpx.AsyncClient(transport=ASGITransport(app=app))`，session cookie fixture
- `protostar_server/tests/test_constraints.py` — 断言：① spec 未批时批 plan → 403；② worker Bearer token 调 `POST /approvals` → 401；③ 同 project 第二条 active 需求 → 409；④ 同 `task_ref` 并发启动/领取 → 409 且仅一条 running；⑤ tasks 未批 `POST /runs` → 403；⑥ stdout 超 8KB 截断含 `[truncated]`

**Cmd**:
```bash
cd protostar_server && uv run pytest tests/test_constraints.py -v
```

**Verify**: 6 个用例全部 `PASSED`，无 `SKIP`/`XFAIL`/`ERROR`；测试连接真实 PostgreSQL（`DATABASE_URL` 生效），未使用 mock 数据库

---

#### T027 验证 server loopback 绑定（SC-004）

**Story**: US5
**Files**: 无新文件（绑定在 T008 的 uvicorn 启动参数中）

**Cmd**:
```bash
netstat -ano | findstr :8000
curl --interface <non-loopback-IP> -m 3 http://127.0.0.1:8000/api/v1/health; echo "exit=$?"
```

**Verify**: `netstat` 显示 `127.0.0.1:8000` 而非 `0.0.0.0:8000`；非 loopback 源地址访问失败（连接拒绝/超时，非 200）；`curl http://<lan-ip>:8000/api/v1/health` 不可达

---

## P8 Final

**Goal**: 提供 FR-012 可执行对象，完成 FR-011 端到端验收，并补齐模块文档。

#### T028 实现 FR-012 自验收脚本（002-healthcheck）

**Story**: Final（FR-012）
**Files**:
- `protostar_server/scripts/healthcheck_task.py` — 仅 stdlib，无参数，打印 `002 bootstrap healthcheck OK` 并 `sys.exit(0)`；作为 task_ref `002-healthcheck` 的 OMP 执行对象；不得写入仓库内文件（隔离目录内执行）

**Cmd**:
```bash
python protostar_server/scripts/healthcheck_task.py; echo "exit=$?"
```

**Verify**: 输出 `002 bootstrap healthcheck OK`，`exit=0`；在空临时目录中执行同样成功；OMP 执行该脚本时 `RunOutput.stdout` 含该字符串且 `exit_code=0`

---

#### T029 端到端验收循环（FR-011，按 quickstart §6–§9）

**Story**: Final（FR-011）
**Files**: 无新文件（按 `quickstart.md` §6–§9 执行，结果按 §10–§11 判定）

**Cmd**:
```bash
# §6 登录
curl -c cookies.txt -X POST http://127.0.0.1:8000/api/v1/auth/login -H 'Content-Type: application/json' -d '{"username":"admin","password":"<pw>"}'
# §7 登记需求
curl -b cookies.txt -X POST http://127.0.0.1:8000/api/v1/requirements -H 'Content-Type: application/json' -d '{"title":"002 自举验收","scope":"最小循环"}'
# §8 上传并逐层批准 spec → plan → tasks（越序先验证 403）
curl -b cookies.txt -X PUT http://127.0.0.1:8000/api/v1/artifacts/spec -H 'Content-Type: application/json' -d '{"requirement_id":"<rid>","file_path":"specs/002-minimum-bootstrap-loop/spec.md"}'
curl -b cookies.txt -X POST http://127.0.0.1:8000/api/v1/approvals -H 'Content-Type: application/json' -d '{"artifact_id":"<spec_id>","decision":"approved"}'
# …plan、tasks 同序批准
# §9 显式启动 task
curl -b cookies.txt -X POST http://127.0.0.1:8000/api/v1/runs -H 'Content-Type: application/json' -d '{"task_ref":"002-healthcheck","tasks_approval_id":"<tasks_approval_id>"}'
# §10 查看结果
curl -b cookies.txt http://127.0.0.1:8000/api/v1/runs/<run_id>
curl -b cookies.txt http://127.0.0.1:8000/api/v1/runs/<run_id>/output
psql "$DATABASE_URL" -c "select id, backend, status, started_at, finished_at from runs where id='<run_id>';"
psql "$DATABASE_URL" -c "select run_id, exit_code, left(stdout, 80) from run_outputs where run_id='<run_id>';"
```

**Verify**: 越序批准返回 403；spec/plan/tasks 顺序批准各 201；`POST /runs` 返回 201；`GET /runs/{id}` 为 `completed` 且 `backend=omp`、`work_dir`/`model`/`session_id`/`started_at`/`finished_at` 非空（FR-006）；`GET /runs/{id}/output` 的 `stdout` 含 `002 bootstrap healthcheck OK`、`exit_code=0`；浏览器 `/runs/{id}` 显示同一内容（FR-008）；`run_outputs` 表存在该记录（SC-003）

---

#### T030 更新模块 README

**Story**: Final
**Files**:
- `protostar_server/README.md` — 模块用途、Python 版本、依赖概述、环境变量（`DATABASE_URL`、`ADMIN_PASSWORD`）、seed/alembic/uvicorn 命令、loopback 约束
- `protostar_worker/README.md` — 模块用途、无第三方依赖说明（stdlib `subprocess`/`sqlite3`/`urllib.request`）、环境变量（`SERVER_URL`、`OMP_PATH`、`OMP_ARGS`、超时）、`uv run python -m worker.main` 命令
- `protostar_gui/README.md` — 页面清单（首页/需求/批准/运行结果）、`NEXT_PUBLIC_SERVER_URL`、`npm run dev`、无 OIDC/组织入口说明

**Cmd**:
```bash
grep -n 'OMP_PATH\|DATABASE_URL\|NEXT_PUBLIC_SERVER_URL' protostar_server/README.md protostar_worker/README.md protostar_gui/README.md
```

**Verify**: 三份 README 命令与 `quickstart.md` §2–§5 一致，无互相矛盾步骤；worker README 明确不引入第三方 HTTP 库

---

## 依赖与执行顺序

- **Phase 1（T001–T002）**：无依赖，可先行。
- **Phase 2（T003–T008）**：依赖 Phase 1；阻塞所有 User Story。顺序：T003 → T004/T005（可并行）→ T006 → T007 → T008。
- **Phase 3 US1（T009–T012）**：依赖 Phase 2；T011 依赖 T010 的 Bearer 依赖注入。
- **Phase 4 US2（T013–T014）**：依赖 Phase 2；T014 依赖 T013。
- **Phase 5 US3（T015–T018）**：依赖 Phase 2 与 T013（需求外键）；T016 依赖 T015 与 T010；T018 依赖 T015–T017。
- **Phase 6 US4（T019–T025）**：依赖 Phase 2 与 Phase 5（tasks 批准记录）；T020/T021 依赖 T019；T023 可并行于 T019–T022；T024 依赖 T020/T021/T023；T025 依赖 T022。
- **Phase 7 US5（T026–T027）**：T026 依赖 T013/T016/T019/T020/T021；T027 依赖 T008。
- **Phase 8 Final（T028–T030）**：T028 独立；T029 依赖 T001–T027 全部；T030 可与 T028 并行。
- **并行机会**：T004/T005/T007、T009/T010、T014/T015、T023/T019、T028/T030 互不写同一文件，可并行。

**MVP 范围**：US1+US2+US3+US4（T001–T025）构成可验收最小循环；US5 与 Final 为约束验证与交付收尾。

---

## FR/SC 覆盖

| 需求 | 覆盖任务 |
|---|---|
| FR-001 | T008（loopback 绑定）、T009（health）、T012（首页）、T027（绑定验证） |
| FR-002 | T005（active 唯一索引）、T013（创建/查询 + 409） |
| FR-003 | T016（spec→plan→tasks 顺序检查 403）、T018（页面不自动启动） |
| FR-004 | T010（session cookie）、T016（approver 由 session 解析；worker token 401）、T017（记录可查询） |
| FR-005 | T019（tasks 未批准 403）、T029（显式启动） |
| FR-006 | T019（Run 创建）、T020（worker 领取）、T021（model/session_id/work_dir）、T023（OMP subprocess + mkdtemp 隔离目录）、T024（worker 循环） |
| FR-007 | T021（8KB 截断 + exit_code/failure_reason + status）、T023（超时处理）、T025（失败不显示为空成功） |
| FR-008 | T025（运行结果页展示真实命令/输出/退出码） |
| FR-009 | T005（running 局部唯一索引）、T019（重复启动 409）、T020（并发领取唯一） |
| FR-010 | T008（无 OIDC 路由）、T010（本地账户 + cookie）、T012/T018（无组织/成员入口） |
| FR-011 | T029（quickstart §6–§9 完整循环 + §10–§11 判定） |
| FR-012 | T028（`protostar_server/scripts/healthcheck_task.py`，task_ref `002-healthcheck`） |
| SC-001 | T029（约 1 小时完整循环）、T030（启动文档） |
| SC-002 | T016（越序 403）、T026（约束测试） |
| SC-003 | T021/T022（RunOutput 落库与查询）、T029（数据库比对） |
| SC-004 | T008（`--host 127.0.0.1`）、T027（非 loopback 不可达） |
| SC-005 | T008/T010（无 OIDC）、T012/T014/T018/T025（无多后端/组织/图入口）、T001（依赖无图表库） |

---

## 批准状态

### 输入版本 SHA 表

| 文档 | SHA-256 |
|---|---|
| plan.md | 792b5de043ac94f8b61a86067c5e7244385d8f4173e88b86ed3afe560b8b9623 |
| research.md | a867ea0bea8ba09a3f6621a61c881d4633dc63bdb589e5e9bcb162d6ba9c507e |
| data-model.md | 1ee0bd8aecb904b14852c601c4dee455cc980a736a1d4d1e5c6397006adb1ce5 |
| contracts/server-api.md | b560297d81ff9a2658d7432154c63a75cc8a6d790bad162782b5bbf21d350b6b |
| quickstart.md | 3f87dce49e36475aa9d221caa83d327a941cb027849e2b300b456ccd95e80f66 |

上述 SHA 仅记录本 tasks 编写时读取的输入版本，不构成对任何文档的批准。

### 本 tasks 的批准栏

| 字段 | 内容 |
|---|---|
| 批准人 | |
| 批准日期 | |
| 批准范围 | |
| 批准依据 | |

本文件当前状态为"待审批"。在批准栏被人类填写之前，本 tasks 不得作为启动运行（FR-005）或实施代码的批准输入；服务身份不得代替人类产生批准（constitution II）。
