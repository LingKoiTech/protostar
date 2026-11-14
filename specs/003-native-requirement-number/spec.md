# Feature Specification: 原生需求编号与列表/详情

**Feature Branch**: `003-native-requirement-number`

**Created**: 2026-11-14

**Status**: Draft

**Input**: PRD §5.1（需求编号）、PRD §15.1（003 版本范围）、PRD §14.1（列表上限 200）、002 spec、002 数据模型（alembic `9205120d3abe`）。

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 通过稳定编号引用需求（Priority: P1）

作为操作者，我希望每条需求都有一个稳定的显示编号（PRO-1、PRO-2……），以便在对话中引用时不必使用 UUID。

**Why this priority**: UUID 不适合人工对话；编号是后续所有引用（批准、运行、会话）的基础。

**Independent Test**: 创建两条需求（允许第一条 active），验证两条记录的 `seq_number` 分别为 1 和 2，`display_number` 分别为 `PRO-1`、`PRO-2`；重启 server 后编号不变。

**Acceptance Scenarios**:

1. **Given** 默认项目下没有需求，**When** 操作者创建第一条需求，**Then** 该需求 `seq_number` 为 1，`display_number` 为 `PRO-1`；该值在后续操作中不改变。
2. **Given** 已有一条编号 PRO-1 的需求（已关闭），**When** 操作者创建新需求，**Then** 新需求 `seq_number` 为 2，`display_number` 为 `PRO-2`；编号不复用。
3. **Given** 两个并发的创建请求同时到达，**When** 两个事务均提交，**Then** `seq_number` 无重复，每条各得唯一编号。

---

### User Story 2 - 列出默认项目的所有需求（Priority: P1）

作为操作者，我希望能列出默认项目的所有需求，以便了解当前进展。

**Why this priority**: 列表是管理工作进度的日常入口。

**Independent Test**: API 返回按 `seq_number` 升序排列、最多 200 条的列表，每条包含 `seq_number`、`display_number`、`title`、`status`。

**Acceptance Scenarios**:

1. **Given** 默认项目下有若干需求，**When** 操作者访问 `/requirements` 页面，**Then** 页面展示所有需求（含 `display_number`、标题、状态），按编号升序排列。
2. **Given** 项目下没有需求，**When** 操作者访问列表页，**Then** 页面显示空状态提示，不报错。

---

### User Story 3 - 通过编号或 UUID 查看需求详情（Priority: P1）

作为操作者，我希望能通过显示编号或 UUID 打开需求详情页。

**Why this priority**: 操作者在对话中持有的是显示编号，详情页需支持两种寻址方式。

**Independent Test**: 分别用 UUID 和显示编号请求同一需求，返回内容相同，均包含 `seq_number` 和 `display_number`。

**Acceptance Scenarios**:

1. **Given** 一条 `display_number` 为 `PRO-3`、UUID 已知的需求，**When** 操作者访问 `/requirements/PRO-3`，**Then** 详情页显示该需求完整信息，含 `display_number`。
2. **Given** 同一条需求，**When** 操作者访问 `/requirements/{uuid}`，**Then** 返回同样的完整信息。
3. **Given** 一个不存在的编号或 UUID，**When** 操作者访问对应路径，**Then** 返回 404，不崩溃。

---

### Edge Cases

