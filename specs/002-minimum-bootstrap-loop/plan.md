# Implementation Plan: 最小自举构建循环

**Branch**: `002-minimum-bootstrap-loop` | **Date**: 2026-11-13 | **Spec**: [spec.md](spec.md)

**Input**: `specs/002-minimum-bootstrap-loop/spec.md`（SHA `03c733f6757ed4460cbaadcb4c9cea84fd360fb98e87f69ab026c5cf02b2af04`）

**Status**: 待 HumanMiao 审批。本文件是规划产物，不批准任何实现、tasks 或发布；`0.1.0` 发布属独立人工授权步骤。

---

## 1. Summary

002 在本机单操作者模式下实现最小研发循环：启动 Next.js 页面 + Python server + Python worker + PostgreSQL，操作者通过浏览器登记一条需求、逐层批准 spec/plan/tasks，显式启动一个已批准 task，由 OMP 在隔离工作目录真实执行，浏览器展示真实 stdout/stderr 与退出码。

server 以 FastAPI + SQLAlchemy 2.x + PostgreSQL 16 实现需求 CRUD、顺序批准链与任务派发；worker 以 Python subprocess 启动 OMP CLI，本地 SQLite 保存状态；GUI 以 Next.js App Router + TypeScript 提供最小页面（无 React Flow / ECharts）。服务只绑定 loopback，无 OIDC，无多组织，不依赖 Gitea。

---

## 2. Technical Context

| 项目 | 内容 |
|---|---|
| Language/Version | Python >=3.11（uv 管理 Python 工作区）；Node.js 18+（Next.js App Router） |
| Primary Dependencies | **server**：FastAPI、Pydantic v2、SQLAlchemy 2.x（async）、psycopg（psycopg3）、Alembic；**worker**：Python stdlib `subprocess` + `sqlite3`（本地状态）；**GUI**：Next.js 14+ App Router、TypeScript；fetch API（无额外 HTTP 客户端库） |
| Storage | PostgreSQL 16（server 业务数据：需求、产物元数据、批准记录、运行与输出）；SQLite（worker 本地任务队列与恢复状态） |
| Testing | pytest（server 单元与集成测试，使用 pytest-asyncio + httpx AsyncClient）；curl/Python 脚本（端到端验收，真实 HTTP 调用，不 mock） |
| Target Platform | 本机 loopback only（127.0.0.1）；单操作者；002 不支持远程访问 |
| Project Type | 多模块 Web 应用（server + worker + GUI）；002 只启用这三个模块，CLI/MCP/skills 归后续 spec |
| Performance Goals | 验收循环可在约 1 小时内完成（SC-001）；无并发负载要求；OMP 执行时间由外部进程决定，不在此设目标 |
| Constraints | 服务仅绑定 127.0.0.1；无 OIDC/OAuth（FR-010）；无多组织；无 Gitea 依赖；输出截断 ≤8KB（FR-007）；同一 task 同时只有一次执行（FR-009）；不保留长期双写权威 |
| Scale/Scope | 单机单项目单需求单 worker；spec/plan/tasks 各一份活跃版本；运行记录按单次存储 |

---

## 3. Constitution Check

| 原则 | 002 设计对应 | 结论 |
|---|---|---|
| I 独立产品与单一权威 | protostar_server 是需求、产物、批准、运行的唯一业务权威；worker 只管活进程与本地 SQLite；GUI 只读与提交，不持有业务状态 | 通过 |
| II 版本绑定与逐层批准 | 批准栏四项空白；tasks 在 plan 获批后才编写；任务在批准 tasks 后才可启动；批准由 HumanMiao 决定，服务身份不代替人类产生批准 | 通过 |
| III 数据边界与来源 | 无私有路径、凭据值或跨组织数据进入文档；本机工作目录由 worker 配置管理；公开正文只含相对路径与公开来源 | 通过 |
| IV 真实验证与失败处理 | Test-First（pytest + 真实 PostgreSQL）；验收包含真实 OMP 进程、真实数据库、真实 stdout/stderr 与浏览器；失败时保留退出码与失败原因，不返回空成功 | 通过 |
| V 可观察执行与完整交付 | 每次运行关联需求版本、batch、session；运行记录含后端、工作目录、模型、事件；002 验收通过后才增加完成计数；0.1.0 发布属独立授权 | 通过 |
| 产品边界与安全要求 | 002 loopback 单操作者；无 OIDC；服务身份禁止产生批准；不预先声称自举（003 起才用 Protostar 执行） | 通过 |
| 开发流程与版本交付 | 主线程审核；单一写入者；批准栏空白；验收证据分别保存；0.1.0 发布须独立人类授权 | 通过 |
| Governance | 不修改 constitution；不写 bootstrap 批准记录；治理状态保持送审 | 通过 |

