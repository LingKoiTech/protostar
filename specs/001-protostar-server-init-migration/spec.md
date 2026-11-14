# Feature Specification: Protostar 产品需求总览与六模块迁移规划

**Feature Directory**: `specs/001-protostar-server-init-migration`  
**Created**: 2026-10-14  
**Updated**: 2026-11-13  
**Status**: Draft；阶段一文档独立化已获直接授权，001 总览与迁移规划待 HumanMiao 审批  
**Input**: 将 Protostar 的公开来源与产品需求整理为泠鱼科技（LingKoiTech）独立公开项目的 001 产品需求总览与六模块迁移规划，建立 `protostar_server` 的服务端需求基线。

本需求作为 Protostar 的完整需求总览，维护产品目标、六模块职责、来源索引、002–031 路线与迁移规划范围。全产品需求以本仓 [PRD.md](../../docs/PRD.md) 为自持来源，公开正文保存在本仓。阶段一已获项目所有者直接文档授权，该授权只覆盖文档工作；001 总览与迁移规划仍为 Draft，等待 HumanMiao 审批。本阶段尚未编写 001 plan、执行代码迁移或建立可运行服务。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 明确独立服务端需求 (Priority: P1)

作为研发负责人，我要将 Pipeline 与 PM 后端归入 `protostar_server`，明确服务端与执行端、调用入口和前端的职责，为迁移规划提供依据。

**Why this priority**: 业务归属决定接口、数据与执行能力的迁移范围。

**Independent Test**: 核对模块职责与来源，分别说明服务端与 worker 的业务责任，并确认五个既有目录不被当作运行实现。

**Acceptance Scenarios**:

1. **Given** Pipeline 与 PM 服务端能力由 Protostar 原生承担，**When** 登记需求，**Then** 服务端归 `protostar_server`，执行端归 `protostar_worker`，各自职责明确。
2. **Given** 已有五个模块目录且均为空，**When** 建立服务端基线，**Then** 保留既有英文名并新增服务端职责，不把空目录认定为已运行的服务。

### User Story 2 - 归档与授权摘录进入项目基线 (Priority: P1)

作为项目负责人，我能逐条查到管线、CI、审批、状态与日志、调度及前端需求的来源，区分当前项目要求与历史执行记录，并确认公开副本已移除私有信息。

**Why this priority**: 明确来源能防止历史审批和其他项目事项进入本轮实现范围，同时让公开文档可以脱离本机资料独立阅读。

**Independent Test**: 读取四份公开整理副本、两份授权摘录与公开来源清单，逐篇核对改名映射、逐行差异、受保护词项计数和整理副本标注。

**Acceptance Scenarios**:

1. **Given** 四份历史资料已归 Protostar，**When** 整理需求，**Then** 全部登记公开副本与来源标记；管线相关需求进入基线，跨项目审批与其他项目执行事项仅作为证据。
2. **Given** 原文包含旧方案或完成状态，**When** 判定本轮范围，**Then** 按当前需求明确业务归属，并通过实际实现与验收证据判定迁移现状。
3. **Given** 公开副本已经生成，**When** 核对发布范围，**Then** 每份副本带整理副本标注、映射位置与原文哈希；公开正文使用中性旧端代号与当前主体，私有地址、个人目录与真实内部标识不公开；逐行差异及 API／字段／状态码／需求编号计数可核查。
4. **Given** 资料交接完成，**When** 查阅公开文档，**Then** 正文在独立项目保存，公开导航只使用仓内相对链接与外部开源资料链接。

### User Story 3 - 制定可审核的技术迁移计划 (Priority: P2)

作为 HumanMiao，我要获得完整的逐模块迁移计划，了解迁移对象、依赖、接口与数据归属、验收方式、切换条件及旧系统退出条件，再批准执行任务。

**Why this priority**: 迁移计划与实际实现核对后，才能确定完整切换范围。

**Independent Test**: 按六个模块逐项核对计划，每项有来源、目标、验收与退出条件；计划经 HumanMiao 审批。

**Acceptance Scenarios**:

