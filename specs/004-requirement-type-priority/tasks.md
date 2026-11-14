# Tasks: 需求类型、优先级与列表筛选

**Branch**: `004-requirement-type-priority` | **Date**: 2026-11-14
**Input**: `specs/004-requirement-type-priority/plan.md`
**Status**: 待审批。本文件是任务分解产物；不批准任何代码实施、合入或发布。任务只有在批准栏被人类填写后，才可作为启动运行的输入。

---

## 批准栏

| 字段 | 内容 |
|---|---|
| 批准人 | |
| 批准日期 | |
| 批准范围 | |
| 批准依据 | |

---

## T001 — Alembic 迁移：新增 type 与 priority 枚举列

**Story**: Stage 1
**Depends on**: —
**Files**:
- `protostar_server/alembic/versions/<rev>_add_requirement_type_priority.py`（新建，`down_revision = "a1b2c3d4e5f6"`）

**变更顺序**:
1. `op.execute("CREATE TYPE requirement_type AS ENUM ('feature', 'bug', 'improvement', 'research')")`
2. `op.execute("CREATE TYPE requirement_priority AS ENUM ('P0', 'P1', 'P2')")`
3. `op.add_column("requirements", Column("type", sa.Enum("feature", "bug", "improvement", "research", name="requirement_type"), nullable=False, server_default="feature"))`
4. `op.add_column("requirements", Column("priority", sa.Enum("P0", "P1", "P2", name="requirement_priority"), nullable=False, server_default="P2"))`
5. 数据回填（防止旧记录为 NULL）：
   ```sql
   UPDATE requirements SET type = 'feature' WHERE type IS NULL;
   UPDATE requirements SET priority = 'P2' WHERE priority IS NULL;
   ```

**downgrade**: 删除 `requirements.type` 和 `requirements.priority` 列（`op.drop_column`），然后 `op.execute("DROP TYPE requirement_type")` 与 `op.execute("DROP TYPE requirement_priority")`

**Cmd**:
```bash
cd protostar_server && DATABASE_URL=<url> ../.venv/Scripts/python.exe -m alembic upgrade head
```

**Verify**: 退出码 0；运行 `DATABASE_URL=<url> ../.venv/Scripts/python.exe -c "from app.models.requirement import Requirement; cols=[c.name for c in Requirement.__table__.columns]; assert 'type' in cols and 'priority' in cols, cols; print('ok')"` 输出 `ok`。

---

## T002 — Requirement ORM 模型：新增 type 与 priority 映射列

**Story**: Stage 2
**Depends on**: T001
**Files**:
- `protostar_server/app/models/requirement.py`

**变更**:
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

**Cmd**:
```bash
cd protostar_server && DATABASE_URL=<url> ../.venv/Scripts/python.exe -c \
  "from app.models.requirement import Requirement; assert hasattr(Requirement, 'type'); assert hasattr(Requirement, 'priority'); print('ok')"
```

**Verify**: 输出 `ok`，无 ImportError

---

## T003 — Pydantic Schema：RequirementCreate / RequirementResponse / RequirementPatch / _to_response

**Story**: Stage 3
**Depends on**: T002
**Files**:
- `protostar_server/app/schemas/requirements.py`

**变更**:
1. `RequirementCreate` 新增两个可选字段（缺省取枚举默认值）：
   ```python
   type: str = "feature"
   priority: str = "P2"
   ```
2. `RequirementResponse` 新增两个必填字段：
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
4. `_to_response` 中补充 `type=req.type, priority=req.priority`

**Cmd**:
```bash
cd protostar_server && ../.venv/Scripts/python.exe -c \
  "from app.schemas.requirements import RequirementResponse, RequirementPatch; \
   assert 'type' in RequirementResponse.model_fields; \
   assert 'priority' in RequirementResponse.model_fields; \
   assert 'type' in RequirementPatch.model_fields; \
   assert 'priority' in RequirementPatch.model_fields; \
   print('ok')"
```

**Verify**: 输出 `ok`，无 ImportError

---

## T004 — POST /requirements：传入 type/priority，非法枚举值返回 400

**Story**: Stage 4.1
**Depends on**: T003
**Files**:
- `protostar_server/app/routers/requirements.py`