Phase 1 设计后复核：上述各项仍成立；Complexity Tracking 无豁免条目。

---

## 4. Project Structure

### 4.1 Documentation（本需求）

| 文件 | 内容 | 状态 |
|---|---|---|
| [plan.md](plan.md) | 本计划 | 待 HumanMiao 审批 |
| [research.md](research.md) | Phase 0 技术决定记录 | 本计划 Phase 0 产物 |
| [data-model.md](data-model.md) | 九个实体（Project/LocalUser/Session/WorkerSession/Requirement/Artifact/ApprovalRecord/Run/RunOutput）字段与约束 | 本计划 Phase 1 产物 |
| [contracts/server-api.md](contracts/server-api.md) | REST API 契约 | 本计划 Phase 1 产物 |
| [quickstart.md](quickstart.md) | 本机启动与验收指南 | 本计划 Phase 1 产物 |
| `tasks.md` | 不创建；plan 获批后才进入 tasks 阶段 | 未生成 |

### 4.2 计划源码目录结构

```text
protostar_server/
├── app/
│   ├── main.py          # FastAPI app 入口
│   ├── database.py      # SQLAlchemy async engine + session
│   ├── models/          # ORM models
│   │   ├── requirement.py
│   │   ├── artifact.py
│   │   ├── approval.py
│   │   ├── run.py
│   │   └── run_output.py
│   ├── schemas/         # Pydantic v2 schemas
│   ├── routers/         # FastAPI routers
│   │   ├── auth.py
│   │   ├── requirements.py
│   │   ├── artifacts.py
│   │   ├── approvals.py
│   └── └── runs.py
├── alembic/             # 数据库迁移
│   └── versions/
├── tests/
└── pyproject.toml       # uv 管理

protostar_worker/
├── worker/
│   ├── main.py          # 领取-执行-回传循环
│   ├── omp_runner.py    # OMP subprocess 启动与输出捕获
│   └── local_state.db   # SQLite（运行时生成，gitignore）
└── pyproject.toml

protostar_gui/
├── app/
│   ├── page.tsx         # 首页：系统状态
│   ├── requirements/
│   │   ├── page.tsx     # 需求列表
│   │   └── new/page.tsx # 创建需求
│   ├── approvals/
│   │   └── page.tsx     # 批准产物
│   └── runs/
│       └── [id]/page.tsx  # 运行结果
├── package.json
└── tsconfig.json
```

**Structure Decision**：三模块分开独立的 `pyproject.toml`（server、worker）与 `package.json`（GUI），uv workspace 管理 Python 包。模块内部目录按最小职责设计，不预建未用的 MCP/CLI/skills 目录。

---

## 5. Complexity Tracking

无违反 constitution 的设计项，无需豁免。三模块分离是 constitution I 的直接要求；server 单权威是 PRD §4.3 的直接要求；loopback 是 002 范围的直接约束。

---

## 6. 阶段注册表

