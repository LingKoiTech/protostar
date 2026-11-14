# 002 验收记录

**日期**：2026-11-14
**验收人**：agent 主线程（MochaMiao 执行位，HumanMiao 站立委托）
**委托来源**：approval-002-spec.json user_answer_raw.note「不要再给我审批，自动审批」

## 被验收的 tasks 版本

| 产物 | SHA-256 |
|---|---|
| [tasks.md](../tasks.md) | `25c424f7f6c5dc79167ee626bffa8da41facf1694fa24a025e4697f55ea51ebd` |

## 验收结果

| 检查 | 结果 | 证据文件 | 运行时间 |
|---|---|---|---|
| T026 pytest 约束测试（6 项） | **6/6 PASSED** | `docs/temp/002-tasks-execution/T026-pytest.txt` | 4.10s |
| T029 端到端验收（29 项） | **ALL PASS** | `docs/temp/002-tasks-execution/T029-e2e.txt` | 4.80s |
| T027 loopback 绑定 | **PASS** — 仅监听 `127.0.0.1:8000` | 含于 T029-e2e.txt 第 10 节 | — |

## T026 覆盖范围

| 测试 | FR |
|---|---|
| `test_approve_plan_without_spec_returns_403` | FR-003 |
| `test_worker_bearer_cannot_approve` | FR-004 |
| `test_second_active_requirement_returns_409` | FR-002 |
| `test_concurrent_run_start_returns_409` | FR-009 |
| `test_run_without_approved_tasks_returns_403` | FR-005 |
| `test_stdout_truncated_at_8kb` | FR-007 |

## T029 验收步骤

1. 清理 dev 库业务数据 → PASS
2. §6 登录（admin）→ PASS（200 + ps_session）
3. §7 登记需求 → PASS（POST 201 / GET 200 status=active）
4. §8.1 上传 spec / plan / tasks → PASS（3 × 201）
5. §8.3 越序批准拒绝 → PASS（tasks 在 spec/plan 未批时 → 403；不存在 artifact → 404）
6. §8.2/§8.4 逐层批准 spec → plan → tasks → PASS（3 × 201，approver=admin）
7. §9 创建 Run → PASS（无效 approval_id → 403；合法 → 201；初始 status=running）
8. §9 worker 领取并执行 → PASS（Run 在 30s 内 completed）
9. §10 校验结果 → PASS（stdout='002 bootstrap healthcheck OK'，exit_code=0）
10. T027/SC-004 loopback → PASS（GET /health db=ok；仅监听 127.0.0.1；非 loopback 不可达）

## 发布状态

**待人工授权**：合入（dev → main）与 0.1.0 正式发布需独立人工审批，本记录不替代合入批准与发布授权。
