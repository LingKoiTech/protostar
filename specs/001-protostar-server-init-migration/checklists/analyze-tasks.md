# 001 tasks 主线程审核与跨产物分析

**日期**：2026-11-13  
**审核人**：agent 主线程  
**审核对象**：[tasks.md](../tasks.md)  
**对象 SHA-256**：`1acc4f2e28ec737ae44b83f8228d856a065e8e540d945e49f6e408a80093f7dd`  
**结论**：主线程完成语义审核与跨产物分析；结构证明 PASS。001 plan/tasks 已于 2026-11-13 批准，T001–T031 已执行；002 spec+plan 已落盘并有 approval-002-spec/approval-002-plan（plan.md SHA 792b5de0…）。

## 范围与输入

主要输入为 [plan.md](../plan.md) 及四件扩展文档；五件固定版本的批准见 [plan-decision.md](plan-decision.md)，主线程计划审核见 [analyze-plan.md](analyze-plan.md)。用户故事与 FR／SC 取自 [spec.md](../spec.md)。

按 `speckit-analyze` 执行只读分析：重复、歧义、欠定义、治理要求、覆盖与不一致六类核对。路径解析命令为 `pwsh -NoProfile -File .specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks -PathsOnly`，实际退出码 0，返回 001 的 spec、plan、tasks 路径。采用 `-PathsOnly` 保持解析不持久化 `feature.json`；文件存在性与批准版本由结构证明另行核对。扩展钩子文件不存在，本阶段没有自动提交或后置执行。

## 当前分析结果

| 类别 | 主线程核对结果 |
|---|---|
| 重复 | 模块逐项核对、来源登记、独立用户故事验收与最终证据完整性分别负责不同对象；未发现影响执行的重复要求。 |
| 歧义 | 每项任务都有 owner、stage、depends、cmd、verify、covers、result、tdd；人工核对的对象与预期结果明确，关键词定位不能单独证明通过。 |
| 欠定义 | 批准证据路径、执行前字段核验、单任务结果路径、失败处理、目录已存在时的停止条件均明确；没有待填写的执行路径。 |
| 治理要求 | 整份 tasks 获批后才执行；上层产物、保护基线与公开入口在执行窗口内只读。所有任务只产生本机核对证据，不执行产品实现、部署、合入或发布。 |
| 覆盖 | FR-001–FR-014 与 SC-001–SC-007 均有主任务；四项用户故事与 G1–G6 均有明确任务。 |
| 不一致 | Phase 门禁、各 job 直接依赖、并发说明与 Stage 表对应；批准版送审状态与后续独立决定分别记录。未解决的 CRITICAL／HIGH 问题为 0。 |

plan 的“本阶段不创建 tasks”与 quickstart Q2 的“不存在 tasks”属于 plan 编写和送审时的范围；当前进入下一层的依据为五件固定版本的人工批准。冻结文档不改写，tasks 的执行批准须另行绑定当前对象 SHA。

## 覆盖表

| 要求 | 主任务 |
|---|---|
| FR-001 | T028 |
| FR-002 | T006、T025 |
| FR-003 | T004、T028 |
| FR-004 | T008、T019 |
| FR-005 | T010、T018 |
| FR-006 | T011–T017 |
| FR-007 | T003、T007、T028 |
| FR-008 | T024 |
| FR-009 | T018、T020、T021、T022 |
| FR-010 | T005、T009、T025、T031 |
| FR-011 | T007、T021 |
| FR-012 | T023、T029、T030 |
| FR-013 | T026 |
| FR-014 | T026 |
| SC-001 | T008、T019 |
| SC-002 | T011–T017 |
| SC-003 | T010、T018、T022 |
| SC-004 | T024 |
| SC-005 | T008、T020、T021、T028 |
| SC-006 | T002、T005、T025、T029、T030、T031 |
| SC-007 | T026 |

全部 31 项任务均关联要求；无未映射任务，要求覆盖为 21／21。

## 结构证明

本机临时证明脚本以 MarkdownIt 解析 Markdown 结构，以标准 JSON 库读取批准记录，以 `TopologicalSorter` 核对任务依赖；没有使用自定义 Markdown parser。执行命令为 `python docs/temp/checks/001-tasks-proof.py`，唯一一次执行的退出码为 0，结果保存在本机 `docs/temp/checks/001-tasks-document-proof.json`。临时脚本已经删除，结果保留；这些本机路径只作为证据标识，不形成公开导航。

| 项目 | 结果 |
|---|---|
| 检查结果 | PASS；13 项结构检查通过，失败项 0 |
| 任务编号与状态 | T001–T031 连续唯一，31 项均未勾选 |
| 用户故事 | US1：9 项；US2：3 项；US3：4 项；US4：3 项；准备与收尾：12 项 |
| Stage | G1：12 项；G2：8 项；G3：3 项；G4：2 项；G5：3 项；G6：3 项 |
| 依赖 | 引用均存在，无自依赖，无循环 |
| 结果文件 | 31 个独立 JSON 路径，均位于规定本机证据目录，无重复或越界 |
| 批准输入 | 五件 plan 实际 SHA 与两份批准记录一致 |
| tasks 批准栏 | 批准人、日期、范围、依据四项为空白 |
| 导航 | tasks 以代码字面引用路径，没有 Markdown 链接；导航项数量为 0，不将该数量解释为额外链接验证。 |

## 执行边界与待批事项

- T001–T031 已执行，31 个结果文件在 `docs/temp/001-tasks-execution/`；T030/T031 在 002 推进后重跑，均更新为 fail（预期状态变化，原因：approval-chain.md 新增导致原 ConvertFrom-Json cmd 报错；docs/README.md SHA 与 T009 快照不同；specs/002-minimum-bootstrap-loop 已存在）。T030 可选处置：approval-chain.md 当前在 `docs/temp/001-tasks-execution/`，移至旁边的 `docs/temp/001-tasks-execution-notes/` 可让原 cmd 恢复可用；保留现位置则按已批 cmd 维持 fail，由 HumanMiao 决定。
- canonical 单一结果：`docs/temp/checks/automation-ready-publication.json`（`--phase planning`）；`strict-public-documents-result.json`（16:43）保留为 T029 写入前冻结快照，此后统一 `--phase planning`。当前 planning 检查有两条预期待批项：`ProtectedFileChanged constitution.md` 与 `ProtectedFileChanged feature.json`，均不阻塞 002 推进，均归 T033/T034。
- 002 spec+plan 已落盘，approval-002-spec/approval-002-plan（plan.md SHA 792b5de0…）已记录；002 tasks 待编写。
- CodeGraph 在本阶段查询无相关代码；Hindsight 未接入。没有据此声明代码索引、知识服务或任何产品能力已经实现。
- 未读取私人原件全文或 Memory；未运行产品命令、build、lint、test、formatter 或 git；未暂存、提交、合入、发布或关单。001 无功能版本，未发送版本完成通知。

## 送审建议

批准对象为本记录绑定的 tasks 固定版本，范围为执行全部 31 项文档规划核对；002 及后续产物继续独立审核批准。执行时按 Phase 门禁派发，四项用户故事在准备阶段通过后并行，每项结果文件只有一名写入者；统一汇总结果，保持任务定义与批准版本不变。
