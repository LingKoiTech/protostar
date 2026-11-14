# 002 Server REST API Contract

**Branch**: `002-minimum-bootstrap-loop` | **Date**: 2026-11-13

**Base URL**: `http://127.0.0.1:8000/api/v1`

**操作者认证**: 本地 session cookie（`ps_session`，HttpOnly）。除 `/health`、`/auth/login` 与 worker 专用端点外，所有操作者端点均需 cookie；缺失或无效时返回 `401`。服务身份（无操作者会话）不可访问批准接口（FR-004）。

**Worker 认证**: worker 专用端点（§6）使用 `Authorization: Bearer <worker_token>` header；token 在 worker 注册时颁发，每次心跳刷新。操作者 session cookie 不可用于 worker 端点。

**Content-Type**: `application/json`

---

## 1. Auth

### POST /auth/login

首次启动时操作者登录（本地账户）。

**Request**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response 200**
```json
{ "ok": true }
```
同时设置 `Set-Cookie: ps_session=<token>; HttpOnly; SameSite=Strict; Path=/`

**Errors**
- `401`：用户名或密码错误

---

### POST /auth/logout

**Request**: 无 body

**Response 200**
```json
{ "ok": true }
```
清除 session cookie。

---

## 2. Requirements

### POST /requirements

创建一条需求。同一默认 project 下已有 active 需求时拒绝。

**Request**
```json
{
  "title": "string",
  "scope": "string"
}
```

**Response 201**
```json
{
  "id": "uuid",
  "title": "string",
  "scope": "string",
  "status": "active",
  "project_id": "uuid",
  "created_at": "iso8601"
}
```

**Errors**
- `400`：title 或 scope 为空
- `409`：同 project 下已有 active 需求

---

### GET /requirements/{id}

**Response 200**
```json
{
  "id": "uuid",
  "title": "string",
  "scope": "string",
  "status": "active | closed",
  "project_id": "uuid",
  "created_at": "iso8601",
  "updated_at": "iso8601"
}
```

**Errors**
- `404`：需求不存在

---

## 3. Artifacts

### PUT /artifacts/{type}

type ∈ `spec | plan | tasks`。上传产物元数据（002 只存路径，不存内容哈希）。要求对应需求存在。

**Request**
```json
{
  "requirement_id": "uuid",
  "file_path": "string"
}
```

**Response 200**（已存在时更新）/ 201（首次创建）
```json
{
  "id": "uuid",
  "requirement_id": "uuid",
  "type": "spec | plan | tasks",
  "file_path": "string",
  "created_at": "iso8601",
  "updated_at": "iso8601"
}
```

**Errors**
- `404`：requirement_id 不存在
- `400`：type 不合法

---

### GET /artifacts/{type}

type ∈ `spec | plan | tasks`。查询默认 requirement 下的产物。

**Query params**: `requirement_id=uuid`（必填）

**Response 200**
```json
{
  "id": "uuid",
  "requirement_id": "uuid",
  "type": "spec | plan | tasks",
  "file_path": "string",
  "created_at": "iso8601",
  "updated_at": "iso8601"
}
```

**Errors**
- `404`：产物不存在

---

## 4. Approvals

### POST /approvals

操作者批准或拒绝某产物。服务端检查顺序约束（spec→plan→tasks）。

**Request**
```json
{
  "artifact_id": "uuid",
  "decision": "approved | rejected"
}
```

**Response 201**
```json
{
  "id": "uuid",
  "artifact_id": "uuid",
  "approver": "string",
  "decided_at": "iso8601",
  "decision": "approved | rejected"
}
```

**Errors**
- `400`：decision 不合法
- `401`：无有效 session（服务身份禁止）
- `403`：前置批准不满足（如 spec 未批时批准 plan）
- `404`：artifact_id 不存在

---

### GET /approvals

查询某产物的批准记录。

**Query params**: `artifact_id=uuid`

**Response 200**
```json
[
  {
    "id": "uuid",
    "artifact_id": "uuid",
    "approver": "string",
    "decided_at": "iso8601",
    "decision": "approved | rejected"
  }
]
```

---

## 5. Runs

### POST /runs

显式启动一个已批准 task 的运行。需要 tasks 已有 `approved` 的 ApprovalRecord。

**Request**
```json
{
  "task_ref": "string",
  "tasks_approval_id": "uuid"
}
```

