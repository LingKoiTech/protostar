# Implementation Plan: 需求类型、优先级与列表筛选

**Branch**: `004-requirement-type-priority` | **Date**: 2026-11-14 | **Spec**: [spec.md](spec.md)

**Input**: `specs/004-requirement-type-priority/spec.md`

**Status**: 待 HumanMiao 审批。本文件是规划产物，不批准任何实现、tasks 或发布。

---

## 批准栏

| 字段 | 内容 |
|---|---|
| 批准人 | |
| 批准日期 | |
| 批准范围 | |
| 批准依据 | |

---

## Stage 1: Alembic 迁移

**文件**: `protostar_server/alembic/versions/<rev>_add_requirement_type_priority.py`（新建，`down_revision = "a1b2c3d4e5f6"`）

变更顺序：

1. 创建枚举类型：`requirement_type('feature', 'bug', 'improvement', 'research')`
2. 创建枚举类型：`requirement_priority('P0', 'P1', 'P2')`
3. `op.add_column("requirements", Column("type", sa.Enum(..., name="requirement_type"), nullable=False, server_default="feature"))`
4. `op.add_column("requirements", Column("priority", sa.Enum(..., name="requirement_priority"), nullable=False, server_default="P2"))`
5. 数据回填（防止旧记录为 NULL）：
   ```sql
   UPDATE requirements SET type = 'feature' WHERE type IS NULL;
   UPDATE requirements SET priority = 'P2' WHERE priority IS NULL;
   ```

**downgrade**：删除 `requirements.type` 和 `requirements.priority` 列，然后删除两个枚举类型。

**验证**: 在 `protostar_server/` 下运行 `DATABASE_URL=... ../.venv/Scripts/python.exe -m alembic upgrade head`，退出码 0；运行 `DATABASE_URL=... ../.venv/Scripts/python.exe -c "from app.models.requirement import Requirement; print([c.name for c in Requirement.__table__.columns])"` 确认输出含 `'type'` 和 `'priority'`。

---

## Stage 2: ORM 模型

**文件**: `protostar_server/app/models/requirement.py`

沿用现有 `status` 列的 `Enum` 模式，新增两个映射列：

```python
type: Mapped[str] = mapped_column(
    Enum("feature", "bug", "improvement", "research", name="requirement_type"),
    nullable=False,
    default="feature",
)
priority: Mapped[str] = mapped_column(
    Enum("P0", "P1", "P2", name="requirement_priority"),
    nullable=False,
    default="P2",
)
```

**验证**: 在 `protostar_server/` 下运行 `DATABASE_URL=... ../.venv/Scripts/python.exe -c "from app.models.requirement import Requirement; print('ok')"` 无报错。

---

## Stage 3: Pydantic Schema

**文件**: `protostar_server/app/schemas/requirements.py`

三处改动：

1. `RequirementCreate`：新增两个可选字段（缺省取枚举默认值）：
   ```python
   type: str = "feature"
   priority: str = "P2"
   ```

2. `RequirementResponse`：新增两个必填字段：
   ```python
   type: str
   priority: str
   ```

3. 新增 `RequirementPatch`（全字段可选）：
   ```python
   class RequirementPatch(BaseModel):
       title: str | None = None
       scope: str | None = None
       type: str | None = None
       priority: str | None = None
   ```

4. `_to_response` 中补充 `type=req.type, priority=req.priority`。

**验证**: `../.venv/Scripts/python.exe -c "from app.schemas.requirements import RequirementResponse, RequirementPatch; assert 'type' in RequirementResponse.model_fields; assert 'priority' in RequirementPatch.model_fields; print('ok')"` 无报错。

---

## Stage 4: Router

**文件**: `protostar_server/app/routers/requirements.py`

### 4.1 `POST /requirements`（扩展现有端点）

- `body` 类型已为 `RequirementCreate`；新增 `type` 和 `priority` 自动传入 `Requirement` 构造器。
- 在 `Requirement(...)` 构造时补充 `type=body.type, priority=body.priority`。
- 非法枚举值由 Pydantic validator 拦截（或在写入前手工校验），返回 400。

### 4.2 `GET /requirements`（新增 type/priority 过滤）

- 在现有列表查询的 `select` 语句后追加可选 `WHERE` 子句：
  - 若 `type` 参数存在：`.where(Requirement.type == type)`
  - 若 `priority` 参数存在：`.where(Requirement.priority == priority)`
  - 两者同时存在时 AND 逻辑自动生效（链式 `.where`）。
- 非法枚举值的查询参数返回 `[]`（SQL WHERE 无匹配），不必主动 400。
- 路由签名追加：`type: str | None = None, priority: str | None = None`

### 4.3 `PATCH /requirements/{id_or_display}`（新端点）

