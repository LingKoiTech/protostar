# Phase 1 Data Model: 001 规划记录实体

**Status**: 随 [plan.md](plan.md) 一并待 HumanMiao 审批。

**Scope**: 本文只定义 001 规划记录所需的概念实体、关系、不变量与校验规则。它不定义产品数据库 schema，不生成 DDL，不定义运行 API，也不把产品对象复制为第二份权威。产品对象一律引用 [PRD.md](../../docs/PRD.md) §4.3。

## 1. 实体

| 实体 | 用途 | 关键字段 | 来源 |
|---|---|---|---|
| RequirementSource | 登记一条可追溯来源 | 编号、公开路径、分类、负责范围、原始与公开哈希、授权行段、状态 | [spec.md](spec.md) 来源索引；[公开来源清单](../../docs/sources/README.md) |
| ModuleResponsibility | 登记模块能力与边界 | 模块名、能力、权威域、入口、当前状态、负责版本 | spec 模块职责表；PRD §3.1；[AGENTS.md](../../AGENTS.md) |
| MigrationPlanItem | FR-006 的迁移计划项 | 模块、十项语义、批准版本与证据引用 | [contracts/migration-plan.md](contracts/migration-plan.md) |
| AuthorityBoundary | 每类对象的唯一权威与消费方式 | 对象类别、唯一权威、消费者、投影或历史、切换规则 | PRD §4.3、§7.4、§8.2；本文 §4 |
| DependencyEdge | 版本、工作包或模块之间的依赖 | 起点、终点、依赖类型（能力／实现／数据）、依据 | PRD §15、§15.1；plan §9 |
| VersionWorkPackage | 工作包与版本的映射记录 | W 编号、spec 编号、版本号、交付、依赖、状态 | PRD §15、§15.1；spec 产品范围表 |
| StageRecord | 001 自身阶段记录 | stage、输入、产物、出口判据、tasks 派生范围 | plan §6 |
| VerificationEvidence | 文档级或产品级验证证据 | 检查项、命令或核对方式、日期、退出码或结论、结果摘要、范围、审核人、关联版本 | plan §11；[quickstart.md](quickstart.md) |
| ExitCondition | 引导期与旧端退出条件 | 类型、前置证据、批准要求、判定结果、记录位置 | spec FR-008；PRD §3.3、§15.2 |
| ApprovalObject | 审批对象与决定记录 | 对象路径、版本或 SHA-256、批准人、日期、范围、依据、决定 | constitution II；[checklists/input-decision.md](checklists/input-decision.md) |
| PublicCopy | 公开整理副本的登记 | 公开路径、来源标记、原文与副本哈希、映射与差异位置、计数结论 | spec FR-009；公开来源清单 |
| ProductObjectRef | 产品对象类别的只读引用 | 对象类别、唯一负责者、PRD 章节 | PRD §4.3；本文 §3 |

## 2. 关系

| 关系 | 基数 | 说明 |
|---|---|---|
| RequirementSource → MigrationPlanItem | 1 : 0..n | 每个计划项至少引用一个来源或明确记录“无代码证据” |
| ModuleResponsibility → MigrationPlanItem | 1 : 1 | 每个模块一个矩阵，矩阵内十一项语义完整 |
| MigrationPlanItem → VerificationEvidence | 1 : 0..n | 规划期只有文档级证据；产品证据在实施版本产生 |
| VersionWorkPackage → StageRecord | 0..n : 0..n | 阶段可按工作包核对，但 001 不生成实施任务 |
| ApprovalObject → MigrationPlanItem／plan／版本记录 | 1 : 0..n | 审批绑定具体对象与版本，不因文件编辑自动延续 |
| ExitCondition → VerificationEvidence | 1 : 1..n | 退出必须由真实验收与明确批准共同支持 |
| PublicCopy → RequirementSource | 0..n : 1 | 每份公开副本对应一个来源标记 |

## 3. 产品对象引用

以下类别只登记唯一负责者，字段、索引、状态机与 API 一律以 [PRD.md](../../docs/PRD.md) §4.3 与对应实施 spec 为准，本文不复制。