1. **Given** 001 spec 与正式治理文本已分别获批，**When** 进入 plan，**Then** 调查本仓可核证据并制定技术迁移计划，不使用未批准的选型。
2. **Given** 服务端与可选导入数据、外部记录之间的数据、API 或 session 归属需要调查，**When** 编写计划，**Then** 提供实际代码路径与能力证据，明确保留、迁移或替代的范围。
3. **Given** 引入期仍需人工执行，**When** 审核计划，**Then** 人工审批、切换验收、失败处理、人工引导期退出条件与旧系统退出条件全部可查。

### User Story 4 - 追踪全产品需求与版本路线 (Priority: P2)

作为需求负责人，我要从 001 总览追踪账户与多组织、原生需求、审批、图与调度、多后端、知识/CodeGraph、监督、流程学习和效率验证，并看到每项能力对应的 002–031 版本，保持产品总览与实现 spec 的完整覆盖。

**Why this priority**: 001 是完整需求总览，PRD 提供全产品需求，总览负责覆盖与追踪。

**Independent Test**: 对照 PRD 第 15 节工作包与版本表，核对总览表中的 W01–W14 与 002–031 引用无缺项，且未把规划写成已批准或已实施。

**Acceptance Scenarios**:

1. **Given** PRD 是本仓自持的全产品需求来源，**When** 查阅 001，**Then** 账户与多组织、原生需求、审批、图与调度、多后端、知识/CodeGraph、监督、流程学习与效率验证都有工作包与版本引用。
2. **Given** 某能力进入实现规划，**When** 使用 001，**Then** 可定位对应的 002–031 规划记录与工作包，总览不复制 PRD 的详细行为。
3. **Given** 某版本尚无批准产物，**When** 阅读 001，**Then** 该版本标为规划状态，不写成已批准、已实施或已发布。

### Edge Cases

- 同一份来源包含多项目事项：按事项分类，保留公开副本的历史含义，项目基线只接收自身范围。
- 初始化期间修改了本 spec 或其审批对象：重新审核对应版本后进入下层。
- 源代码、实际接口与历史说明存在差异：使用调查证据确定计划，不根据历史完成标记认定已迁移。
- 引入期能力不完整：计划明确人工执行方式、权限、验收与退出条件，保留人工审批。
- 数据、接口或 session 的责任重复：计划明确唯一权威及切换边界后提交审批。
- 公开副本包含私有主机地址、本机个人目录或凭据：从公开副本移除，原件保留在本机归档，私有来源路径留在本机索引，原始与公开哈希登记在公开来源清单。
- `docs/temp/` 被忽略或本机资料缺失：公开正文仍可凭公开来源清单阅读；核对原始字节时使用有权限的本机原件，不把原件作为公开导航的前置条件。

## Requirements *(mandatory)*

### 来源与交接索引

**独立项目根**：本仓库根。  
**公开来源索引**：[公开来源清单](../../docs/sources/README.md)。整理副本标注、原文基线与副本新哈希由该清单统一登记，逐篇映射与逐行差异保存在本机；本文不复制原文。

| 来源标记 | 公开副本或授权摘录 | 需求或证据用途 |
|---|---|---|
| A-LTP-02 / MB-10 | [pipeline-prd-202605.md](../../docs/archive/pipeline-prd-202605.md) | 管线图与依赖、审批、状态与日志、调度、CI 阶段、凭证、执行器和界面的历史需求输入 |
| A-0516-01 | [ci-plan-20260516.md](../../docs/archive/ci-plan-20260516.md) | 自动编译、镜像构建与推送的 CI 需求；保留历史项目来源 |
| A-0605-06 | [approval-20260605.md](../../docs/archive/approval-20260605.md) | 历史并行计划审批证据，不授权本轮实施 |
| B-0828-06 | [scheduling-20260828.md](../../docs/archive/scheduling-20260828.md) | 本项目管线回测、PR/issue 处理与并发面板的需求输入；其他项目事项及历史执行状态仅作证据 |
| OV-01 / S08 总览摘录 | [overview-excerpt.md](../../docs/sources/overview-excerpt.md) | AI 驱动研发管线需求，公开关联标识为 `TASK-REFERENCE-01`，实际内部标识仅由本机来源核对 |
| PL-01 / S09 计划摘录 | [planning-excerpt.md](../../docs/sources/planning-excerpt.md) | Pipeline/PM 独立、worker/CLI/GUI 改造、skills 调用 CLI、MCP 供 Agents 调用等授权条目；跨项目事项只作历史证据 |
| 本仓公开说明 | [README.md](../../README.md)、[PRD.md](../../docs/PRD.md)、[AGENTS.md](../../AGENTS.md) | PRD 为全产品需求的自持来源；README 与 AGENTS 提供项目状态、结构与工作入口，实际实现由 plan 核对 |