**Response 201**
```json
{
  "id": "uuid",
  "task_ref": "string",
  "backend": "omp",
  "status": "running",
  "started_at": "iso8601"
}
```

**Errors**
- `403`：tasks 未批准；或操作者身份不合法
- `409`：该 task_ref 已有 running 状态的 Run（单次执行约束，FR-009）

---

### GET /runs/{id}

**Response 200**
```json
{
  "id": "uuid",
  "task_ref": "string",
  "backend": "omp",
  "model": "string | null",
  "session_id": "string | null",
  "status": "running | completed | failed",
  "started_at": "iso8601",
  "finished_at": "iso8601 | null"
}
```

**Errors**
- `404`：Run 不存在

---

### GET /runs/{id}/output

**Response 200**
```json
{
  "run_id": "uuid",
  "stdout": "string | null",
  "stderr": "string | null",
  "exit_code": "integer | null",
  "failure_reason": "string | null",
  "created_at": "iso8601"
}
```

**Errors**
- `404`：Run 不存在或输出尚未写入

---

## 6. Worker 专用端点

worker 使用 `Authorization: Bearer <worker_token>` 认证。操作者 session cookie 不可用于此组端点；此组端点的 token 也不可用于操作者端点（FR-004）。

---

### POST /worker/register

worker 首次启动时注册，获取 Bearer token。

**Request**: 无 body（或携带 worker 版本信息的可选字段）

**Response 201**
```json
{
  "worker_session_id": "uuid",
  "token": "string"
}
```
token 明文仅返回一次，server 只存 hash。

**Errors**
- `409`：当前已有 worker 注册（002 单 worker 约束）

---

### POST /worker/heartbeat

worker 定期心跳，刷新 `WorkerSession.last_heartbeat_at`。

**Auth**: Bearer token

**Request**: 无 body

**Response 200**
```json
{ "ok": true }
```

**Errors**
- `401`：token 无效或已过期

---

### GET /worker/tasks/next

worker 长轮询领取下一个可执行任务。server 检查：对应 tasks Artifact 已有 `approved` ApprovalRecord，且该 `task_ref` 无 `running` 状态的 Run（FR-005/FR-009）。

**Auth**: Bearer token

**Response 200**（有任务）
```json
{
  "run_id": "uuid",
  "task_ref": "string",
  "tasks_approval_id": "uuid",
  "command": "string"
}
```
server 在返回时将 Run.status 置为 `running`，并记录 `started_at`。

**Response 204**：当前无可领取任务，worker 稍后重试。

**Errors**
- `401`：token 无效
- `409`：该 `task_ref` 已有 `status=running` 的 Run（FR-009；并发第二次领取请求返回此状态码）

---

### PATCH /worker/runs/{id}

worker 更新 Run 的执行元信息（model 名、OMP session 标识）。

**Auth**: Bearer token

**Request**
```json
{
  "model": "string | null",
  "session_id": "string | null",
  "work_dir": "string | null"
}
```
`work_dir`：worker 创建的隔离工作目录绝对路径，可选（data-model Run.work_dir 由 worker 写入）。

**Response 200**
```json
{ "ok": true }
```

**Errors**
- `401`：token 无效
- `403`：run_id 不属于该 worker
- `404`：Run 不存在

---

### POST /worker/runs/{id}/output

worker 执行完成后写入 RunOutput，同时将 Run.status 更新为 `completed` 或 `failed`（FR-006/FR-007）。

**Auth**: Bearer token

**Request**
```json
{
  "stdout": "string | null",
  "stderr": "string | null",
  "exit_code": "integer | null",
  "failure_reason": "string | null"
}
```
server 在写入前截断 stdout/stderr 至 ≤8KB（约 8192 字符），追加 `\n[truncated]`（FR-007）。`exit_code` 为 null 且 `failure_reason` 非空时 Run.status = `failed`；`exit_code` = 0 时 = `completed`；其余情况 = `failed`。

**Response 201**
```json
{
  "run_id": "uuid",
  "status": "completed | failed"
}
```

**Errors**
- `401`：token 无效
- `403`：run_id 不属于该 worker
- `404`：Run 不存在
- `409`：该 Run 已有 output（禁止重复写入）

---

## 7. Health

### GET /health

**Response 200**
```json
{
  "status": "ok",
  "db": "ok | error",
  "worker_last_seen": "iso8601 | null"
}
```

无认证要求；db 字段表示 PostgreSQL 连接可达性；`worker_last_seen` 为 null 表示 worker 尚未注册心跳。
