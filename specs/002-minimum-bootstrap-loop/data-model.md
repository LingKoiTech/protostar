# 002 Data Model

**Branch**: `002-minimum-bootstrap-loop` | **Date**: 2026-11-13

**来源**：spec Key Entities、spec FR-002–FR-010、PRD §4.3、constitution I/III。

---

## 0. 支撑实体

### Project

002 只有一个默认 Project，seed 时预建。

| 字段 | 类型 | 约束/说明 |
|---|---|---|
| id | UUID | PK，不可变 |
| name | TEXT | NOT NULL；002 固定值 `default` |
| created_at | TIMESTAMPTZ | NOT NULL，服务端生成 |

---

### LocalUser

本地操作者账户（FR-010：无 OIDC，FR-004：批准必须来自操作者会话）。

| 字段 | 类型 | 约束/说明 |
|---|---|---|
| id | UUID | PK，不可变 |
| username | TEXT | UNIQUE，NOT NULL |
| password_hash | TEXT | bcrypt hash，NOT NULL；明文不入库 |
| created_at | TIMESTAMPTZ | NOT NULL |

---

### Session

操作者登录后的本地会话。用于 `ps_session` cookie 验证（FR-004/FR-010）。

| 字段 | 类型 | 约束/说明 |
|---|---|---|
| id | UUID | PK，同时作 cookie token |
| user_id | UUID | FK → LocalUser，NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL |
| expires_at | TIMESTAMPTZ | NOT NULL；默认 24h；未过期才有效 |

**约束**：ApprovalRecord.approver 由 server 从有效 Session 解析后写入，不由客户端传入。

---

### WorkerSession

worker 注册后的服务身份（FR-006：worker 通过 Bearer token 领取任务）。

| 字段 | 类型 | 约束/说明 |
|---|---|---|
| id | UUID | PK |
| token_hash | TEXT | Bearer token 的 hash，UNIQUE，NOT NULL |
| last_heartbeat_at | TIMESTAMPTZ | nullable；`GET /health` 的 `worker_last_seen` 来源 |
| created_at | TIMESTAMPTZ | NOT NULL |

**约束**：WorkerSession token 不可用于访问操作者批准接口（服务端检查来源类型，FR-004）。

---

## 1. Requirement

需求主记录。002 范围：单个默认 `Project` 下同时只有一条 `active` 需求。

| 字段 | 类型 | 约束/说明 |
|---|---|---|
| id | UUID | PK，不可变 |
| title | TEXT | NOT NULL，非空字符串 |
| scope | TEXT | 目标范围描述，NOT NULL |
| status | ENUM `active / closed` | DEFAULT `active` |
| project_id | UUID | FK → Project；002 只有一个默认 Project |
| created_at | TIMESTAMPTZ | NOT NULL，服务端生成 |
| updated_at | TIMESTAMPTZ | NOT NULL，自动更新 |

**关键约束**：
- `UNIQUE(project_id) WHERE status = 'active'`（同一 project 下最多一条 active 需求，FR-002）

**状态机**：
```
active --[关闭]--> closed
```
关闭由人工操作；002 不实现自动关闭。

---

## 2. Artifact

spec/plan/tasks 文件的元数据记录。002 只存路径与时间，不绑哈希（归 006）。

| 字段 | 类型 | 约束/说明 |
|---|---|---|
| id | UUID | PK，不可变 |
| requirement_id | UUID | FK → Requirement，NOT NULL |
| type | ENUM `spec / plan / tasks` | NOT NULL |
| file_path | TEXT | 相对仓库根的路径，NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL，服务端生成 |
| updated_at | TIMESTAMPTZ | NOT NULL，自动更新 |

**关键约束**：
- `UNIQUE(requirement_id, type)`（每条需求下每种类型只有一份活跃 Artifact）
- file_path 不含本机绝对路径前缀

---

## 3. ApprovalRecord

人类操作者对 Artifact 的批准/拒绝决定。

| 字段 | 类型 | 约束/说明 |
|---|---|---|
| id | UUID | PK，不可变 |
| artifact_id | UUID | FK → Artifact，NOT NULL |
| approver | TEXT | 操作者标识（本地 session username），NOT NULL |
| decided_at | TIMESTAMPTZ | NOT NULL，服务端生成 |
| decision | ENUM `approved / rejected` | NOT NULL |