真实私有来源路径只保留在本机 `docs/temp/handoff.md`；该路径是纯文本出处，不作为本文导航。原始 SHA-256 与公开副本 SHA-256 均由公开来源清单登记；原件保留在本机归档，不进入 Git。

### 模块职责

| 模块 | 需求责任 |
|---|---|
| `protostar_server` | 原生服务端：组织与账户、项目与需求、产物审批、Pipeline 图、任务派发、运行投影、知识连接、流程优化与监督 Agent 服务；迁移计划明确数据、API、调度管理与 session 权威范围 |
| `protostar_worker` | 执行端：任务调度执行、后端 session、进度回传、本地状态、离线与恢复；保留与 server 的分工 |
| `protostar_cli` | 命令行调用与诊断入口，供用户与 skills 执行动作 |
| `protostar_mcp` | 供 Agents 通用调用的 tools 与 resources，明确与 CLI/worker/server 的调用边界 |
| `protostar_skills` | 项目工作流与判定指引，动作通过 CLI 执行 |
| `protostar_gui` | Next.js 与 TypeScript 自研界面；CLI 与界面使用同一服务接口；展示需求、审批、流程图、会话、知识、代码、监督与统计 |

### 产品范围与版本追踪

本表只登记覆盖与引用，具体产品行为以 [PRD.md](../../docs/PRD.md) 与各实现 spec 为准；002–031 均为规划记录，尚无批准产物。

| 覆盖范围 | PRD 工作包 | 实现 spec 编号 |
|---|---|---|
| 账户、多组织与权限 | W01 | 003、004、015–017 |
| 原生需求、产物版本与人工审批 | W02 | 005、006 |
| 图与调度：节点边、就绪任务、领取租约、分页与变更序列 | W03 | 008–010 |
| Python worker 与多后端执行 | W04 | 011–014 |
| CLI、MCP 与 skills 调用入口 | W05 | 018–020 |
| 研发 Web 主流程与运行事件 | W06 | 002、007、027 |
| 交付关联与人工确认 | W07 | 007、021 |
| 迁移与旧端退出 | W08 | 031 |
| CodeGraph 代码理解 | W09 | 025 |
| Hindsight 项目知识 | W10 | 022–024 |
| 快速分类与建议 | W11 | 026 |
| Agent 服务与监督助手 | W12 | 028 |
| 组织流程学习 | W13 | 029 |
| 效率案例与图表 | W14 | 030 |

### Functional Requirements

