# Feature Specification: 需求类型、优先级与列表筛选

**Feature Branch**: `004-requirement-type-priority`

**Created**: 2026-11-14

**Status**: Draft

**Input**: PRD §5.1（需求字段：类型、优先级）、PRD §14.1（项目与需求页字段）、PRD §15.1（004 版本范围）、003 spec、003 数据模型。

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 为需求设置类型（Priority: P1）

作为操作者，我希望在创建或编辑需求时指定类型（需求/漏洞/改进/调研），以便区分不同性质的工作。

**Why this priority**: 类型是需求分类的基础字段，后续筛选和排序依赖它。

**Independent Test**: 创建四条不同类型的需求，API 响应的 `type` 字段分别为 `feature`/`bug`/`improvement`/`research`；类型不合法时返回 400。

**Acceptance Scenarios**:

1. **Given** 系统已启动，**When** 操作者创建需求时传入 `type: "bug"`，**Then** 响应包含 `type: "bug"`，重新查询时值不变。
2. **Given** 创建需求时传入非法 type（如 `"task"`），**When** 请求到达 server，**Then** 返回 400，不创建记录。
3. **Given** 未传入 type，**When** 操作者创建需求，**Then** type 默认为 `"feature"`。

---

### User Story 2 - 为需求设置优先级（Priority: P1）

作为操作者，我希望为需求指定优先级（P0/P1/P2），以便确定处理顺序。

**Why this priority**: 优先级决定队列排序，P0 表示紧急或阻塞（PRD §5.1）。

**Independent Test**: 创建三条不同优先级的需求，API 响应 `priority` 字段分别为 `P0`/`P1`/`P2`；优先级不合法时返回 400。

**Acceptance Scenarios**:

1. **Given** 操作者创建需求时传入 `priority: "P0"`，**When** 请求提交，**Then** 响应包含 `priority: "P0"`；`priority` 不赋予任何审批权限。
2. **Given** 传入非法优先级（如 `"high"`），**When** 请求到达 server，**Then** 返回 400。
3. **Given** 未传入 priority，**When** 操作者创建需求，**Then** priority 默认为 `"P2"`。

---

### User Story 3 - 按类型和优先级筛选需求列表（Priority: P1）

作为操作者，我希望在需求列表页按类型和/或优先级筛选，以便快速定位所需工作。

**Why this priority**: 无筛选时列表随项目增长难以管理；筛选是 PRD §14.1 需求页的核心交互。

**Independent Test**: 有多条不同类型和优先级的需求时，`GET /requirements?type=bug` 只返回 bug 类型的需求；`GET /requirements?priority=P0` 只返回 P0 需求；组合筛选 `?type=bug&priority=P0` 只返回同时满足的需求；无匹配时返回 `[]`。

**Acceptance Scenarios**:

1. **Given** 存在 feature/P1 和 bug/P0 两条需求，**When** 请求 `GET /requirements?type=bug`，**Then** 只返回 bug 那条。
2. **Given** 相同数据，**When** 请求 `GET /requirements?priority=P0`，**Then** 只返回 P0 那条。
3. **Given** 相同数据，**When** 请求 `GET /requirements?type=feature&priority=P0`，**Then** 返回 `[]`（无匹配）。
4. **Given** GUI 需求列表页，**When** 操作者通过下拉框选择类型或优先级，**Then** 表格即时更新，URL 或 state 中保留筛选条件。

---

### Edge Cases

- `type` 与 `priority` 均可在创建后通过 `PATCH /requirements/{id}` 更新；更新时仅接受合法枚举值，其他字段不受影响。
- `GET /requirements` 筛选参数均为可选；不传时行为与 003 一致（返回全部，`seq_number` 升序，limit 200）。
- 筛选不影响 `seq_number` 的分配与排序规则。

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `requirements` 表 MUST 增加 `type` 列，枚举 `feature`/`bug`/`improvement`/`research`，NOT NULL，默认 `feature`；新增对应 SQLAlchemy Enum 类型。
- **FR-002**: `requirements` 表 MUST 增加 `priority` 列，枚举 `P0`/`P1`/`P2`，NOT NULL，默认 `P2`。
- **FR-003**: `POST /requirements` MUST 接受 `type` 和 `priority` 可选字段（缺省取默认值）；非法值返回 400。
- **FR-004**: `GET /requirements` MUST 支持 `type` 和 `priority` 可选查询参数进行筛选，不传时不过滤；筛选组合以 AND 逻辑应用。
- **FR-005**: `GET /requirements/{id_or_display}` 响应体 MUST 包含 `type` 与 `priority` 字段。
- **FR-006**: `PATCH /requirements/{id_or_display}` 新端点 MUST 允许更新 `type`、`priority`、`title`、`scope` 中的一个或多个字段；未传字段保持不变；非法枚举值返回 400。
- **FR-007**: GUI 需求列表页 MUST 显示 `type` 和 `priority` 列，并提供类型和优先级下拉筛选控件。
- **FR-008**: GUI 需求详情页 MUST 显示 `type` 和 `priority` 字段。
- **FR-009**: GUI 新建需求页 MUST 提供 `type` 和 `priority` 下拉选择（含默认值）。

### Key Entities（变更）

- **Requirement**（新增字段）：`type` 枚举（feature/bug/improvement/research）、`priority` 枚举（P0/P1/P2）；新增 Alembic 迁移，chained from `a1b2c3d4e5f6`。

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 创建 `type: "bug", priority: "P0"` 的需求，API 响应与重新查询均包含这两个字段且值不变。
- **SC-002**: 传入非法 type 或 priority 时，POST/PATCH 返回 400，不创建/修改记录。
- **SC-003**: `GET /requirements?type=bug` 仅返回 bug 类型需求；`?priority=P0` 仅返回 P0 需求；组合筛选以 AND 逻辑生效。
- **SC-004**: `GET /requirements`（无筛选参数）行为与 003 完全一致：全部返回，`seq_number` 升序，limit 200。
- **SC-005**: PATCH 更新单字段后，其他字段值不变。

---

## Assumptions

- 003 已验收（0.2.0）；本 spec 在 003 数据模型（alembic `a1b2c3d4e5f6`）基础上追加新迁移。
- PostgreSQL 18.6 集群，`DATABASE_URL` 由 `.env` 提供。
- 单一默认项目，单操作者。
- 优先级仅影响显示与排序建议，不赋予审批权限（PRD §5.1）。

---

## Out of Scope

- 自动分类建议（Jev，026）
- 类型/优先级的批量修改
- 负责人、来源、外部引用等其他 §5.1 字段（后续版本）
- 需求版本历史（§5.3，后续）
- 多项目、多组织（016–017）
