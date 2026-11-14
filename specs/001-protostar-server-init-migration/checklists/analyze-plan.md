# 001 plan 主线程审核

**日期**：2026-11-13  
**审核人**：agent 主线程  
**结论**：五件规划产物经主线程审核确认，文档结构证明通过。001 plan/tasks 已于 2026-11-13 批准，T001–T031 已执行；002 spec+plan 已落盘并有 approval-002-spec/approval-002-plan（plan.md SHA 792b5de0…）。plan.md §13.2 批准栏字段为空白（冻结字节），空白不等于未批准；批准记录见 `plan-decision.md` 与 `docs/temp/approval-001-plan.json`。

## 送审版本

| 产物 | SHA-256 |
|---|---|
| [plan.md](../plan.md) | `f505e990e65808ebd69eff94cfb1fbf4e1dd3480ba3d2da7fc4571dcc20bf0c5` |
| [research.md](../research.md) | `5bb91e920218880f2e89923a3c6af6e9d8061c41e8b6b555c7e9e4e5ee2f11a4` |
| [data-model.md](../data-model.md) | `e34dfdd51234cc15414983adf8dff57e455e9c725dbc2a6e89f50ceb6bc0dce7` |
| [quickstart.md](../quickstart.md) | `3700d2a929af17ac82e8af1c1d6153e4e6139241c242922fbb0dec7a6e861bc2` |
| [contracts/migration-plan.md](../contracts/migration-plan.md) | `f2adb123495bddcd0760386a7a3d16bb6a9c81f3e118f4baff687719a9091ac3` |

输入版本与原始人工答复见 [input-decision.md](input-decision.md)。本记录不改变输入文件、constitution 批准栏、固定保护基线或 bootstrap 文件。

## 主线程审核结论

| 范围 | 证据与结论 |
|---|---|
| 输入与来源 | spec、constitution 的实际 SHA 与 plan §13、原始答复记录一致；四份公开副本、两份授权摘录与 PRD 有来源索引。历史行为与本仓实现分别说明。 |
| 六模块迁移 | 六个模块各有十一项语义，包含 FR-006 的十项与批准版本证据，共 66 项；实际实现来源均明确“无本仓代码”。 |
| 权威范围 | server 负责业务记录、审批记录、图、派发与运行历史；worker 负责活进程与原生 session；CLI、MCP、skills、GUI 不建立业务数据的第二份权威。 |
| 切换与失败 | 031 获批后按项目核对数据、处理在途任务、切换调用方、停止旧写入；禁止长期双写与自动重放外部副作用，错误保留原始原因。 |
| 人工引导期 | plan §8 完整记录方式、权限、真实验收与退出；002 验收且 0.1.0 获准发布后，003 起自举；003 运行证据用于核对后续执行。 |
| 版本与依赖 | W01–W14 为能力索引，002–031 为实现顺序；002 的最小派发与回报由本版本交付；身份与多组织归 015–017。 |
| 技术边界 | 依赖选择为待审批方案；具体版本、锁文件、schema、接口与运行命令由对应实施 spec 决定。001 只交付规划记录与文档级证据。 |
| 需求覆盖 | FR-001–FR-014 共 14 项、SC-001–SC-007 共 7 项均有对应章节与核对方式。 |
| 阶段范围 | G1–G6 具有输入、产物、出口与 tasks 派生范围；001 tasks 只派生规划核对与文档验收，不包含产品实施。 |
| 人工权限 | plan 批准人、日期、范围与依据四格为空。计划、tasks、实现、合入、发布与关单分别保留批准要求。 |

## 文档证明

执行者按 quickstart 对五件终稿与输入记录执行一次本机证明，时间为 2026-11-13 16:57:14 +08:00。命令为 `python docs/temp/checks/plan-001-verify.py`，退出码 0；原始结果保存于本机 `docs/temp/checks/plan-001-document-proof.json`，临时脚本已删除。此处本机路径仅作证据标识，公开阅读无需访问该目录。

| 检查 | 结果 |
|---|---|
| 结构证明 | PASS；12 项检查通过，失败项 0 |
| 输入版本 | spec 与 constitution 两项 SHA 均一致 |
| 迁移矩阵 | 6 个模块 × 11 项，共 66 项，空白项 0 |
| FR／SC | 14 项 FR、7 项 SC，编号、顺序与对应章节完整 |
| 产物导航 | 163 条相对链接可解析，失效目标 0，无本机证据目录导航 |
| 内容完整性 | 未解决澄清、占位字段与待编写标记均为 0 |
| 批准栏与保护 | 四项批准字段为空；constitution 运行前后 SHA 一致 |

终稿公开范围的 planning 检查在本审核记录与入口状态同步后统一执行一次，结果写入本机 `docs/temp/checks/automation-ready-publication.json`。当前 planning 检查有两条预期待批项：`ProtectedFileChanged constitution.md`（固定保护基线 `ce7549540fa45543cca797a150201d868e64495fdff39dc38246fb17bd4024b3` 与 constitution 当前正文 `eba9bce739c500c9129328a11e562479a7e5ca84afbae07b3b9632e8e7d79ac4` 不同，待 T033/T034 明确批准）与 `ProtectedFileChanged feature.json`（feature.json 已指向 `specs/002-minimum-bootstrap-loop`，同样归 T033/T034，不改脚本固定值）；两者均不记为检查通过，均不阻塞 002 推进。

## 工具证据与范围限制

- CodeGraph 查询：`protostar_server protostar_worker dispatch schedule migration plan-001-verify`；返回无相关代码。该结果不能证明产品能力已经实现。
- 本会话通用 memory recall 已查询 Protostar 001 审批状态，返回历史记录；以当前文件与原始答复为准。Hindsight 服务未接入，未取得部署或连接证据。
- 本轮未执行产品构建、lint、测试、formatter、服务启动或产品验收；未复跑 publication 与副本等价检查。
- 本轮没有暂存、提交、合入、发布或关单；001 无功能版本，未发送版本完成通知。

## 审批范围与阶段建议

送审对象为表中五件固定版本；批准仅允许以本计划派生 001 tasks，tasks 仍须主线程审核并由 HumanMiao 决定。保护基线与 bootstrap 更新继续分别等待批准。

tasks 阶段建议复用现有来源、矩阵与 quickstart，为每项核对指定文件、命令、依赖和证据位置；保留版本绑定，集中执行文档检查，减少重复研究与重复核验。
