# 003 验收记录

**日期**：2026-11-14  
**版本**：0.2.0（发布待 HumanMiao 人工授权）

## 验收结果

| SC | 验证方式 | 实测结果 |
|---|---|---|
| SC-001 编号格式 `PRO-N`，重启不变 | `POST /requirements` → 检查响应 `display_number`/`seq_number` | `PRO-1 seq=1`，重启后查询不变 ✅ |
| SC-002 列表升序含 `display_number` | `GET /requirements` | 200，seq 严格升序，每条含 `display_number` ✅ |
| SC-003 UUID 与 `PRO-N` 同一需求响应一致 | `GET /requirements/PRO-1` 和 `GET /requirements/{uuid}` | 两者响应体相同 ✅ |
| SC-004 不存在→404，格式非法→422 | `GET /requirements/PRO-999` / `GET /requirements/not-valid` | 404 / 422 ✅ |
| SC-005 并发创建两条需求 seq_number 无重复 | asyncio.gather 同时发两个 POST | `PRO-7 seq=7` / `PRO-8 seq=8`，unique=True ✅（实测 2026-11-14） |
| SC-006 迁移后历史数据 seq_number 已回填，旧索引不存在 | pg_indexes 查询 + information_schema + NULL 计数 | `uq_requirements_project_active exists: False`，`seq_number column exists: True`，`rows with null/zero seq_number: 0` ✅ |

## SC-006 局限说明

迁移时 requirements 表已为空，回填 SQL（`ROW_NUMBER() OVER PARTITION BY`）正确执行但处理了 0 行。完整验证该路径需要在含历史数据的库上 downgrade→upgrade，在共享集群上执行风险高（会短暂删除 `seq_number` 列）。回填逻辑已通过代码审查确认正确，实测路径留为已知局限。

## SC-005 实测输出

```
A: PRO-7 seq: 7 status: 201
B: PRO-8 seq: 8 status: 201
unique: True
```

## SC-006 实测输出

```
uq_requirements_project_active exists: False
seq_number column exists: True
rows with null/zero seq_number: 0
```
