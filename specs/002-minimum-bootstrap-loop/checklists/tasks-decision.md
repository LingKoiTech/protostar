# 002 tasks 人工决定

**日期**：2026-11-13
**决定人**：HumanMiao（站立委托）
**委托来源**：002 spec 审批时用户附注"不要再给我审批，自动审批"，原始答复保存于 `docs/temp/approval-002-spec.json`。

## 批准对象（终版）

| 产物 | SHA-256 |
|---|---|
| [tasks.md](../tasks.md) | `25c424f7f6c5dc79167ee626bffa8da41facf1694fa24a025e4697f55ea51ebd` |

## 输入版本

| 文档 | SHA-256 | 说明 |
|---|---|---|
| plan.md | `792b5de043ac94f8b61a86067c5e7244385d8f4173e88b86ed3afe560b8b9623` | plan 批准时版本 |
| research.md | `a867ea0bea8ba09a3f6621a61c881d4633dc63bdb589e5e9bcb162d6ba9c507e` | |
| data-model.md | `1ee0bd8aecb904b14852c601c4dee455cc980a736a1d4d1e5c6397006adb1ce5` | |
| contracts/server-api.md（派单时） | `b560297d81ff9a2658d7432154c63a75cc8a6d790bad162782b5bbf21d350b6b` | plan-decision.md 绑定版本 |
| contracts/server-api.md（+work_dir） | `8752d96e7d472c0ac0eb5f9574dddc53d95c6cf1223641d57248fc2844a09ec1` | 主线程审核补 PATCH work_dir 字段 |
| contracts/server-api.md（+409领取） | `8916f16090d68d74b8018c0b01ed568f5e687a40a714e090d742002db51840d7` | 补 GET /worker/tasks/next 409（data-model FR-009）；当前版本 |
| quickstart.md | `3f87dce49e36475aa9d221caa83d327a941cb027849e2b300b456ccd95e80f66` | |

## 批准范围

以上固定版本作为 002 实施的编写输入。正文保持批准时字节，不再修改。实施代码、合入、发布各自另批。

## 主线程审核结论

- 30 个任务（T001–T030），8 个阶段（P1 Setup 2 / P2 Foundational 6 / P3 US1 4 / P4 US2 2 / P5 US3 4 / P6 US4 7 / P7 US5 2 / P8 Final 3）
- 全部 30 个任务含 Story/Files/Cmd/Verify 四字段
- FR-001–FR-012 全部有覆盖任务；SC-001–SC-005 全部覆盖
- Worker 依赖限定为 stdlib（subprocess/sqlite3/urllib.request）
- contracts 两次事后补充：① PATCH /worker/runs/{id} 加 work_dir（data-model 要求 worker 写入 Run.work_dir）；② GET /worker/tasks/next 加 409（data-model FR-009 并发领取约束）
- T014 GUI 需求页不臆造列表端点（契约只有 GET /requirements/{id}）
- tasks.md 批准版本 SHA：`25c424f7f6c5dc79167ee626bffa8da41facf1694fa24a025e4697f55ea51ebd`（批准对象表所绑定版本）
- constitution I/II/IV 合规

## 前置工具检查结果（2026-11-13）

| 工具 | 状态 |
|---|---|
| Python 3.11.15 | ✅ |
| uv 0.11.32 | ✅ |
| Node.js v22.23.0 | ✅ |
| omp 18.20.0 | ✅ |
| PostgreSQL 16 | ❌ **未运行** — **阻塞 T006/T026/T029** |

探测步骤与结果：
1. `socket.create_connection(("127.0.0.1", 5432), 2)` → **TimeoutError**（5432 端口无响应）
2. `docker ps` → `command not found`（无 Docker）
3. `Get-Service | Where-Object Name -like '*postgres*'` → 无输出（无 Windows PostgreSQL 服务）
4. `netstat -an | grep :5432` → 无输出（无监听进程）

结论：PostgreSQL 未运行（非仅 psql 客户端缺失）。T001–T005、T007–T008、T010–T018、T023、T025、T027–T028、T030 不依赖 DB，可先行；T006/T026/T029 需 PostgreSQL 实例可达后继续。

## 过程说明

tasks.md 由 Task-VanillaMiao（subagent VanillaMiao002Tasks）独占写入，主线程审核确认 SHA 与契约补充。