**变更**:
- `Requirement(...)` 构造时补充 `type=body.type, priority=body.priority`
- 在写入前校验枚举合法性：`type` 须在 `{"feature","bug","improvement","research"}`，`priority` 须在 `{"P0","P1","P2"}`，否则 `raise HTTPException(status_code=400)`

**Cmd**:
```bash
# 创建含 type/priority（需已启动 server 并持有登录 cookie）
curl -s -X POST http://127.0.0.1:8000/api/v1/requirements \
  -b cookies.txt -H "Content-Type: application/json" \
  -d '{"title":"T","scope":"S","type":"bug","priority":"P0"}' | python -m json.tool

# 非法枚举值 → 400
curl -s -o /dev/null -w "%{http_code}" -b cookies.txt -X POST \
  http://127.0.0.1:8000/api/v1/requirements \
  -H "Content-Type: application/json" \
  -d '{"title":"T","scope":"S","type":"task"}'
```

**Verify**: 合法请求响应含 `type: "bug"` 与 `priority: "P0"`；非法 `type` 请求返回 400

---

## T005 — GET /requirements：新增 ?type= 与 ?priority= 过滤参数（AND 逻辑）

**Story**: Stage 4.2
**Depends on**: T004
**Files**:
- `protostar_server/app/routers/requirements.py`

**变更**:
- 路由签名追加：`type: str | None = None, priority: str | None = None`
- 在现有列表查询的 `select` 语句后追加可选 `WHERE` 子句（链式 `.where`，AND 逻辑自动生效）：
  - 若 `type` 参数存在：`.where(Requirement.type == type)`
  - 若 `priority` 参数存在：`.where(Requirement.priority == priority)`
- 非法枚举值的查询参数返回 `[]`（SQL WHERE 无匹配），不主动 400

**Cmd**:
```bash
# 单参数过滤
curl -s -b cookies.txt "http://127.0.0.1:8000/api/v1/requirements?type=bug" | python -m json.tool

# 组合过滤（AND）
curl -s -b cookies.txt "http://127.0.0.1:8000/api/v1/requirements?type=bug&priority=P0" | python -m json.tool

# 无参数（行为与 003 一致）
curl -s -b cookies.txt "http://127.0.0.1:8000/api/v1/requirements" | python -m json.tool
```

**Verify**: 有 `type=bug` 时响应列表每条 `type` 均为 `"bug"`；组合参数时两字段均匹配；无参数时返回全量列表（与 003 行为一致）

---

## T006 — PATCH /requirements/{id_or_display}：新端点，字段子集更新，鉴权，非法枚举 400

**Story**: Stage 4.3
**Depends on**: T005
**Files**:
- `protostar_server/app/routers/requirements.py`

**变更**:
- 新增 `PATCH /requirements/{id_or_display}` 路由，鉴权：`user: LocalUser = Depends(get_current_user)`（与其他需求端点一致）
- 路径参数复用现有 `GET /{id_or_display}` 的解析逻辑（`PRO-N` 或 UUID）
- `body: RequirementPatch`；逐字段：非 `None` 时 `setattr(req, field, value)`
- 枚举合法性校验：`type` 须在 `{"feature","bug","improvement","research"}`，`priority` 须在 `{"P0","P1","P2"}`，否则 `raise HTTPException(status_code=400)`
- `req.updated_at` 由 ORM `onupdate` 自动刷新
- 提交后调用 `_to_response(req, project)` 返回 `RequirementResponse`

**Cmd**:
```bash
# PATCH 更新单字段
curl -s -b cookies.txt -X PATCH http://127.0.0.1:8000/api/v1/requirements/PRO-1 \
  -H "Content-Type: application/json" \
  -d '{"priority":"P1"}' | python -m json.tool

# 非法枚举值 → 400
curl -s -o /dev/null -w "%{http_code}" -b cookies.txt -X PATCH \
  http://127.0.0.1:8000/api/v1/requirements/PRO-1 \
  -H "Content-Type: application/json" \
  -d '{"type":"invalid"}'

# 无 cookie → 401
curl -s -o /dev/null -w "%{http_code}" -X PATCH \
  http://127.0.0.1:8000/api/v1/requirements/PRO-1 \
  -H "Content-Type: application/json" \
  -d '{"priority":"P1"}'
```