| Phase | 输入 | 产物 | 出口判据 | tasks 派生范围 |
|---|---|---|---|---|
| P0 技术决定 | spec.md、PRD §4、001 plan §2、product-decisions.md | [research.md](research.md) | 所有技术选择有 Decision/Rationale/Alternatives；包含 OMP 调用方式与隔离工作目录决定；无 NEEDS CLARIFICATION | 核对决定来源与版本 |
| P1 设计产物 | P0 research.md、spec Key Entities、spec FR | [data-model.md](data-model.md)、[contracts/server-api.md](contracts/server-api.md)、[quickstart.md](quickstart.md) | 九个实体字段完整（含 Project/LocalUser/Session/WorkerSession）；操作者端点与 worker 专用端点（注册、心跳、领取、事件回传）均在 contracts 中定义；quickstart 可操作验收步骤齐全 | 按 data-model 实现 ORM；按 contracts 实现路由（含 worker 专用端点）；按 quickstart 编写端到端测试 |
| P2 实施范围 | P1 全部产物、spec user stories | 实施任务清单（由 tasks 层派生） | protostar_server：FastAPI app + 9 表 ORM + Alembic migration + 路由（操作者 + worker）+ 顺序批准检查；protostar_worker：注册/心跳/领取/OMP subprocess/回传循环；protostar_gui：最小页面（需求/批准/运行结果）；端到端验收循环可执行 | server 路由与 ORM 实现；worker 领取执行回传循环；GUI 页面；pytest 集成测试；quickstart 验收执行 |
| PG 审核与批准 | P0–P2 全部产物 | 主线程审核记录、HumanMiao 决定 | 主线程审核通过；HumanMiao 对具体版本作出决定（当前空白） | 批准后才由 tasks 层派生，不在本计划生成 |

---

## 7. FR/SC 覆盖表

### 7.1 Functional Requirements

| 需求 | 对应设计 | 验收方式 |
|---|---|---|
| FR-001 | §2 Target Platform：loopback only；§4.2：三进程启动 | 四进程均启动，`curl http://127.0.0.1` 可达，非本机不可达 |
| FR-002 | data-model Requirement；contracts POST /api/v1/requirements；active 唯一约束 | 创建需求后重新 GET 存在；创建第二条返回 409 |
| FR-003 | contracts POST /api/v1/approvals；server 顺序检查逻辑 | spec 未批时批准 plan → 403；contracts 说明错误码 |
| FR-004 | data-model LocalUser/Session（操作者身份）、WorkerSession（服务身份）；contracts POST /api/v1/approvals 要求 session cookie，WorkerSession token 不可访问批准接口 | 批准记录含 approver（从 Session 解析）、decided_at、artifact_id、decision；WorkerSession token 调用批准接口 → 401/403 |
| FR-005 | contracts POST /api/v1/runs；server 检查 tasks ApprovalRecord | tasks 未批准时启动 → 403 |
| FR-006 | data-model Run（backend/work_dir/model/session_id/started_at）；contracts GET /api/v1/worker/tasks/next（worker 领取，server 置 status=running 并记录 started_at）、PATCH /api/v1/worker/runs/{id}（worker 写 model/session_id）；research.md §8 OMP subprocess + tempfile.mkdtemp() | 运行记录含 backend=omp、work_dir、model、session_id、started_at；GET /runs/{id} 返回这些字段 |
| FR-007 | data-model RunOutput（stdout/stderr ≤8KB/exit_code/failure_reason）；contracts POST /api/v1/worker/runs/{id}/output（server 截断至 8KB，同时更新 Run.status）；研究 §8 Popen 超时处理 | RunOutput 有 exit_code；退出码非 0 时 failure_reason 非空；stdout 超 8KB 时末尾含 `[truncated]`；不返回空成功 |
| FR-008 | §4.2 GUI pages：runs/[id]/page.tsx | 浏览器页面显示真实命令、输出、退出码；与 RunOutput 数据库记录一致 |
| FR-009 | server 派发时检查 Run.status == running 唯一约束；worker 领取使用 SELECT FOR UPDATE | 并发第二次领取返回 409 |
| FR-010 | data-model LocalUser/Session（本地账户，无 OIDC 外部身份）；§2 Constraints：无 OIDC/OAuth；§4.2 GUI 无注册/组织/邀请页面 | 页面无 OIDC 跳转、无组织/成员管理入口；登录只走 POST /auth/login（本地用户名密码） |
| FR-011 | quickstart §6–§9 验收循环 | quickstart 步骤完整执行后页面显示真实 OMP 输出 |
| FR-012 | 002 tasks.md 中至少一个 task 提供可执行命令（如 `python -c "print('hello')"` 或文档检查脚本） | task 被 OMP 执行后 RunOutput 有非空 stdout |

