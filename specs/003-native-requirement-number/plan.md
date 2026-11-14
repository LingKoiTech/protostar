# Implementation Plan: 原生需求编号与列表/详情

**Branch**: `003-native-requirement-number` | **Date**: 2026-11-14 | **Spec**: [spec.md](spec.md)

**Input**: `specs/003-native-requirement-number/spec.md`

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

**文件**: `protostar_server/alembic/versions/<rev>_add_requirement_number.py`（新建，`down_revision = "9205120d3abe"`）

变更顺序：

1. `op.add_column("projects", Column("code", String, nullable=False, server_default="PRO"))`
2. `op.add_column("projects", Column("next_requirement_number", Integer, nullable=False, server_default="0"))`
3. `op.add_column("requirements", Column("seq_number", Integer, nullable=False, server_default="0"))`
4. `op.drop_index("uq_requirements_project_active", table_name="requirements")`
5. 数据回填：
   ```sql
   UPDATE requirements r
   SET seq_number = sub.rn
   FROM (
       SELECT id,
              ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY created_at) AS rn
       FROM requirements
   ) sub
   WHERE r.id = sub.id;
   ```
6. `projects.next_requirement_number` 回填：
   ```sql
   UPDATE projects p
   SET next_requirement_number = COALESCE(
       (SELECT MAX(seq_number) FROM requirements WHERE project_id = p.id), 0
   );
   ```
7. `op.create_unique_constraint("uq_requirements_project_seq", "requirements", ["project_id", "seq_number"])`

**downgrade 风险**：downgrade 需重建 `uq_requirements_project_active`（`WHERE status='active'`）。若数据库中存在同一项目下多条 active 需求（003 允许创建），该索引无法建立，downgrade 会失败并回滚。处置：downgrade 前须手工将多余 active 需求关闭为 closed，或接受 downgrade 不可执行。这是对 002 FR-002 的不可逆偏离，已在 spec Edge Cases 中说明。

**验证**: 在 `protostar_server/` 下运行 `DATABASE_URL=... ../.venv/Scripts/python.exe -m alembic upgrade head`，退出码 0；随后执行一次创建需求请求，确认响应含 `seq_number`。

---

## Stage 2: ORM 模型

### `protostar_server/app/models/project.py`

新增两个映射列：

```python
code: Mapped[str] = mapped_column(String, nullable=False, default="PRO")
next_requirement_number: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
```

### `protostar_server/app/models/requirement.py`

- 在 `__table_args__` 中删除 `Index("uq_requirements_project_active", …)`，替换为：
  `UniqueConstraint("project_id", "seq_number", name="uq_requirements_project_seq")`
- 新增列：`seq_number: Mapped[int] = mapped_column(Integer, nullable=False)`

**验证**: `DATABASE_URL=... ../.venv/Scripts/python.exe -c "from app.models.requirement import Requirement; from app.models.project import Project; print('ok')"` 在 `protostar_server/` 下无报错。

---

## Stage 3: Pydantic Schema

**文件**: `protostar_server/app/schemas/requirements.py`

`RequirementResponse` 新增两个字段：

```python
seq_number: int
display_number: str
```

因 `display_number` 不是 ORM 属性，提取辅助函数 `_to_response(req: Requirement, project: Project) -> RequirementResponse`，构造含 `display_number = f"{project.code}-{req.seq_number}"` 的响应字典。

**验证**: `../.venv/Scripts/python.exe -c "from app.schemas.requirements import RequirementResponse; assert 'display_number' in RequirementResponse.model_fields; print('ok')"` 无报错。

---

## Stage 4: Router

**文件**: `protostar_server/app/routers/requirements.py`

### 4.1 `POST /requirements`（`create_requirement`）

- 移除现有 "active 需求已存在" 的 409 预检与 `IntegrityError` 重映射。
- 在提交前通过 `UPDATE … RETURNING` 原子分配编号：
  ```python
  result = await db.execute(
      update(Project)
      .where(Project.id == project.id)
      .values(next_requirement_number=Project.next_requirement_number + 1)
      .returning(Project.next_requirement_number),
  )
  seq = result.scalar_one()
  ```
- 将 `seq` 写入 `req.seq_number`；响应调用 `_to_response(req, project)`。

### 4.2 `GET /requirements`（新增列表端点，注册于 `/{id_or_display}` 之前）

