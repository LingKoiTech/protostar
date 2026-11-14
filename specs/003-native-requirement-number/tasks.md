# Tasks: 原生需求编号与列表/详情

**Branch**: `003-native-requirement-number` | **Date**: 2026-11-14
**Input**: `specs/003-native-requirement-number/plan.md`
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

## T001 — Alembic 迁移：新增需求编号字段

**Story**: Stage 1
**Depends on**: —
**Files**:
- `protostar_server/alembic/versions/<rev>_add_requirement_number.py`（新建，`down_revision = "9205120d3abe"`）

**变更顺序**:
1. `op.add_column("projects", Column("code", String, nullable=False, server_default="PRO"))`
2. `op.add_column("projects", Column("next_requirement_number", Integer, nullable=False, server_default="0"))`
3. `op.add_column("requirements", Column("seq_number", Integer, nullable=False, server_default="0"))`
4. `op.drop_index("uq_requirements_project_active", table_name="requirements")`
5. 数据回填 — `seq_number` 按 `created_at` 升序分配（ROW_NUMBER OVER PARTITION BY project_id）
6. 数据回填 — `projects.next_requirement_number = MAX(seq_number)` per project
7. `op.create_unique_constraint("uq_requirements_project_seq", "requirements", ["project_id", "seq_number"])`

**downgrade**: 重建 `uq_requirements_project_active`（若存在多条 active 记录则失败，已在 spec Edge Cases 说明）

**Cmd**:
```bash
cd protostar_server && DATABASE_URL=<url> ../.venv/Scripts/python.exe -m alembic upgrade head
```

**Verify**: 退出码 0；`alembic current` 显示新 revision；`\d requirements` 含 `seq_number` 列且 `uq_requirements_project_active` 不存在

---

## T002 — Project ORM 模型：新增 code、next_requirement_number

**Story**: Stage 2
**Depends on**: T001
**Files**:
- `protostar_server/app/models/project.py`

**变更**:
```python
code: Mapped[str] = mapped_column(String, nullable=False, default="PRO")
next_requirement_number: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
```

**Cmd**:
```bash
cd protostar_server && DATABASE_URL=<url> ../.venv/Scripts/python.exe -c \
  "from app.models.project import Project; assert hasattr(Project, 'code'); assert hasattr(Project, 'next_requirement_number'); print('ok')"
```

**Verify**: 输出 `ok`，无 ImportError

---

## T003 — Requirement ORM 模型：新增 seq_number，替换索引为 UniqueConstraint

**Story**: Stage 2
**Depends on**: T001
**Files**:
- `protostar_server/app/models/requirement.py`

**变更**:
- `__table_args__` 中删除 `Index("uq_requirements_project_active", …)`，替换为 `UniqueConstraint("project_id", "seq_number", name="uq_requirements_project_seq")`
- 新增列：`seq_number: Mapped[int] = mapped_column(Integer, nullable=False)`

**Cmd**:
```bash
cd protostar_server && DATABASE_URL=<url> ../.venv/Scripts/python.exe -c \
  "from app.models.requirement import Requirement; assert hasattr(Requirement, 'seq_number'); print('ok')"
```

**Verify**: 输出 `ok`；`Requirement.__table_args__` 含 `UniqueConstraint`，不含旧 `Index`

---

## T004 — RequirementResponse schema：新增 seq_number、display_number；提取 _to_response 辅助函数

**Story**: Stage 3
**Depends on**: T002, T003
**Files**:
- `protostar_server/app/schemas/requirements.py`

**变更**:
- `RequirementResponse` 新增 `seq_number: int` 和 `display_number: str`
- 提取辅助函数 `_to_response(req: Requirement, project: Project) -> RequirementResponse`，构造 `display_number = f"{project.code}-{req.seq_number}"`

**Cmd**:
```bash
cd protostar_server && ../.venv/Scripts/python.exe -c \
  "from app.schemas.requirements import RequirementResponse; assert 'display_number' in RequirementResponse.model_fields; assert 'seq_number' in RequirementResponse.model_fields; print('ok')"
```

