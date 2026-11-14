# 002 Quickstart：本机启动与验收指南

**Branch**: `002-minimum-bootstrap-loop` | **Date**: 2026-11-13

**目的**：本文档是 002 的可操作验收指南，涵盖前置检查、安装、启动到完整验收循环（FR-011）。命令中的占位符用 `<变量名>` 标注。

---

## 1. 前置条件检查

在开始之前确认以下工具均已安装并可从命令行调用：

| 工具 | 最低版本 | 检查命令 |
|---|---|---|
| Python | 3.11 | `python --version` |
| uv | 任意最新 | `uv --version` |
| Node.js | 18 | `node --version` |
| PostgreSQL（本地） | 16 | `psql --version` |
| OMP 可执行文件 | 任意 | `omp --version` 或 `omp --help` |

如任一工具缺失，安装后再继续。

---

## 2. 克隆仓库与初始化依赖

```bash
# 进入 Protostar 仓库根目录
cd <protostar-repo-root>

# 安装 server 依赖
cd protostar_server
uv sync

# 安装 worker 依赖
cd ../protostar_worker
uv sync

# 安装 GUI 依赖
cd ../protostar_gui
npm install
```

---

## 3. 初始化数据库

```bash
# 创建 PostgreSQL 数据库（需要 psql 本地连接权限）
createdb protostar_dev

# 配置连接字符串（在 protostar_server 目录下创建 .env）
echo 'DATABASE_URL=postgresql+psycopg://localhost/protostar_dev' > protostar_server/.env

# 运行 Alembic 迁移
cd protostar_server
uv run alembic upgrade head
```

预期结果：迁移成功，无错误输出；`psql protostar_dev -c '\dt'` 显示五张表（requirements、artifacts、approval_records、runs、run_outputs）。

---

## 4. 启动四个进程

在四个独立终端中分别运行（不要合并为一个进程）：

**终端 A — PostgreSQL**（若使用本地服务，确保已启动）
```bash
# macOS: brew services start postgresql@16
# Linux: sudo systemctl start postgresql
```

**终端 B — protostar_server**
```bash
cd protostar_server
uv run uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
预期：`INFO: Uvicorn running on http://127.0.0.1:8000`

**终端 C — protostar_worker**
```bash
cd protostar_worker
OMP_PATH=<omp-executable-path> uv run python -m worker.main --server http://127.0.0.1:8000
```
预期：worker 启动并输出 `Worker ready, polling server...`

**终端 D — protostar_gui**
```bash
cd protostar_gui
npm run dev
```
预期：`Local: http://localhost:3000`

---

## 5. 打开页面

在浏览器访问：`http://localhost:3000`

预期结果：
- 显示首页，系统状态区显示 server 在线（绿色或 OK 标记）
- 若 server 未启动，页面显示"server 不可达"，不显示空成功状态（FR-002 验收场景 2）

---

## 6. 登录

访问 `http://localhost:3000/login`（或首页自动跳转）：
- 输入预置本地账户用户名与密码（首次启动时在 `.env` 配置）
- 登录成功后跳回首页，session cookie 由 server 设置

---

## 7. 登记一条需求

在需求页面（`http://localhost:3000/requirements/new`）：
1. 填写"标题"与"目标范围"
2. 提交

预期结果：
- 页面跳转到需求详情，显示 ID、标题、状态 `active`
- `GET http://127.0.0.1:8000/api/v1/requirements/<id>` 返回同一数据

---

## 8. 上传并逐层批准产物

### 8.1 上传 spec

在批准页面上传 spec.md 路径（相对路径）→ 提交。

预期：server 返回 201，Artifact type=spec 记录落库。

### 8.2 批准 spec

在批准页面对 spec Artifact 点击"批准"。

预期：ApprovalRecord decision=approved 落库；批准记录含 approver（当前操作者）与时间戳。

### 8.3 验证越序约束（在批准 plan 前执行）

在上传 plan 之前先测试越序拒绝：
1. 此时已有 spec 已批准，plan Artifact 尚未上传
2. 尝试直接调用 `POST /api/v1/approvals`，body 中填写一个不存在的 plan artifact_id
3. 预期：返回 `404`（artifact 不存在）

然后上传 plan Artifact：在批准页面上传 plan.md 路径（相对路径）→ 提交，type=plan。

再测试 spec 未批时批准 plan 的场景（需另建一条测试需求）：
- 创建新需求，上传 spec 与 plan Artifact（均不批准），直接尝试批准 plan → 预期 `403 Forbidden`（FR-003 验收场景 4）

验证通过后，回到原始需求，对 plan Artifact 点击"批准"。

预期：ApprovalRecord decision=approved 落库；批准记录含 approver 与时间戳。

### 8.4 上传并批准 tasks

同上，type=tasks。

---

## 9. 显式启动一个 task

在批准页面确认 tasks 已批准后，点击"启动 task"，选择 002 tasks.md 中至少一个 task（如 `verify-health-check` 或类似）。

预期结果：
- 页面显示 Run 已创建，status=running
- worker 领取 task，启动 OMP subprocess
- 片刻后 status 变为 completed 或 failed

---

## 10. 查看运行结果

访问 `http://localhost:3000/runs/<run-id>`（或从运行列表点击）：

**预期**：
- 显示实际命令、stdout（若超 8KB 则截断并显示 `[truncated]`）、stderr、退出码
- 若退出码非 0，显示 failure_reason，不显示空成功（FR-007/FR-008）
- 结束时间已填充

---

## 11. 验收判断标准

| 验收项 | 通过条件 | 失败标志 |
|---|---|---|
| 系统启动 | 四进程均运行，`http://localhost:3000` 可达 | 任一进程崩溃、端口冲突、页面空白 |
| loopback 隔离（SC-004） | 从非本机地址（或 `0.0.0.0`）访问 `http://<非127地址>:8000` 连接不可达；`curl --interface <非loopback-IP> http://127.0.0.1:8000/api/v1/health` 返回连接拒绝或无响应 | 非本机地址可成功连接 |
| 需求登记 | GET 可重新查询，status=active | 500 错误、数据未落库 |
| 越序批准拒绝 | spec 未批时批准 plan 返回 403 | 返回 2xx |
| 批准记录 | 含 approver、时间、决定 | 任一字段缺失 |
| 服务身份批准拒绝（FR-004） | 使用 WorkerSession Bearer token 调用 POST /approvals → 401/403 | 返回 2xx |
| OMP 执行 | Run 状态变为 completed 或 failed，RunOutput 有 exit_code | status 永远 running、output 为空 |
| 结果展示 | 浏览器显示真实 stdout/stderr 与退出码 | 显示"执行成功"但无实际内容 |

---

## 12. 相关文档

- [data-model.md](data-model.md)：实体字段与约束
- [contracts/server-api.md](contracts/server-api.md)：REST API 完整契约
- [spec.md](spec.md)：需求说明与验收场景