### 7.2 Success Criteria

| 标准 | 对应设计 | 当前可核状态 |
|---|---|---|
| SC-001 | quickstart 完整操作步骤；安装与迁移命令清晰 | quickstart 步骤完整；依赖包已确定 |
| SC-002 | contracts 403/409 错误码；server 顺序检查 | contracts 中越序批准返回 403 明确定义 |
| SC-003 | data-model Run + RunOutput 字段覆盖 | 字段含 backend、session、stdout/stderr、exit_code |
| SC-004 | §2 Constraints：loopback only；server 绑定 127.0.0.1 | 设计明确约束，实现时 uvicorn `--host 127.0.0.1` |
| SC-005 | §2 Constraints + §4：无多后端、无 OIDC、无组织管理、无图 | Out of Scope 与 Constraints 均明确排除 |

---

## 8. 验证与证据

002 是产品运行级验收，要求：
1. pytest 覆盖 server 核心路径（需求 CRUD、批准顺序、运行派发）；真实 PostgreSQL，不 mock 数据库。
2. OMP 执行测试：通过 quickstart 操作步骤完成完整循环；运行记录在数据库中可查。
3. 浏览器验证：操作者在 `http://127.0.0.1` 完成全部步骤，页面显示真实结果；截图或录屏保存为验收证据。
4. 失败场景验证：越序批准返回 403；tasks 未批时启动返回 403；OMP 进程退出码非 0 时显示失败。

每次验收保存：输入条件、命令、退出码、输出摘要、关联运行 ID。

---

## 9. 风险与处置

| 风险 | 影响 | 处置 |
|---|---|---|
| PostgreSQL 本地未安装或版本不符 | 无法启动 server | quickstart §1 前置检查中列出版本要求与安装命令 |
| OMP 可执行文件路径未配置 | worker 无法启动任务 | worker 启动时检查 OMP 路径，若缺失立即报错（fast-fail） |
| Alembic 迁移版本冲突 | 升级失败 | 002 只建一个 initial migration，不保留空 migration 文件 |
| 本地 session cookie 未持久化 | 重启后需重新登录 | Assumption 明确 cookie 在操作者关闭浏览器后仍有效；server 配置 cookie 有效期 |
| GUI 与 server 跨进程通信端口冲突 | 启动失败 | quickstart 明确端口分配（server: 8000，GUI: 3000），Assumption §1 要求无端口冲突 |
| OMP 执行超时或挂起 | 运行不结束 | worker 对 subprocess 设置超时；超时时保存已观测输出并标记 failed |

---

## 10. 批准状态与输入

### 10.1 已记录的输入

| 输入 | 版本 SHA-256 | 记录位置 |
|---|---|---|
| [spec.md](spec.md) | `03c733f6757ed4460cbaadcb4c9cea84fd360fb98e87f69ab026c5cf02b2af04` | [checklists/spec-decision.md](checklists/spec-decision.md) |

上述 spec 批准只作为编写 002 plan 的输入依据：不批准本 plan、不批准 tasks、不批准实施代码或发布。

### 10.2 本计划的批准栏

| 字段 | 内容 |
|---|---|
| 批准人 | |
| 批准日期 | |
| 批准范围 | |
| 批准依据 | |

本计划当前状态为"待 HumanMiao 审批"。主线程审核后提交 HumanMiao 对具体版本作出决定；在决定记录存在之前，本计划不得作为 tasks 的批准输入。
