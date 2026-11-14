# 002 技术决定记录（Phase 0 Research）

**Branch**: `002-minimum-bootstrap-loop` | **Date**: 2026-11-13

**输入来源**：PRD §4.1（S01）、001 plan §2 Technical Context（S01）、product-decisions.md（S02/S03）、spec.md 假设条款。

---

## 1. Web 框架：FastAPI vs Flask

**Decision**：FastAPI（async，Pydantic v2 集成）

**Rationale**：PRD §4.1 明确 FastAPI；asyncio 原生支持适合将来接入 SSE 与 worker 长轮询；Pydantic v2 提供类型验证与 JSON schema 自动生成；FastAPI 是 001 plan §2 拟采用方案。

**Alternatives considered**：
- Flask（已排除）：同步优先，接入 async 需额外适配层；缺乏内置 Pydantic 集成；类型注解较薄弱。
- Django REST Framework（已排除）：ORM 耦合深，002 范围内没有多租户、Auth 插件等 Django 加值的用处。

---

## 2. ORM：SQLAlchemy 2.x vs raw SQL

**Decision**：SQLAlchemy 2.x（async ORM + Core）+ Alembic

**Rationale**：PRD §4.1 拟采用；async session 与 FastAPI 无缝集成；Alembic 提供版本化 schema 迁移；对 002 的实体（Project/LocalUser/Session/WorkerSession/Requirement/Artifact/ApprovalRecord/Run/RunOutput）建模直观；类型安全的 ORM 减少字段名拼写错误。

**Alternatives considered**：
- psycopg3 raw SQL（已排除）：手动迁移管理负担大；没有 ORM 建模失去类型层，002 实体关系明确，ORM 明显更合适。
- Tortoise ORM（已排除）：async-first 但生态较小，Alembic 生态更成熟。

---

## 3. 数据库驱动：psycopg（psycopg3）

**Decision**：psycopg（psycopg3，原生 asyncio）

**Rationale**：PRD §4.1 拟采用；SQLAlchemy 2.x 原生支持 psycopg3 async driver；比 asyncpg 更贴近标准 DB-API 2.0；psycopg2 已排除（同步限制）。

**Alternatives considered**：
- asyncpg（已排除）：性能更高但与 SQLAlchemy ORM 层集成略繁琐；对 002 范围无必要的性能优势。

---

## 4. Next.js 路由模式：App Router vs Pages Router

**Decision**：Next.js App Router（Next.js 14+）

**Rationale**：PRD §4.1 确定 Next.js；App Router 是 Next.js 14 的推荐默认；Server Components 允许直接从服务器读数据，减少客户端 fetch 样板代码；002 只需最小页面，App Router 更轻量。

**Alternatives considered**：
- Pages Router（已排除）：旧模式，官方推荐迁移到 App Router；对新项目无优势。

---

## 5. worker 状态存储：SQLite vs 文件/CSV

**Decision**：sqlite3（Python stdlib）管理 worker 本地任务队列与恢复状态

**Rationale**：PRD §4.1 确定 worker 使用 SQLite；事务性读写避免并发状态损坏；比 CSV/JSON 文件更可靠；stdlib 无需额外依赖。

**Alternatives considered**：
- 仅用内存（已排除）：worker 重启后丢失正在进行任务的状态；constitution IV 要求重启后状态持久化。
- PostgreSQL（已排除）：worker 目的是在 server 不可达时也能恢复；本地 SQLite 实现离线恢复语义。

---

## 6. 测试框架：pytest + httpx vs unittest

**Decision**：pytest + pytest-asyncio + httpx AsyncClient（server 测试）

**Rationale**：pytest 是 Python 标准测试框架，uv 生态常见选择；httpx AsyncClient 与 FastAPI TestClient 对 async 路由支持优于旧 `requests.TestClient`；pytest-asyncio 支持 async def test。

**Alternatives considered**：
- unittest（已排除）：verbose，对 async 支持需要更多样板代码。

---

## 7. 认证：本地 session cookie vs JWT

**Decision**：本地 session cookie（server 生成，HttpOnly）

**Rationale**：spec FR-010 和 Assumption 明确无 OIDC；002 单操作者不需要分布式 token；server 侧 session 存储更容易在单 PostgreSQL 实例内撤销。

**Alternatives considered**：
- JWT（已排除）：无状态 JWT 在无 OIDC 的本地场景缺少吊销机制；对单操作者过度设计。
- OIDC/Logto（已排除）：spec FR-010 明确排除；归 015–017。

---

## 8. OMP 调用方式与隔离工作目录

**Decision**：worker 以 `subprocess.run` / `subprocess.Popen` 调用 `omp` CLI；每次运行在 `tempfile.mkdtemp()` 创建的隔离目录内执行；目录路径只写入 `Run.work_dir`，不出现在公开文档导航中（constitution III）。

**Rationale**：
- OMP 通过 CLI 调用是 PRD §4.1 确定的接口；worker 不直接嵌入 OMP Python 库，保持执行边界清晰。
- 隔离目录防止同时运行的任务共享文件状态；`tempfile.mkdtemp()` 是 Python stdlib，无额外依赖。
- `subprocess.Popen` 允许在进程运行时持续读取 stdout/stderr（流式读），超时时 `Popen.kill()` 终止进程；这是 002 范围内最简单的实现路径。

**Alternatives considered**：
- 在固定目录（如 `~/protostar-runs/`）按 run_id 建子目录（已排除）：需要额外清理逻辑；`tempfile.mkdtemp()` 语义更明确。
- 直接在 OMP 进程内捕获输出（已排除）：OMP 是外部 CLI，无法嵌入进程内捕获。

**OMP 超时处理**：worker 对 `Popen` 设置 `timeout`（002 默认值在 worker 配置中指定，建议 300s）；超时时 `Popen.kill()`，RunOutput 写入已观测的截断输出与 `failure_reason="timeout"`。

---

## 9. 开放问题

无。002 技术方向已由 spec 假设、PRD §4 与以上各节决定；无 NEEDS CLARIFICATION 条目。