- **FR-001**: 本 spec MUST 位于独立项目 `specs/001-protostar-server-init-migration/`；公开文档独立化 MUST 保留 001 编号与路径，修订版 MUST 保持 Draft 状态直到 HumanMiao 批准。
- **FR-002**: 001 plan MUST 在 001 spec 获批且正式治理文本单独获批后编写并送审；001 tasks MUST 在 001 plan 获批后编写；002 spec MUST 在 001 tasks 获批后创建。constitution 等治理文本按其自身流程批准，不得以模板代替；正式治理与 001 spec 的批准 MUST 分别记录，且不替代 001 plan、001 tasks 或 002 spec 的逐项批准。
- **FR-003**: 详细公开文档 MUST 位于本仓 `docs/`；根 README 与 AGENTS 维护入口与索引。`.specify/project-config.json` 的需求根 MUST 保持 `specs`，`.specify/feature.json` 的当前需求 MUST 保持 `specs/001-protostar-server-init-migration`。公开文档 MUST 使用仓内相对链接，外部开源资料链接 MUST 保留；公开正文 MUST 能脱离 `docs/temp/` 与其他仓库检出独立阅读。
- **FR-004**: 需求基线 MUST 覆盖四份公开副本、两份授权摘录、公开来源清单及本仓说明文档；每项需求 MUST 能追溯到具体来源标记，并 MUST 区分当前业务要求、历史实现行为与历史执行状态。
- **FR-005**: `protostar_server` MUST 承接 Pipeline 与 PM 的原生服务端责任；六个模块 MUST 使用 `protostar_server`、`protostar_worker`、`protostar_cli`、`protostar_mcp`、`protostar_skills`、`protostar_gui`，五个既有目录英文名 MUST 保持不变；空目录 MUST NOT 作为运行证据；数据、API、调度与 session 的权威边界 MUST 在获批后的迁移计划中明确。
- **FR-006**: 迁移计划 MUST 覆盖六个模块，逐项记录能力、实际实现来源、目标模块、数据/API/session 权威、保留或替代、依赖、验收、停机或并行切换边界、失败处理及旧系统退出条件。
- **FR-007**: plan MUST 以本仓可核证据与公开来源中的行为摘要制定迁移范围；历史实现只作行为研究，MUST NOT 写为本仓已运行能力或当前运行依赖；尚未确定的技术方案 MUST NOT 作为已批准选型。
- **FR-008**: 人工引导期 MUST 保持以下顺序：002 首轮使用现有 spec-kit 与人工启动方式准备并批准 002 产物，003 起由 Protostar 自举承担后续研发；人工引导期退出条件 MUST 为“002 验收并发布 0.1.0，003 起自举”；人工审批 MUST 保留，旧私有服务 MUST NOT 作为当前依赖，人工执行 MUST 记录权限、验收与退出条件。
- **FR-009**: 后续业务代码与数据迁移 MUST 使用单一权威及明确切换边界，不保留长期重复实现；四份原文 MUST 仅保留在本机 `docs/temp/archive/`，公开整理副本 MUST 位于 `docs/archive/` 并按批准映射使用中性旧端代号与当前项目主体，不得保留旧主体术语。每份副本 MUST 标注“整理副本，改名映射见 docs/temp/mapping-<slug>.md，原文哈希 <sha256>”，并有本机改名映射表和逐行差异清单；除映射命中行外正文 MUST 与原文逐字一致，API 路由、字段名、状态码与需求编号 MUST 逐项计数相等。原始与副本 SHA-256 MUST 在公开来源清单可核，仅用于字节完整性，不得代替语义等价证据；真实私有来源路径与映射原词 MUST 只在本机资料保存。
- **FR-010**: spec、plan、tasks MUST 逐层交 HumanMiao 审批，tasks 全部获批后才执行；本阶段 MUST NOT 生成 001 plan、001 tasks 或 002 spec，也 MUST NOT 迁移业务代码、生产数据、部署服务或建立可运行服务；目录、文档与草稿 MUST NOT 被当作运行证据；直接文档授权 MUST NOT 构成业务开发、数据迁移或生产部署批准。
- **FR-011**: 私人计划与 Memory MUST 原位保护，公开文档只 MAY 使用获批摘录；本轮 MUST NOT 扩大发布、RAG 或记忆写入授权；公开副本 MUST 移除私有主机地址、本机个人目录与凭据。
- **FR-012**: 迁移计划 MUST 明确验证与人工审批要求；Agent MUST NOT 自动合并 PR、关闭 issue 或发布；治理、技术方案与运行验收 MUST 分别提供证据。
- **FR-013**: 001 MUST 作为完整需求总览，以本仓 PRD 为全产品需求的自持来源，覆盖账户与多组织、原生需求、审批、图与调度、多后端、知识/CodeGraph、监督、流程学习和效率验证；总览 MUST 通过 W01–W14 与 002–031 的紧凑引用维持覆盖与追踪，MUST NOT 复制 PRD 的详细产品行为。
- **FR-014**: 002–031 路线 MUST 在总览中登记版本范围与工作包引用；未批准的版本 MUST 标为规划状态，MUST NOT 写成已批准、已实施或已发布；本次直接文档授权 MUST NOT 批准任何 002–031 产物。