**Verify**: 输出 `ok`，无 ImportError

---

## T005 — POST /requirements：原子编号分配，移除 active-409 检查，改用 _to_response

**Story**: Stage 4.1
**Depends on**: T004
**Files**:
- `protostar_server/app/routers/requirements.py`

**变更**:
- 移除 "active 需求已存在" 预检与 `IntegrityError` 重映射为 409 的逻辑
- 通过 `UPDATE projects SET next_requirement_number = next_requirement_number + 1 WHERE id = :id RETURNING next_requirement_number` 原子分配编号，写入 `req.seq_number`
- 响应调用 `_to_response(req, project)`，返回含 `seq_number` 与 `display_number` 的 201

**Cmd**:
```bash
# 需已启动 server 并持有登录 cookie
curl -s -X POST http://127.0.0.1:8000/api/v1/requirements \
  -b cookies.txt -H 'Content-Type: application/json' \
  -d '{"title":"Test","scope":"S"}' | python -m json.tool
```

**Verify**: 响应含 `display_number`（格式 `PRO-N`）和 `seq_number`（正整数）；退出码 0；创建第二条需求时不再返回 409

---

## T006 — GET /requirements 列表端点（注册于 /{id_or_display} 之前，limit 200，鉴权）

**Story**: Stage 4.2
**Depends on**: T005
**Files**:
- `protostar_server/app/routers/requirements.py`

**变更**:
- 在 `/{id_or_display}` 路由之前注册 `GET /requirements`
- 鉴权：`user: LocalUser = Depends(get_current_user)`
- 查询默认项目所有需求，`ORDER BY seq_number ASC LIMIT 200`
- 返回 `list[RequirementResponse]`，每条调用 `_to_response`；空列表返回 `[]`

**Cmd**:
```bash
curl -s http://127.0.0.1:8000/api/v1/requirements -b cookies.txt | python -m json.tool
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8000/api/v1/requirements  # 无 cookie
```

**Verify**: 有 cookie 时返回 JSON 数组，每条含 `display_number`，按 `seq_number` 升序；无 cookie 返回 401

---

## T007 — GET /requirements/{id_or_display}：str 参数，PRO-N 正则分派，404 vs 422

**Story**: Stage 4.3
**Depends on**: T006
**Files**:
- `protostar_server/app/routers/requirements.py`

**变更**:
- 路径参数类型从 `uuid.UUID` 改为 `str`
- 检测 `re.fullmatch(r"[A-Z]+-\d+", value)`：解析 `seq_number`，按 `(project_id, seq_number)` 查询；无匹配返回 404
- 否则尝试 `uuid.UUID(value)`：解析失败返回 422；解析成功查无记录返回 404
- 响应调用 `_to_response(req, project)`

**Cmd**:
```bash
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8000/api/v1/requirements/PRO-1 -b cookies.txt    # 200 或 404
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8000/api/v1/requirements/PRO-999 -b cookies.txt  # 404
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8000/api/v1/requirements/not-valid -b cookies.txt # 422
```

**Verify**: 存在的编号/UUID 返回 200 且含 `display_number`；不存在的返回 404；非法格式返回 422

---

## T008 — GUI requirements/page.tsx：列表视图，调用 GET /requirements，展示 display_number

**Story**: Stage 5
**Depends on**: T006
**Files**:
- `protostar_gui/app/requirements/page.tsx`

**变更**:
- 移除现有 UUID 单条查询入口，改为挂载时调用 `GET /api/v1/requirements`（`credentials: 'include'`）
- 渲染表格列：`display_number`（链接到 `/requirements/{id}`）、`title`、`status` badge、`created_at`
- 未登录（401）展示"请先登录"链接；空列表展示"暂无需求"（FR-007）
- 保留刷新按钮

**Cmd**:
```bash
cd protostar_gui && npx tsc --noEmit 2>&1 | head -20
```

**Verify**: `tsc --noEmit` 无类型错误；浏览器 `http://localhost:3000/requirements` 表格第一列显示 `PRO-1`

---

## T009 — GUI requirements/[id]/page.tsx：展示 display_number 字段

