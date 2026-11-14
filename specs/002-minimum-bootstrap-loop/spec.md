# Feature Specification: 最小自举构建循环

**Feature Branch**: `002-minimum-bootstrap-loop`

**Created**: 2026-11-13

**Status**: Draft

**Input**: PRD §15.1 002 行、PRD §4.2、PRD §4.3、001 plan §8-§9、`docs/sources/product-decisions.md`、`docs/sources/behavior-notes.md`（历史行为研究）。

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 启动最小系统（Priority: P1）

作为本机单一操作者，我要能在本机启动 Next.js 页面、Python server、Python worker 与 PostgreSQL，通过浏览器打开页面，以便进入研发循环。

**Why this priority**: 其余所有用户故事都依赖系统可达。

**Independent Test**: 四个进程均启动，`http://localhost` 页面在浏览器可打开，服务只绑定 loopback。

**Acceptance Scenarios**:

1. **Given** 本机有 Python 3.11+、Node.js、PostgreSQL 且均就绪，**When** 操作者按 quickstart 启动四个进程，**Then** 浏览器可访问首页，非本机地址不可达，无需组织或账户配置。
2. **Given** 任意一个进程未启动，**When** 操作者访问页面，**Then** 页面显示具体缺失进程提示，不显示空成功状态。

---

### User Story 2 - 登记一项需求（Priority: P1）

作为本机单一操作者，我要登记一项研发需求并重新查询它，以便后续批准产物与启动运行都挂在同一条需求上。

**Why this priority**: 002 循环的起点；无需求则无法启动任何批准或执行。

**Independent Test**: 创建一条需求后重新查询仍存在，包含标题与目标范围；同一项目下只允许有一条活动需求。

**Acceptance Scenarios**:

1. **Given** 系统已启动，**When** 操作者通过页面创建一条需求，**Then** 需求存入 server，标识、标题、目标范围与状态可重新查询；不依赖 Gitea issue。
2. **Given** 已存在一条活动需求，**When** 操作者试图创建第二条，**Then** 请求被拒绝或入口不可用；不出现两条同时活跃的需求。

---

### User Story 3 - 准备并逐层批准产物（Priority: P1）

作为本机单一操作者，我要能在页面阅读需求下的 spec/plan/tasks 三份产物并逐层批准，以便只有获批任务才能执行。

**Why this priority**: 批准 tasks 是启动运行的前置条件；批准顺序的正确性是 Protostar 安全模型的核心。

**Independent Test**: spec→plan→tasks 顺序生效；越序批准被拒绝；服务身份批准被拒绝；批准 tasks 后不自动触发运行；每次批准产生带操作者、时间、对象与决定的记录。

**Acceptance Scenarios**:

1. **Given** 需求存在，**When** 操作者批准 spec，**Then** spec 批准记录落库，可重新查询（批准人、时间、对象、决定）；未批准 plan 时不能批准 plan。
2. **Given** spec 已批准且 plan 存在，**When** 操作者批准 plan，**Then** plan 批准记录落库；未批准 tasks 时不能批准 tasks。
3. **Given** plan 已批准且 tasks 存在，**When** 操作者批准 tasks，**Then** tasks 批准记录落库；系统不自动启动运行。
4. **Given** spec 未批准，**When** 任何操作者试图直接批准 plan，**Then** 请求被拒绝。
5. **Given** worker 服务身份，**When** 试图调用批准接口，**Then** 请求被拒绝；批准只来自人类操作者会话。

---

### User Story 4 - 显式启动运行并由 OMP 真实执行（Priority: P1）

作为本机单一操作者，我要显式启动一个已批准 task，由本机 OMP 真实执行，以便验证 Protostar 能完成一次从登记到输出的完整研发循环。

**Why this priority**: 这是 002 验收的核心证据——真实进程执行、真实输出落库。

**Independent Test**: 只有已批准 tasks 下的 task 才可启动；启动后产生一次运行；运行记录包含 OMP、工作目录、模型、session、开始/结束时间与真实结果；浏览器页面显示真实命令、stdout/stderr（有界截断）、退出码。

**Acceptance Scenarios**:

1. **Given** tasks 已批准，**When** 操作者在页面显式启动一个 task，**Then** server 派发 job，worker 领取并启动 OMP 进程，运行记录包含 OMP 后端标识、工作目录、模型名、session 标识与开始时间。
2. **Given** 运行完成，**When** 操作者查看结果页，**Then** 页面显示实际命令、stdout/stderr（若长则截断至约 8KB）、退出码、结束时间；失败不显示为空成功。
3. **Given** tasks 未批准，**When** 操作者试图启动任意 task，**Then** 请求被拒绝。
4. **Given** 一个 task 正在运行，**When** 另一个 worker 也试图领取同一 task，**Then** 被拒绝；同一 task 同时只有一次执行。

---

### User Story 5 - 验证单机与单需求边界（Priority: P2）

作为操作者，我要确认系统只在本机、单项目、单需求范围内工作。

**Why this priority**: 002 是人工引导期，扩大暴露面会影响后续版本的安全模型。

**Independent Test**: 服务只绑定 loopback；同一默认项目下不能建第二条活动需求；无 OIDC/组织管理入口。

**Acceptance Scenarios**:

1. **Given** 系统运行中，**When** 从非本机尝试连接，**Then** 连接不可达。
2. **Given** 已有一条活动需求，**When** 操作者试图建第二条，**Then** 请求被拒绝。

---

### Edge Cases

