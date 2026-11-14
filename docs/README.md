# Protostar 文档索引

本文件是 Protostar 公开文档的统一入口。仓库根 [`README.md`](../README.md) 提供项目简介与当前状态；本文件说明有哪些文档、各自负责什么、如何按需要阅读。

## 当前状态

- 002 最小启动闭环已实施：`protostar_server`（FastAPI + PostgreSQL）与 `protostar_worker`（轮询领取任务、执行命令并回传结果）可运行；002 spec／plan／tasks 均已批准，T001–T030 已执行。
- 端到端验收已通过：登录 → 登记需求 → 上传并逐层批准 spec／plan／tasks → 显式启动 Run → worker 领取并执行 `002-healthcheck`，运行输出的 stdout 为 `002 bootstrap healthcheck OK` 且退出码为 0；server 仅监听 `127.0.0.1:8000`（T027／SC-004）。本机启动方式见 [`bootstrap_server.py`](../bootstrap_server.py) 与 [002 quickstart](../specs/002-minimum-bootstrap-loop/quickstart.md)，验收脚本为 [`e2e_acceptance.py`](../e2e_acceptance.py)。
- 项目级需求 [001](../specs/001-protostar-server-init-migration/spec.md) 为 Draft，待维护者审阅；001 plan/tasks 已于 2026-11-13 批准，T001–T031 已执行，详见 [plan-decision.md](../specs/001-protostar-server-init-migration/checklists/plan-decision.md) 与 [analyze-tasks.md](../specs/001-protostar-server-init-migration/checklists/analyze-tasks.md)。
- [002 spec](../specs/002-minimum-bootstrap-loop/spec.md)、[002 plan](../specs/002-minimum-bootstrap-loop/plan.md) 与 002 tasks 已落盘，approval-002-spec.json／approval-002-plan.json（plan.md SHA 792b5de0…）与 002 tasks 批准记录已登记。
- 阶段入口状态仅维护本文件与 [docs/governance.md](governance.md)。根 `AGENTS.md` 与根 `README.md` 的状态更新登记为待 T031 处理，当前文件保持。
- `.specify/memory/constitution.md` 的 1.0.0 正式正文已生成，待 HumanMiao 审批，尚未生效；批准栏为空，固定基线更新待 T033／T034 的明确批准。
- [治理提案](governance.md)等待维护者批准，尚未生效；003（0.2.0，原生需求编号 PRO-N）与 004（0.3.0，需求类型/优先级/筛选）已实施并验收，spec/plan/tasks 产物已批准，发布待 HumanMiao 人工授权。

002 的运行证据来自实际启动的服务与验收脚本输出；本目录其余条目仍以设计说明、需求说明和计划为主，凡涉及“已完成”“已实现”的判断，应以对应 spec 的验收记录与真实运行输出为准。

## 文档一览

| 文档 | 内容 | 状态 |
|---|---|---|
| [`PRD.md`](PRD.md) | 产品需求文档：产品目标与已确认选择、六个模块、迁移与数据边界、最小运行方案、原生需求与 spec-kit 管理、人工审批、调度与后端路由、图读取与事件、组织权限、Hindsight 知识、CodeGraph、监督助手与 MCP、流程学习、UI 设计、工作包、002–031 版本路线、来源与外部资料 | 产品与实施方案草案，供维护者审阅；未批准 |
| [`naming.md`](naming.md) | 项目中文名「将明」与代号 Protostar 的名称来源 | 说明文档 |
| [`contributing.md`](contributing.md) | 公开贡献方式：文档修复、缺陷报告、功能建议与 Pull Request 的期望 | 当前适用 |
| [`security.md`](security.md) | 漏洞报告渠道、报告内容、敏感资料范围与处理原则 | 当前适用 |
| [`governance.md`](governance.md) | 独立项目治理提议：角色、决策、版本与修订方式 | 提议稿，等待维护者批准；尚未生效 |
| [`sources/README.md`](sources/README.md) | 公开来源清单：文档所依据历史材料的公开索引、原文与术语处理说明 | 来源索引；具体条目以该文件为准 |
| [`../specs/001-protostar-server-init-migration/spec.md`](../specs/001-protostar-server-init-migration/spec.md) | 001 需求总览：项目需求基线、六个模块责任、迁移范围与验收条件 | Draft，等待维护者审阅 |
| [`../README.md`](../README.md) | 项目简介、当前状态、六个模块、文档导航、贡献与安全入口 | 公开入口 |

## 按目的阅读

| 你想了解或完成 | 建议顺序 |
|---|---|
| 项目是什么、现在能不能用 | 根 [`README.md`](../README.md) → 本页「当前状态」 |
| 产品要做哪些事、为什么这样设计 | [`PRD.md`](PRD.md) 第 1–3 节 → 第 4–6 节 |
| 某个版本会交付什么 | 直接读 [`PRD.md`](PRD.md) 第 15 节 |
| 需求总览与迁移范围 | [`001 spec`](../specs/001-protostar-server-init-migration/spec.md) |
| 提交缺陷报告或文档修复 | [`contributing.md`](contributing.md) → [`security.md`](security.md)（涉及安全问题时） |
| 报告安全漏洞 | [`security.md`](security.md) |
| 了解项目如何决策与发布 | [`governance.md`](governance.md) → [`PRD.md`](PRD.md) 第 15–19 节 |
| 核对文档依据与术语来源 | [`sources/README.md`](sources/README.md) |

## 规格文档位置

- 项目级 spec 按当前配置保存在仓根 `specs/`；001 已存在，后续编号按顺序追加。
- 模块级 spec 计划保存在各自的 `protostar_<module>/specs/`，随模块版本演进；目前模块目录为空，尚无模块 spec。
- 每个实现 spec 应各自拥有 spec、plan、tasks 与验收记录；未获批准的文档不构成实施授权。

本索引不复制 spec 正文，具体状态与验收条件以对应 spec 文件为准。

## 文档约定

- 所有导航使用仓内相对链接，不依赖本机绝对路径、仓外目录或其他代码检出。
- 公开文档只引用仓库内文档、仓库内 spec 与公开的官方资料；来源与原文处理由[公开来源清单](sources/README.md)登记。
- 文档中的外部链接指向对应项目的官方资料，不表示本项目已集成、验证或获得其背书。
- 产品行为、版本边界与审批要求以获批的 spec／plan／tasks 为准；本索引与根 README 只做导航和摘要。

## 许可与反馈

仓库许可证与条款见根目录 [`LICENSE`](../LICENSE)。对文档的纠错与改进可直接提交 Pull Request；缺陷与功能建议走本仓库公开的 GitHub 渠道，具体期望见[贡献指南](contributing.md)。
