# Protostar（将明）— Agent 工作入口

Protostar 是泠鱼科技（LingKoiTech）的独立公开项目。产品目标、模块职责、贡献方式与资料依据均由本仓文档提供。

## 阅读入口

| 材料 | 用途 |
|---|---|
| [文档索引](docs/README.md) | 查阅公开文档与当前项目状态 |
| [产品需求](docs/PRD.md) | 产品范围、模块行为、UI、002–031 版本路线与验收场景 |
| [001 spec](specs/001-protostar-server-init-migration/spec.md) | 当前需求基线、来源与迁移规划范围 |
| [公开来源清单](docs/sources/README.md) | 来源编号、公开副本、哈希与历史资料分类 |
| [贡献指南](docs/contributing.md) | Issues、Pull Requests 与公开讨论 |
| [安全策略](docs/security.md) | 私密漏洞报告与敏感资料处理 |
| [治理提议](docs/governance.md) | 等待维护者批准的独立项目治理方案 |

正式治理正文的位置为 `.specify/memory/constitution.md`；1.0.0 正式正文已生成，待 HumanMiao 审批，尚未生效，批准栏为空，固定基线更新待 T033／T034 的明确批准。本入口与治理提议均不代表正式治理已经生效。

## 当前工作边界

- 002（0.1.0）、003（0.2.0）、004（0.3.0）已实施并验收。`protostar_server`、`protostar_gui`、`protostar_worker` 均已创建且可运行；server 连接集群 PostgreSQL 18.6，gui 为 Next.js 14 App Router，worker 以 stdlib polling 方式领取任务。
- 001 修订稿仍为 Draft；其当前版本与 constitution 1.0.0 作为 001 plan 输入的人工答复已单独记录在 [input-decision.md](specs/001-protostar-server-init-migration/checklists/input-decision.md)。[001 plan](specs/001-protostar-server-init-migration/plan.md) 与 4 件扩展文档已编写，主线程审核完成，待 HumanMiao 对具体版本审批；plan 批准栏留空，尚未批准或实施，获批后再编写 001 tasks。
- 上述答复仅作为当前 001 plan 的输入依据，不批准 plan／tasks，也不授权合入、发布或关单。constitution 批准栏未写入，固定基线更新待 T033／T034 的明确批准。
- spec、plan、tasks 的批准分别绑定对应版本。文档整理授权不扩大为业务开发、数据迁移、部署或发布授权。
- 主线程独占权威 `spec.md`。plan 与 tasks 分别由指定作者编写；每层产物由主线程亲自审核并提交人类审批。执行子代理只修改已批准任务指定的文件。
- 同一文件同时只有一名写入者。并行工作按不同文件分配；暂存、提交与合并需要独立授权。
- 公开的问题报告、讨论与文档修复遵循贡献指南，可以直接提出，无需预先取得实现审批。

## 模块与规格位置

| 模块 | 负责范围 |
|---|---|
| `protostar_server` | Python 服务端：原生需求与编号、审批、Pipeline 图、任务派发、运行记录与组织权限 |
| `protostar_worker` | Python 执行端：后端会话、任务进程、事件回传、本机状态与恢复 |
| `protostar_cli` | Python 命令行操作与诊断，供用户和 skills 调用 |
| `protostar_mcp` | Python MCP tools 与 resources，复用同一业务能力与权限 |
| `protostar_skills` | 本项目的版本化工作流指引，动作通过 CLI 执行 |
| `protostar_gui` | Next.js／TypeScript 界面：需求、审批、图、会话、知识与统计 |

项目级需求根由 `.specify/project-config.json` 的 `spec_directory` 配置，当前为 `specs/`；当前需求由 `.specify/feature.json` 指向 `specs/001-protostar-server-init-migration`。001 的编号与路径保持不变。

模块级需求按具体模块范围保存到 `protostar_<module>/specs/`，实际选择通过 `SPECIFY_FEATURE_DIRECTORY` 明确指定。

## 文档与来源处理

- 详细说明保存在 `docs/`，项目入口只维护简介、状态与导航；已有 spec 保持配置指定的位置。
- 当前说明使用 Protostar 模块名称与泠鱼科技（LingKoiTech）主体，不要求访问其他仓库或本机资料。
- 导航使用仓内相对链接；外部链接用于公开的开源项目、协议与官方资料。
- 来源整理副本的编号、公开路径、原始与公开 SHA-256 由公开来源清单维护。公开副本统一使用当前主体与中性旧端代号；原文仅保留在 `docs/temp/archive/`。逐篇本机映射与逐行差异证明非映射正文一致，API／字段／状态码／需求编号逐项计数保持；哈希不替代语义等价证据。历史审批与完成状态不能用作当前执行授权或运行证据。
- 私人原件、原始路径映射与本机检查记录保存在 Git 忽略目录 `docs/temp/`，不纳入公开导航、自动提交或知识服务写入。
- 保留许可证与第三方版权声明。使用官方依赖及对应版本资料，不编写替代成熟格式库的自定义 parser。

## 执行与验证入口

在对应阶段读取可用的 spec-kit skill；按 spec → plan → tasks → implement 的批准顺序执行。只有 spec 时进行需求核对；plan 与 tasks 齐备后才运行跨产物分析。

代码调查使用可用的 CodeGraph 符号与影响范围查询，并核对相关源码。索引无结果、工具未连接及缺少源码分别说明；本次 CodeGraph 查询无相关代码，Hindsight 未连接，不声称完成相应服务核验。

实现时以真实运行输出作为证明，使用覆盖修改行为的检查，不使用模拟输出。错误保留原始原因；验证结果、人工决定与发布记录分别保存。代码合入、发布与关单保留显式人类授权。

## 版本通知

- 执行期间在阶段切换、task 完成、子代理结果返回与阻塞状态变化时，在当前 tab 输出四项进度：`总体 spec 完成数/总数 | 当前迭代版本 | 当前 spec 编号 | plan/tasks 执行进度条（完成数/总数）`。总体包含 001 总览与 002–031 三十个版本；当前阶段未生成任务清单时显示“未生成”，不计算百分比。
- 每轮结束输出一行相同格式的进度，并注明完成项与阻塞；本执行会话不发送周期 OSC 777。
- 每完成一个 spec 版本（002–031），立即发送一次 OSC 777，标题为 `Protostar <版本号> <spec号>`，正文为通过／失败结论与关键产物路径；同时在 tab 输出完整 Markdown 结论表。文档齐备、实际验收与发布分别注明状态，不以文档完成表示产品已运行。
- 002 对应 0.1.0，003 对应 0.2.0，后续依次对应至 031 的 0.30.0。015 资料整理与 001 待审批阶段不属于上述版本；周期通知由 Carly 定时任务 #92 发送。