- **鉴权**：`user: LocalUser = Depends(get_current_user)`（与其他需求端点一致）。
- 路径参数复用现有 `GET /{id_or_display}` 的解析逻辑（`PRO-N` 或 UUID）。
- `body: RequirementPatch`；逐字段：非 `None` 时写入 `setattr(req, field, value)`。
- 枚举合法性校验：`type` 须在 `{"feature","bug","improvement","research"}`，`priority` 须在 `{"P0","P1","P2"}`，否则 raise `HTTPException(400)`。
- `req.updated_at` 由 ORM `onupdate` 自动刷新。
- 提交后调用 `_to_response(req, project)` 返回 `RequirementResponse`。

**验证**：
```bash
# 创建含 type/priority
curl -s -b cookies.txt -X POST http://127.0.0.1:8000/api/v1/requirements \
  -H "Content-Type: application/json" \
  -d '{"title":"T","scope":"S","type":"bug","priority":"P0"}' | python -m json.tool

# 筛选
curl -s -b cookies.txt "http://127.0.0.1:8000/api/v1/requirements?type=bug&priority=P0"

# PATCH 更新单字段
curl -s -b cookies.txt -X PATCH http://127.0.0.1:8000/api/v1/requirements/PRO-1 \
  -H "Content-Type: application/json" \
  -d '{"priority":"P1"}' | python -m json.tool

# 非法枚举值 → 400
curl -s -o /dev/null -w "%{http_code}" -b cookies.txt -X POST \
  http://127.0.0.1:8000/api/v1/requirements \
  -H "Content-Type: application/json" \
  -d '{"title":"T","scope":"S","type":"task"}'
```

---

## Stage 5: GUI 页面

### `protostar_gui/app/requirements/page.tsx`（列表页）

- 在现有表格中追加 `type` 和 `priority` 两列。
- 在表格上方新增两个 `<select>` 下拉框（`type` 选项：全部/feature/bug/improvement/research；`priority` 选项：全部/P0/P1/P2），使用 React `useState` 管理选中值。
- 选中值变化时重新拼接 URL 参数并重新 `fetch`（或客户端过滤已有数据），即时更新表格。

### `protostar_gui/app/requirements/[id]/page.tsx`（详情页）

- 在现有字段展示区新增 `type` 和 `priority` 两行（与 `status`、`display_number` 同级）。

### `protostar_gui/app/requirements/new/page.tsx`（新建页）

- 在表单中新增 `type` `<select>`（默认 `feature`，选项同上）和 `priority` `<select>`（默认 `P2`，选项 P0/P1/P2）。
- 提交时将 `type` 和 `priority` 一并包含在 POST body 中。

**验证**：登录后访问 `http://localhost:3000/requirements`，列表含 `type`/`priority` 列；下拉筛选后表格即时更新；详情页显示两字段；新建时下拉默认值分别为 `feature` 和 `P2`，提交后 API 响应含正确值。

---

## FR/SC 覆盖

| 需求/标准 | 实现阶段 |
|---|---|
| FR-001 requirements 表增加 type 列，枚举约束，NOT NULL，默认 feature | Stage 1、Stage 2 |
| FR-002 requirements 表增加 priority 列，枚举约束，NOT NULL，默认 P2 | Stage 1、Stage 2 |
| FR-003 POST /requirements 接受 type/priority 可选字段，非法值 400 | Stage 3、Stage 4.1 |
| FR-004 GET /requirements 支持 type/priority 查询参数，AND 逻辑过滤 | Stage 4.2 |
| FR-005 GET /requirements/{id_or_display} 响应含 type 与 priority | Stage 3、Stage 4 |
| FR-006 PATCH /requirements/{id_or_display} 更新任意字段子集，非法枚举 400 | Stage 3、Stage 4.3 |
| FR-007 GUI 列表页显示 type/priority 列及下拉筛选控件 | Stage 5 |
| FR-008 GUI 详情页显示 type 和 priority | Stage 5 |
| FR-009 GUI 新建页提供 type/priority 下拉，含默认值 | Stage 5 |
| SC-001 创建后 API 响应与重查结果的 type/priority 值一致 | Stage 1–4 |
| SC-002 非法 type 或 priority 时 POST/PATCH 返回 400 | Stage 4.1、Stage 4.3 |
| SC-003 type/priority 查询参数 AND 逻辑生效，单参数与组合均正确 | Stage 4.2 |
| SC-004 无筛选参数时 GET /requirements 行为与 003 完全一致 | Stage 4.2 |
| SC-005 PATCH 更新单字段后其他字段值不变 | Stage 4.3 |

**Input**: `specs/004-requirement-type-priority/spec.md`

**Status**: 待 HumanMiao 审批。本文件是规划产物，不批准任何实现、tasks 或发布。