**Verify**: 更新单字段后响应含新值且其余字段不变；非法枚举值返回 400；无 cookie 返回 401

---

## T007 — GUI requirements/page.tsx：新增 type/priority 列及下拉筛选控件

**Story**: Stage 5
**Depends on**: T005
**Files**:
- `protostar_gui/app/requirements/page.tsx`

**变更**:
- 在现有表格中追加 `type` 和 `priority` 两列
- 在表格上方新增两个 `<select>` 下拉框：
  - `type`：选项 全部 / feature / bug / improvement / research
  - `priority`：选项 全部 / P0 / P1 / P2
- 使用 React `useState` 管理选中值；选中值变化时重新拼接 URL 查询参数并重新 `fetch`，即时更新表格

**Cmd**:
```bash
cd protostar_gui && npx tsc --noEmit 2>&1 | head -20
```

**Verify**: `tsc --noEmit` 无类型错误；浏览器 `http://localhost:3000/requirements` 表格含 `type`/`priority` 列；下拉筛选后表格即时更新

---

## T008 — GUI requirements/[id]/page.tsx：详情页新增 type/priority 展示行

**Story**: Stage 5
**Depends on**: T006
**Files**:
- `protostar_gui/app/requirements/[id]/page.tsx`

**变更**:
- 在现有字段展示区（与 `status`、`display_number` 同级）新增 `type` 和 `priority` 两行

**Cmd**:
```bash
cd protostar_gui && npx tsc --noEmit 2>&1 | head -20
```

**Verify**: `tsc --noEmit` 无类型错误；浏览器详情页显示 `type` 与 `priority` 字段

---

## T009 — GUI requirements/new/page.tsx：新建表单新增 type/priority 下拉，含默认值

**Story**: Stage 5
**Depends on**: T004
**Files**:
- `protostar_gui/app/requirements/new/page.tsx`

**变更**:
- 在表单中新增 `type` `<select>`（默认 `feature`，选项：feature / bug / improvement / research）
- 在表单中新增 `priority` `<select>`（默认 `P2`，选项：P0 / P1 / P2）
- 提交时将 `type` 和 `priority` 一并包含在 POST body 中

**Cmd**:
```bash
cd protostar_gui && npx tsc --noEmit 2>&1 | head -20
```

**Verify**: `tsc --noEmit` 无类型错误；浏览器新建页 `type` 下拉默认值为 `feature`，`priority` 默认值为 `P2`；提交后 API 响应含正确 `type`/`priority` 值

---

## FR/SC 覆盖

| 需求/标准 | 实现任务 |
|---|---|
| FR-001 requirements 表增加 type 列，枚举约束，NOT NULL，默认 feature | T001、T002 |
| FR-002 requirements 表增加 priority 列，枚举约束，NOT NULL，默认 P2 | T001、T002 |
| FR-003 POST /requirements 接受 type/priority 可选字段，非法值 400 | T003、T004 |
| FR-004 GET /requirements 支持 type/priority 查询参数，AND 逻辑过滤 | T005 |
| FR-005 GET /requirements/{id_or_display} 响应含 type 与 priority | T003、T004 |
| FR-006 PATCH /requirements/{id_or_display} 更新任意字段子集，非法枚举 400 | T003、T006 |
| FR-007 GUI 列表页显示 type/priority 列及下拉筛选控件 | T007 |
| FR-008 GUI 详情页显示 type 和 priority | T008 |
| FR-009 GUI 新建页提供 type/priority 下拉，含默认值 | T009 |
| SC-001 创建后 API 响应与重查结果的 type/priority 值一致 | T001–T004 |
| SC-002 非法 type 或 priority 时 POST/PATCH 返回 400 | T004、T006 |
| SC-003 type/priority 查询参数 AND 逻辑生效，单参数与组合均正确 | T005 |
| SC-004 无筛选参数时 GET /requirements 行为与 003 完全一致 | T005 |
| SC-005 PATCH 更新单字段后其他字段值不变 | T006 |

---

**Input**: `specs/004-requirement-type-priority/plan.md`

**Status**: 待审批。本文件是任务分解产物；不批准任何代码实施、合入或发布。任务只有在批准栏被人类填写后，才可作为启动运行的输入。