- **鉴权**：`user: LocalUser = Depends(get_current_user)`（与其他需求端点一致，PRD §9.2）。
- 查询默认项目，`SELECT … WHERE project_id = :id ORDER BY seq_number ASC LIMIT 200`。
- 返回 `list[RequirementResponse]`，每条调用 `_to_response`。
- 空列表返回 `[]`，不报 404。

### 4.3 `GET /requirements/{id_or_display}`（替换现有 `/{requirement_id: uuid.UUID}`）

- 路径参数类型改为 `str`。
- 检测 `PRO-N` 格式（`re.fullmatch(r"[A-Z]+-\d+", value)`）：解析 `seq_number`，按 `(project_id, seq_number)` 查询；无匹配返回 **404**（需求不存在）。
- 否则尝试 `uuid.UUID(value)`：解析失败（非法 UUID 格式）返回 **422**；解析成功但查无记录返回 **404**。
- 响应调用 `_to_response(req, project)`。

**404 与 422 的区分**：格式非法（无法解析为 UUID 或 `PRO-N`）→ 422；格式合法但记录不存在 → 404。

**验证**（需已登录，以 cookie 文件传递认证）：
```
curl -s -b cookies.txt http://127.0.0.1:8000/api/v1/requirements          # 200 []
curl -s -b cookies.txt http://127.0.0.1:8000/api/v1/requirements/PRO-1    # 404（尚无数据）或 200
curl -s -o /dev/null -w "%{http_code}" -b cookies.txt \
  http://127.0.0.1:8000/api/v1/requirements/not-a-uuid                    # 422
```

---

## Stage 5: GUI 页面

### `protostar_gui/app/requirements/page.tsx`（改造现有列表页）

现有页面：输入 UUID 查询单条。003 改为：
- 页面挂载时调用 `GET /api/v1/requirements`（列表，`credentials: 'include'`），展示所有需求。
- 渲染表格列：`display_number`（链接到 `/requirements/{id}`）、`title`、`status` badge、`created_at`。
- 未登录时（401）展示 "请先登录" 链接；空列表展示 "暂无需求"（FR-007）。
- 保留刷新按钮。

### `protostar_gui/app/requirements/[id]/page.tsx`（详情页）

- 现有页面通过 UUID 查询单条，不改查询逻辑。
- 在详情区新增 `display_number` 展示行（FR-008）。

### `protostar_gui/app/requirements/new/page.tsx`（新建页）

- 创建成功后，从响应体取 `display_number` 并在跳转前短暂展示（如 "已创建 PRO-2"）（FR-006 GUI 侧）。
- 跳转目标保持 `/requirements/{data.id}`（UUID）。

**验证**：登录后访问 `http://localhost:3000/requirements`，表格第一列显示 `PRO-1`；点进详情页，标题区显示 `PRO-1`；新建需求后页面展示新编号（如 `PRO-2`）。

---

## FR/SC 覆盖

| 需求/标准 | 实现阶段 |
|---|---|
| FR-001 seq_number 原子分配，并发安全 | Stage 1（列约束）、Stage 4.1（UPDATE RETURNING） |
| FR-002 projects 新增 code / next_requirement_number；display_number 派生 | Stage 1、Stage 2、Stage 4 |
| FR-003 删除 uq_requirements_project_active；新增 (project_id, seq_number) UNIQUE | Stage 1、Stage 2 |
| FR-004 GET /requirements 按 seq_number 升序，上限 200，含 display_number，鉴权 | Stage 4.2 |
| FR-005 GET /requirements/{id_or_display} 双格式寻址 | Stage 4.3 |
| FR-006 POST /requirements 响应含 seq_number + display_number | Stage 3、Stage 4.1 |
| FR-007 GUI 列表页展示 display_number，空状态提示 | Stage 5 |
| FR-008 GUI 详情页展示 display_number | Stage 5 |
| SC-001 编号格式正确，重启不变 | Stage 1（持久化 seq_number）、Stage 4.1 |
| SC-002 列表严格升序，含 display_number | Stage 4.2 |
| SC-003 UUID 与 PRO-N 请求同一需求响应体一致 | Stage 4.3 |
| SC-004 不存在编号/UUID 返回 404；格式非法返回 422 | Stage 4.3 |
| SC-005 并发创建两条需求 seq_number 无重复 | Stage 4.1（UPDATE RETURNING 加行锁） |
| SC-006 迁移后历史数据 seq_number 已回填，旧索引不存在 | Stage 1（回填 SQL） |

**Input**: `specs/003-native-requirement-number/spec.md`

**Status**: 待 HumanMiao 审批。本文件是规划产物，不批准任何实现、tasks 或发布。