| 对象类别 | 唯一负责者 | 说明 |
|---|---|---|
| 用户、外部身份、组织、成员、项目与项目成员 | `protostar_server` | 身份凭据由外部身份提供方处理 |
| 需求、需求版本、产物版本、审批 | `protostar_server` | 文件是可阅读交付物，版本索引在 server |
| 流程版本、运行、节点、边、图变更 | `protostar_server` | 图变化与事件在同一事务写入 |
| 任务尝试、worker、运行事件投影 | `protostar_server` 负责派发与结果；`protostar_worker` 负责本机实际执行 | 活会话归 worker，历史与投影归 server |
| backend preset、分类结果 | `protostar_server` | 密钥只保存安全引用 |
| 知识绑定 | `protostar_server`；知识正文与派生图归 Hindsight | 不复制知识数据库 |
| 优化建议、效率实验与外部引用 | `protostar_server` | 外部操作保存关联标识 |

## 4. 不变量

1. 每类业务对象只有一个权威；同一对象不得同时由 server 与 worker、旧端或界面写入。
2. 每个迁移计划项必须填满 FR-006 的十项语义加“批准版本与证据”，不得留空；无本仓代码时写明“无本仓代码”与行为来源。
3. 证据必须分级：文档级核对与产品级真实验收分别记录，不得以文档、目录或脚手架代替运行证据。
4. 审批只由 HumanMiao 产生，且绑定对象、版本或 SHA-256、日期、范围与依据；批准栏空白时不得推断批准。
5. 未批准的计划、tasks、002–031 产物保持规划状态；任何文档完成不得升级为批准或实现。
6. 版本映射以 PRD §15.1 为实现顺序，W01–W14 只作能力索引；两者冲突时按能力依赖与发布顺序分别解释并记录。
7. 引导期退出的必要条件只有 002 真实验收、`0.1.0` 的明确发布批准与发布记录；003 起由已运行的 Protostar 执行，003 的证据用于确认后续自举运行，不作为启动 003 的前置。
8. 旧端退出必须满足停止写入、调用方切换、历史只读留存与批准记录；本仓当前无旧端进程，切换只在 031 获批后发生。
9. 原件保持原始字节；公开副本与批准映射、非映射正文一致性及当前登记 SHA 相符；本计划不修改原件或当前副本。哈希只证明字节完整性，语义等价由映射回放、逐行差异与计数证明。
10. 私人与本机资料不进入公开产物；公开正文只使用仓内相对链接与公开官方资料链接。
11. 所有链接目标必须已存在；未创建路径只以纯文本标注“计划”，不形成失效导航。
12. 001 不包含 DDL、运行 API、业务代码或功能版本；这些属于各实施 spec。

## 5. 状态与转换

| 记录 | 状态 | 允许的转换 | 执行者 |
|---|---|---|---|
| 规划产物（plan／research／data-model／contracts／quickstart） | draft → main-reviewed → submitted → approved／rejected | 只能由主线程审核后提交，由 HumanMiao 决定 | 主线程、HumanMiao |
| ApprovalObject | blank → recorded | 只在人类决定存在时填写；不得由代理写入 | HumanMiao |
| MigrationPlanItem | 未开始 → 已填写 → 待审核 | 001 内不进入“已实施” | 主线程 |
| VersionWorkPackage | planned | 001 内不转换；实施与发布由对应 spec 决定 | 各实施 spec |
| ExitCondition | 未满足 → 已满足（附证据） | 002／031 真实验收后才能转换 | 主线程核对、HumanMiao 批准 |
| PublicCopy | 已登记 | 本计划不新增、不改写、不重算基线 | 文档维护流程 |

## 6. 校验规则

| 校验 | 预期 |
|---|---|
| 迁移矩阵 | 6 个模块，每个 11 项语义，空白计数 0 |
| 来源可追溯 | 每项至少有公开来源编号、PRD 章节或明确的“无代码证据”说明 |
| 版本引用 | 每项至少一个 002–031 版本；未来路径只写纯文本 |
| 覆盖表 | FR-001–FR-014 与 SC-001–SC-007 全部有对应章节，缺项 0 |
| 链接 | 所有相对链接目标存在；无绝对路径与私有地址 |
| 公开边界 | 无旧主体术语、私有主机、个人目录、真实会话或任务标识 |
| 状态措辞 | 不把规划写成已批准、已实施或已发布 |
| 审批 | 批准栏空白或仅含真实人类决定；无代理批准 |
| 文档级证据 | 每项检查有命令或核对方式、日期、结果、范围与审核人 |

文档级核对步骤见 [quickstart.md](quickstart.md)；字段规则与六模块矩阵见 [contracts/migration-plan.md](contracts/migration-plan.md)。