- OMP 进程崩溃或挂起时：运行记录保留失败状态与已观测到的输出，页面不显示空成功。
- 重启 server/worker 后：运行记录已持久化，不丢失；正在执行的运行标记为中断（不自动恢复，属 011 范围）。
- 操作者关闭浏览器再重新打开：登录凭据（本地会话 cookie）仍有效，不要求重登录；无 OIDC 流程。
- 产物文件内容改变后再批准：002 只记录批准时间与对象路径，不绑哈希（哈希绑定归 006）。

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统 MUST 在本机单操作者模式下以 Next.js、Python server、Python worker、PostgreSQL 四进程启动，服务仅绑定 loopback。
- **FR-002**: server MUST 提供需求创建与查询接口；一个默认项目下只允许一条活动需求；不依赖 Gitea issue。
- **FR-003**: 操作者 MUST 只能按 spec→plan→tasks 顺序批准；越序批准请求 MUST 被拒绝。
- **FR-004**: 每次批准 MUST 产生持久化记录（批准人、时间、批准对象路径、决定）；服务身份批准请求 MUST 被拒绝。
- **FR-005**: 只有对应 tasks 已批准的 task 才能被启动；未批准的 task 启动请求 MUST 被拒绝。
- **FR-006**: 启动运行后，worker MUST 通过 OMP 在隔离工作目录执行，运行记录 MUST 保存后端标识、工作目录、模型、session 标识与开始/结束时间。
- **FR-007**: 运行结束后 server MUST 保存实际 stdout/stderr（有界，约 8KB）、退出码与结束时间；失败 MUST 记录失败原因，不以空成功表示异常。
- **FR-008**: Web 页面 MUST 显示真实命令、stdout/stderr（有界截断）、退出码与失败原因；内容来自运行记录，不由助手文字推断。
- **FR-009**: 同一 task 同时只允许一次执行；并发领取请求 MUST 被拒绝。
- **FR-010**: 系统 MUST 不提供 OIDC 登录、组织创建/邀请、成员角色等功能；操作者身份通过本地会话 cookie 保持。
- **FR-011**: 验收循环 MUST 包含一次完整路径：登记需求 → 批准 spec/plan/tasks → 显式启动 task → OMP 真实执行 → 浏览器显示真实结果。
- **FR-012**: 002 自身 tasks.md 中的至少一个 task 必须可以被 OMP 执行（提供一个可在隔离目录执行的脚本或命令），以作为 FR-011 验收的执行对象。

### Key Entities

- **Requirement**：标识、标题、目标范围、状态（active/closed）；一个默认项目下同时只有一条 active。
- **Artifact**（spec/plan/tasks）：关联需求的 Markdown 产物；有路径与版本标识；002 不绑哈希。
- **ApprovalRecord**：批准人（本地操作者标识）、时间、批准对象路径、决定（approved/rejected）；关联 Artifact。
- **Run**：关联已批准 task；后端标识（OMP）、工作目录、模型、session、开始/结束时间、状态（running/completed/failed）。
- **RunOutput**：关联 Run；stdout（有界）、stderr（有界）、退出码、失败原因。

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 操作者可在约 1 小时内完成从启动系统到浏览器看到 OMP 真实执行结果的完整循环。
- **SC-002**: 越序批准（如未批准 spec 就批准 plan）被 100% 拒绝；服务身份批准被 100% 拒绝。
- **SC-003**: 每次运行记录可在数据库中查询，含后端、session、真实 stdout/stderr 与退出码；运行结果与进程实际输出一致。
- **SC-004**: 非本机地址访问 server 100% 不可达（loopback only）。
- **SC-005**: 002 功能范围内不出现 Hermes/Codex 多后端选择、OIDC 登录、组织管理、图模型、取消/重启等属于后续版本的能力。

---

## Assumptions

- 本机已安装 Python 3.11+、uv、Node.js 18+、PostgreSQL 16，以及 OMP 可执行文件。
- 操作者即为系统唯一用户；无需独立注册流程，使用预置本地账户或首次启动时设定密码。
- 002 的"已批准 task"执行对象是 002 自身 tasks.md 中的一个轻量任务（如运行一个文档检查脚本或健康检查命令），以此完成最小可验收循环；003 起才由 Protostar 执行真正的功能开发任务。
- 批准产物时不绑定内容哈希（归 006 实现），只记录路径与时间。
- 002 不实现用户取消、重启恢复、租约、离线事件（归 010/011）。
- 002 不实现多 worker、backend preset、能力匹配（归 014）。
- 长输出截断上限约 8KB，不要求客户端分页（归 027）。

---

## Out of Scope

- OIDC/OAuth 登录、组织/成员管理、项目权限（002 单操作者无需，归 015–017）
- 文件版本哈希绑定、差异视图（归 006）
- 多后端（Hermes/Codex）、backend preset（归 012–014）
- 取消、重启恢复、租约、离线事件（归 010/011）
- 完整 job attempt 生命周期（归 007）
- 事件存储、SSE、时间线（归 027）
- CodeGraph、Hindsight（归 022–025）
- Pipeline/PM 图（归 008–009）
- CLI/MCP/skills（归 018–020）
- Gitea 集成（归 021）
- 数据导入（归 031）
- 快速分类与建议（W11，归 026）
- **0.1.0 发布与关单**：属独立人工授权步骤，不在本 spec 的实现范围；本 spec 的验收通过是 001 plan §8.4 引导期退出条件之一。