**顺序约束**（FR-003）：
- 批准 `plan` 型 Artifact 前，同一 requirement 的 `spec` 型 Artifact 必须已有 `approved` 记录
- 批准 `tasks` 型 Artifact 前，同一 requirement 的 `plan` 型 Artifact 必须已有 `approved` 记录
- 越序请求返回 `403 Forbidden`

**服务身份禁止**（FR-004）：
- 请求须携带有效 session cookie；无 cookie 或 worker session 返回 `401`

---

## 4. Run

一次已批准 task 的执行记录。

| 字段 | 类型 | 约束/说明 |
|---|---|---|
| id | UUID | PK，不可变 |
| task_ref | TEXT | task 标识（002 中为 tasks.md 中任务的行引用或简短 slug），NOT NULL |
| tasks_approval_id | UUID | FK → ApprovalRecord（tasks 类型），NOT NULL |
| backend | TEXT | 执行后端标识，002 固定 `omp` |
| work_dir | TEXT | worker 创建的隔离工作目录绝对路径（仅 worker 本地可见，不写入公开文档） |
| model | TEXT | OMP 使用的模型名，可为 null（由 OMP 配置决定） |
| session_id | TEXT | OMP session 标识，可为 null（首次执行前未知） |
| started_at | TIMESTAMPTZ | NOT NULL，worker 领取时设置 |
| finished_at | TIMESTAMPTZ | nullable，完成时设置 |
| status | ENUM `running / completed / failed` | DEFAULT `running` |

**关键约束**（FR-009）：
- 同一 `task_ref` 在 status = `running` 时不允许第二次领取；并发请求返回 `409`

**状态机**：
```
running --[成功]--> completed
running --[失败/超时]--> failed
```

---

## 5. RunOutput

运行的实际输出，有界存储。

| 字段 | 类型 | 约束/说明 |
|---|---|---|
| id | UUID | PK，不可变 |
| run_id | UUID | FK → Run，UNIQUE（一次运行一份输出） |
| stdout | TEXT | 有界截断 ≤8KB（约 8192 字符），nullable |
| stderr | TEXT | 有界截断 ≤8KB，nullable |
| exit_code | INTEGER | nullable（挂起或超时时为 null）|
| failure_reason | TEXT | 失败原因说明，nullable；exit_code 非 0 或超时时必填 |
| created_at | TIMESTAMPTZ | NOT NULL，worker 写入时 |

**有界规则**（FR-007）：
- worker 在写入前截断：若 stdout > 8192 bytes，保留前 8192 bytes 并追加 `\n[truncated]`；stderr 同理
- exit_code = null + failure_reason 表示超时或进程未正常退出；exit_code ≥ 0 表示进程已退出

---

## 6. 权威范围

| 实体 | 写入权威 | 读取 |
|---|---|---|
| Project | server seed 预建，不通过 API 创建 | server、GUI |
| LocalUser | server（操作者自建，002 只有一个预置账户） | server |
| Session | server（`POST /api/v1/auth/login` 颁发；`POST /api/v1/auth/logout` 失效） | server |
| WorkerSession | server（`POST /api/v1/worker/register` 颁发；`POST /api/v1/worker/heartbeat` 刷新） | server |
| Requirement | server（操作者通过 `POST /api/v1/requirements`） | server、GUI |
| Artifact | server（操作者通过 `PUT /api/v1/artifacts/{type}`） | server、GUI |
| ApprovalRecord | server（操作者通过 `POST /api/v1/approvals`；WorkerSession 不可调用此接口）| server、GUI、worker（通过 `GET /api/v1/worker/tasks/next` 读 tasks 批准状态） |
| Run | server 建记录（`POST /api/v1/runs`）；worker 通过 `PATCH /api/v1/worker/runs/{id}` 更新状态与 session 信息 | server、GUI |
| RunOutput | worker 通过 `POST /api/v1/worker/runs/{id}/output` 写入；server 保存后 worker 可清除本地状态 | server（查询）、GUI（展示） |