- `seq_number` 通过对 `projects.next_requirement_number` 执行 `UPDATE … RETURNING` 原子自增分配，不使用库级 PostgreSQL sequence（sequence 是库级而非项目级，无法保证项目作用域唯一）。
- `seq_number` 一经写入不可修改；`display_number`（`{code}-{seq_number}`）由服务端在响应时计算，不持久化。
- `projects` 表新增 `code VARCHAR NOT NULL DEFAULT 'PRO'` 和 `next_requirement_number INTEGER NOT NULL DEFAULT 0`；迁移后默认项目的 `code` 为 `PRO`。
- 现有 `requirements` 数据：迁移脚本按 `created_at` 升序为其补填 `seq_number`，并将 `projects.next_requirement_number` 设为当前最大值。
- `uq_requirements_project_active`（002 FR-002：同一项目最多一条 active 需求）在本次迁移中**被移除**，替换为 `(project_id, seq_number) UNIQUE`。**偏离说明**：003 允许同一项目存在多条活动需求（User Story 1 场景 2 要求能创建第二条 closed 需求），保留 002 该限制会导致创建第二条时直接 409，FR-001 和 SC-005 无法通过。

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `requirements` 表 MUST 增加 `seq_number INTEGER NOT NULL` 列，项目作用域唯一，写入后不可修改；通过 `projects.next_requirement_number` 原子自增分配，并发安全。
- **FR-002**: `projects` 表 MUST 增加 `code VARCHAR NOT NULL DEFAULT 'PRO'` 和 `next_requirement_number INTEGER NOT NULL DEFAULT 0`；`display_number` 格式为 `{project.code}-{seq_number}`，由服务端计算，不持久化。
- **FR-003**: `uq_requirements_project_active` 局部唯一索引 MUST 在本次迁移中被删除；替换为 `(project_id, seq_number) UNIQUE`。
- **FR-004**: `GET /requirements` MUST 返回默认项目所有需求，按 `seq_number` 升序，上限 200 条，每条包含 `seq_number`、`display_number`、`id`、`title`、`status`、`created_at`、`updated_at`。
- **FR-005**: `GET /requirements/{id_or_display}` MUST 同时接受 UUID 和 `PRO-{n}` 格式作为路径参数，响应体包含 `seq_number` 与 `display_number`。
- **FR-006**: `POST /requirements` 响应体 MUST 包含 `seq_number` 与 `display_number`。
- **FR-007**: GUI `/requirements` 页 MUST 展示 `display_number`、`title`、`status` 列表，按编号升序，空状态时显示提示。
- **FR-008**: GUI `/requirements/{id}` 详情页 MUST 展示 `display_number`、`title`、`scope`、`status`、`created_at`、`updated_at`；支持 UUID 或 `display_number` 路径参数。

### Key Entities（变更）

- **Project**（新增字段）：`code VARCHAR NOT NULL DEFAULT 'PRO'`；`next_requirement_number INTEGER NOT NULL DEFAULT 0`（分配游标，不暴露于 API）。
- **Requirement**（新增字段）：`seq_number INTEGER NOT NULL`，`(project_id, seq_number) UNIQUE`；`display_number` 为派生字段，仅在 API 响应中出现。

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 创建需求后，API 响应中 `display_number` 格式为 `{code}-{n}`，`seq_number` 为正整数，重启后不变。
- **SC-002**: `GET /requirements` 返回列表，`seq_number` 严格升序，每条含 `display_number`，最多 200 条。
- **SC-003**: 以 `PRO-{n}` 和对应 UUID 分别请求详情，HTTP 200，响应体内容相同。
- **SC-004**: 请求不存在的编号或 UUID，HTTP 404。
- **SC-005**: 并发创建两条需求，两条 `seq_number` 无重复。
- **SC-006**: 迁移后现有需求数据的 `seq_number` 已按 `created_at` 升序填充，`uq_requirements_project_active` 索引不存在。

---

## Assumptions

- 002 已发布（0.1.0）；本 spec 在 002 数据模型（`9205120d3abe`）基础上追加新迁移。
- PostgreSQL 18.6 集群，`DATABASE_URL` 由 `.env` 提供，`sslmode=disable`。
- 单一默认项目，`code = 'PRO'`；多项目、多组织归 003+。
- 移除 `uq_requirements_project_active` 是本次已批准的偏离；后续多组织场景的 active 限制由 016/017 重新设计。

---

## Out of Scope

- 多项目、多组织（003+）
- 需求类型/优先级/筛选（004）
- Gitea issue 链接（021）
- 分页游标（future）
- `display_number` 格式可配置
- 需求编号的修改或重置