**Story**: Stage 5
**Depends on**: T007
**Files**:
- `protostar_gui/app/requirements/[id]/page.tsx`

**变更**:
- 在详情区新增 `display_number` 展示行（FR-008）；查询逻辑不变（仍使用 UUID）

**Cmd**:
```bash
cd protostar_gui && npx tsc --noEmit 2>&1 | head -20
```

**Verify**: `tsc --noEmit` 无类型错误；浏览器详情页显示 `PRO-N` 标签

---

## T010 — GUI requirements/new/page.tsx：创建成功后展示 display_number

**Story**: Stage 5
**Depends on**: T005
**Files**:
- `protostar_gui/app/requirements/new/page.tsx`

**变更**:
- 创建成功后从响应体取 `display_number`，在跳转前短暂展示"已创建 PRO-N"（FR-006 GUI 侧）
- 跳转目标保持 `/requirements/{data.id}`（UUID）

**Cmd**:
```bash
cd protostar_gui && npx tsc --noEmit 2>&1 | head -20
```

**Verify**: `tsc --noEmit` 无类型错误；浏览器新建需求后页面显示"已创建 PRO-N"再跳转

---

## T011 — 超出 002 范围的已实施改动：补充验证并更新状态

**Story**: 追溯覆盖（来源：`docs/temp/out-of-scope-changes.md`）
**Depends on**: T006
**Files**:
- `docs/temp/out-of-scope-changes.md`（将以下条目状态更新为 `covered-by-003`）

**覆盖项**:
- `GET /api/v1/runs` 列表接口（server）
- `GET /api/v1/artifacts?requirement_id=<uuid>` 接口（server）
- `GET /api/v1/approvals/by-requirement` 接口（server）
- `CORSMiddleware`（server `app/main.py`）
- `/pipeline` 页面（GUI）
- `/runs` 页面（GUI）
- `/login` 页面（GUI）
- `app/layout.tsx` 导航链接（GUI）

**Cmd**:
```bash
cd protostar_gui && npx tsc --noEmit
cd ../protostar_server && ../.venv/Scripts/python.exe -c "from app.main import app; print('ok')"
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8000/api/v1/runs  # 无 cookie → 401
```

**Verify**: `tsc --noEmit` 退出码 0；server import 无报错；`GET /runs` 无 cookie 返回 401；`docs/temp/out-of-scope-changes.md` 相关条目状态已更新为 `covered-by-003`

---

## FR/SC 覆盖

| 需求/标准 | 实现任务 |
|---|---|
| FR-001 seq_number 原子分配，并发安全 | T001（约束）、T005（UPDATE RETURNING） |
| FR-002 projects 新增 code / next_requirement_number；display_number 派生 | T001、T002、T004 |
| FR-003 删除 uq_requirements_project_active；新增 (project_id, seq_number) UNIQUE | T001、T003 |
| FR-004 GET /requirements 按 seq_number 升序，上限 200，含 display_number，鉴权 | T006 |
| FR-005 GET /requirements/{id_or_display} 双格式寻址 | T007 |
| FR-006 POST /requirements 响应含 seq_number + display_number | T004、T005 |
| FR-007 GUI 列表页展示 display_number，空状态提示 | T008 |
| FR-008 GUI 详情页展示 display_number | T009 |
| SC-001 编号格式正确，重启不变 | T001（持久化 seq_number）、T005 |
| SC-002 列表严格升序，含 display_number | T006 |
| SC-003 UUID 与 PRO-N 请求同一需求响应体一致 | T007 |
| SC-004 不存在编号/UUID 返回 404；格式非法返回 422 | T007 |
| SC-005 并发创建两条需求 seq_number 无重复 | T005（UPDATE RETURNING 行锁） |
| SC-006 迁移后历史数据 seq_number 已回填，旧索引不存在 | T001（回填 SQL） |

---

本文件当前状态为"待审批"。在批准栏被人类填写之前，本 tasks 不得作为启动运行或实施代码的批准输入；服务身份不得代替人类产生批准（constitution II）。
