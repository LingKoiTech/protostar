# 将明 · Protostar

将明（Protostar）是泠鱼科技（LingKoiTech）发起的独立公开项目，目标是建设自动化 AI 研发系统：登记需求后，系统协助整理材料、编写 spec／plan／tasks，按流程图安排 worker 与真实 agent 会话执行，并集中呈现审批、运行事件与交付记录。范围、方案、任务、合入与发布仍由人类决定。

**当前状态：尚无运行产品。** 本仓处于初始化阶段，六个模块中只有 `protostar_worker`、`protostar_cli`、`protostar_mcp`、`protostar_skills`、`protostar_gui` 五个目录存在且为空占位；`protostar_server` 仍是规划，目录尚未创建。仓内没有 Python 服务实现、Next.js 界面、安装流程或测试命令。`docs/` 中的内容是需求、设计与计划，不是运行证据。

- [001 需求总览](specs/001-protostar-server-init-migration/spec.md) 为 Draft，等待维护者审阅；当前 001 spec 与 constitution 1.0.0 作为 001 plan 输入的人工答复已单独记录在 [input-decision.md](specs/001-protostar-server-init-migration/checklists/input-decision.md)。
- `.specify/memory/constitution.md` 的 1.0.0 正式正文已生成，待 HumanMiao 审批，尚未生效；批准栏为空，固定基线更新待 T033／T034 的明确批准。
- [001 plan](specs/001-protostar-server-init-migration/plan.md) 与 4 件扩展文档已编写，主线程审核完成，待 HumanMiao 对具体版本审批；plan 自身的批准栏为空，尚未批准或实施。上述答复仅覆盖两项输入，不批准 plan／tasks，也不授权合入、发布或关单。
- 002–031 尚未开始，没有已批准的 spec／plan／tasks，也没有发布版本。
- 阶段一完成文档整理，不等于实现完成或治理审批完成。

## 六个模块

| 模块 | 职责 | 当前状态 |
|---|---|---|
| `protostar_server` | 组织与账户、需求与审批、流程图与任务派发、运行记录、知识与监督能力；Python API 与 PostgreSQL | 规划中，目录待创建 |
| `protostar_worker` | 本机执行、后端进程、工作目录、会话、日志、本地恢复、代码索引与查询 | 目录为空 |
| `protostar_cli` | 用户与 skills 的命令行入口；JSON 与可读输出、稳定退出码 | 目录为空 |
| `protostar_mcp` | 供 Agent 调用的 tools 与 resources；本地 stdio 与远程 Streamable HTTP | 目录为空 |
| `protostar_skills` | spec-kit 工作流、软件工程方法、代码研究、执行与交付指引；动作经 CLI 执行 | 目录为空 |
| `protostar_gui` | Next.js 用户界面：需求、审批、流程图、会话、知识、代码、监督与统计 | 目录为空 |

## 文档导航

- [文档索引](docs/README.md)：公开文档的完整入口。
- [产品需求文档](docs/PRD.md)：产品目标、技术方案、核心机制与完整 002–031 版本路线；当前为草案，未批准。
- [命名寓意](docs/naming.md)：将明与原恒星的名称来源。
- [贡献指南](docs/contributing.md)：公开讨论、缺陷报告与 PR 的期望。
- [安全策略](docs/security.md)：漏洞报告方式与敏感资料范围。
- [治理提案](docs/governance.md)：提议稿，尚未生效。
- [公开来源清单](docs/sources/README.md)：文档所依据历史材料的公开来源索引与术语处理说明。
- [001 需求总览](specs/001-protostar-server-init-migration/spec.md)：项目级需求基线与迁移范围，当前为 Draft。

技术方案、核心机制与完整 002–031 版本路线只在 [PRD](docs/PRD.md) 维护，本文不重复；版本范围见 PRD 第 15 节。

## 后续顺序

阶段一文档整理不产生阶段批准。后续按 `001 spec → 001 plan → 001 tasks → 002 spec` 的顺序推进，每一层分别经维护者批准；未获批准不实施。001 spec 当前为 Draft；001 plan 与 4 件扩展文档已编写，主线程审核完成，待 HumanMiao 对具体版本审批，尚未批准或实施。

## 参与贡献

公开的缺陷报告、问题讨论与文档修复都欢迎，不要求预先审批，也不要求使用固定模板：

- 错字、失效链接、格式与文档澄清可以直接提交 Pull Request。
- 缺陷报告与功能建议通过本仓库的 GitHub Issues／Discussions（以仓库实际启用为准）提出。
- 功能或行为变更需要先与维护者达成方向，并纳入对应版本与审批记录后再实现；维护者不承诺处理时间。

具体见[贡献指南](docs/contributing.md)。

## 安全

请优先使用 GitHub 的私密漏洞报告（若仓库已启用）；未启用时不要公开披露漏洞细节、密钥或个人信息，也不要自行猜测维护者邮箱。见[安全策略](docs/security.md)。

## 许可证

仓库采用 MIT 许可证，条款见 [`LICENSE`](LICENSE)。
