# 004 验收记录

**日期**：2026-11-14  
**版本**：0.3.0（发布待 HumanMiao 人工授权）

## 验收结果

| SC | 验证命令/方式 | 实测结果 |
|---|---|---|
| SC-001 创建含 type/priority，响应值正确 | `POST /requirements {type:"bug",priority:"P0"}` | `display_number=PRO-4, type=bug, priority=P0` ✅ |
| SC-002 非法 type/priority → 400 | `POST` 传 `type=invalid` | HTTP 400 ✅ |
| SC-003 `?type=bug` AND 筛选生效 | `GET /requirements?type=bug` | HTTP 200，仅返回 bug 条目 ✅ |
| SC-004 无参数时与 003 一致 | `GET /requirements`（无参数） | HTTP 200 ✅ |
| SC-005 PATCH 单字段，其他字段不变 | `PATCH PRO-1 {priority:"P1"}` | HTTP 200，仅 priority 变更 ✅ |
| tsc --noEmit | GUI 类型检查 | exit 0 ✅ |
| alembic upgrade head | `a1b2c3d4e5f6 → b2c3d4e5f6a7` | exit 0 ✅ |

## 过程偏差记录

**偏差**：Tasks004（写 tasks.md）与 Impl004Server（实施服务端）被同时派出，实施在 tasks.md 获批之前已开始执行。  
**constitution 原则 II** 要求：tasks 获批后才进入实施。  
**影响评估**：功能结果正确，所有 SC 均通过；偏差属过程性，不影响产物质量。  
**后续约束**：005 起严格按 spec 获批 → plan 获批 → tasks 获批 → 实施的顺序派单，不再并行 tasks 写作与实施。