### Key Entities

- **Requirement Source**：来源标记、公开副本或授权摘录、授权相关条目、当前业务要求与历史证据分类、原始与公开 SHA-256。
- **Module Responsibility**：六个模块各自的能力及责任边界。
- **Migration Plan Item**：FR-006 的完整字段，附实际实现证据与批准版本。
- **Bootstrap Exit Condition**：人工引导期的执行方式、权限与验收，以及“002 验收并发布 0.1.0，003 起自举”的退出条件。
- **Public Copy**：公开路径、整理副本标注、原文哈希、对应本机映射与逐行差异、API／字段／状态码／需求编号计数及公开哈希。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 四份公开副本、两份授权摘录及公开来源清单全部纳入登记，缺项数为 0，每项当前需求均可追溯。
- **SC-002**: 六个模块均有迁移计划项，FR-006 要求的字段缺项数为 0；完整技术迁移计划经 HumanMiao 审批。
- **SC-003**: Pipeline/PM、执行端及各调用入口的责任分别明确，数据、API 与 session 的权威及切换条件可核，未解释的重复责任数为 0。
- **SC-004**: 所有人工引导期执行方式均有验收及退出条件，缺项数为 0；实际实现来源与保留/替代判断均提供证据。
- **SC-005**: 公开正文的本地导航全部为仓内相对链接，外部开源资料链接保留；正文脱离 `docs/temp/` 仍可阅读。公开文件中的旧主体术语、私有地址、个人绝对路径、真实会话／任务标识及凭据值均为 0；四篇副本的映射回放与正文逐字一致，非映射差异为 0，API／字段／状态码／需求编号逐项计数改前等于改后。原始与公开 SHA-256 均可核，私人原件保持原位且授权不扩大。
- **SC-006**: 公开化前后 001 编号与路径不变；技术 plan 的前置条件有正式治理与 001 spec 批准证据，未获批的业务代码及生产数据迁移动作数为 0。
- **SC-007**: W01–W14 与 002–031 在总览表中全部有引用，缺项数为 0；账户与多组织、原生需求、审批、图与调度、多后端、知识/CodeGraph、监督、流程学习和效率验证均可从总览追踪到 PRD 与对应版本；未批准版本被写成已批准或已实施的数量为 0。

## Assumptions

- 项目现行主体为泠鱼科技（LingKoiTech）；本仓为公开正文的位置，资料原件保留在本机归档。
- 本阶段只完成阶段一文档独立化与 001 修订；本次直接文档授权只覆盖文档工作，业务实现、数据切换、部署与发布由后续获批 plan/tasks 决定。
- Python 与 uv 管理 Python 工作区、Next.js 界面是用户已确认的产品方向；具体框架、运行结构、存储、端口与迁移方案留待 plan 审批。
- 001 作为需求总览维护产品目标、模块归属、来源索引、跨版本约束与 002–031 实现 spec 索引；001 自身仍生成并批准 plan 与 tasks，不发布功能版本。
- 五个模块目录为空，`protostar_server` 尚未创建；Spec Kit 已接入，constitution 1.0.0 正式正文已生成并作为 T029 待批稿保存，批准栏为空且尚未生效；001 总览与迁移规划仍为 Draft，001 plan、001 tasks 与 002 spec 尚未生成。
- 002 构建前只使用现有 spec-kit 与人工启动方式，不能预先声称由尚未运行的 Protostar 开发 002；文档独立化不构成 002 spec 批准。
- CodeGraph 在本仓查询无相关代码结果；Hindsight 未接入；现有文档与来源摘录为设计输入，不表示代码理解或知识管理能力已经实现。
- 四份历史原文保留在本机 `docs/temp/archive/` 且被 Git 忽略；真实私有来源路径只在本机索引记录，原始与公开 SHA-256 均由公开来源清单登记。

## Out of Scope

本次无业务开发、数据切换、部署、发布、提交或合并；阶段一直接文档授权只覆盖文档工作，不生成 001 plan、001 tasks 或 002 spec，也不构成上述动作的批准。
