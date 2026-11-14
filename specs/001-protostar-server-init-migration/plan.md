# Implementation Plan: Protostar 001 产品需求总览与六模块迁移规划

**Branch**: `001-protostar-server-init-migration` | **Date**: 2026-11-13 | **Spec**: [spec.md](spec.md)

**Input**: `specs/001-protostar-server-init-migration/spec.md`

**Status**: 待 HumanMiao 审批。本文件是规划产物，不批准任何实现、tasks、002 spec 或发布；001 不发布功能版本。

## 1. Summary

001 plan 只定义迁移与研发规划本身：以已批输入的 001 需求为范围，建立六模块迁移矩阵、唯一权威与切换边界、人工引导期、版本与工作包映射，以及文档级验收方式。本计划不创建 `protostar_server` 或任何业务代码，不建立可运行服务，不迁移生产数据，不生成 001 tasks 与 002 spec。

规划结论以本仓可核事实为准：五个模块目录为空，`protostar_server` 未创建，仓内无 Python、TypeScript、依赖清单或测试文件；历史资料只作为行为研究来源，不作为本仓实现或运行证据。技术方向取自 [PRD.md](../../docs/PRD.md)，具体依赖版本、锁文件与运行参数由对应实施 spec 决定并验收。

## 2. Technical Context

| 项目 | 内容 |
|---|---|
| Language/Version | Python >=3.11（[PRD.md](../../docs/PRD.md) §4.1），`uv` 管理 Python 工作区；界面使用 TypeScript 与 Next.js。001 不写版本 pin。 |
| Primary Dependencies | 本计划拟采用：FastAPI、Pydantic、SQLAlchemy、psycopg、Alembic；MCP 官方 Python SDK；Next.js App Router、React Flow、ECharts；OIDC Authorization Code＋PKCE 实现库；OMP／Hermes／Codex 官方接口；Hindsight 客户端；CodeGraph CLI／MCP；Jev Python SDK。以上均为待审批方案，不是已安装或已批准版本。 |
| Storage | PostgreSQL 承载业务数据，使用 ltree／JSONB；worker 本地使用 SQLite 保存队列、尝试与恢复状态；产物与事件按有界块保存。schema 与迁移脚本归 002 起的实施 spec。 |
| Testing | constitution IV 要求 Test-First 与真实输出；各实施 spec 选择框架、隔离方式与命令并保存实际结果。001 只做文档级核对（[quickstart.md](quickstart.md)），不运行产品测试。 |
| Target Platform | 002 为本机单操作者、单个活动项目、一项研发需求，服务仅绑定 loopback；010–014 扩展派发、worker 与后端能力；身份与多组织按 015–017 路线交付；远程 worker 部署范围在具备身份权限的后续获批方案中定义，001 不另行承诺远程部署版本。 |
| Project Type | 多模块 Web 应用的规划产物（server／worker／CLI／MCP／skills／GUI）；本阶段不产生实现。 |
| Performance Goals | [PRD.md](../../docs/PRD.md) §16.3 的建议目标：局部图读取 p95 ≤1s、事件到界面 p95 ≤2s、1,000 节点／2,000 条边／20 并发查看。均为待验证目标，测量归 009、027、030。 |
| Constraints | 仓内无产品源码；CodeGraph 查询无相关代码；当前会话未接入 Hindsight，未取得部署证据；六个模块名与既有五个目录名固定；业务数据单一权威；002 之前不启用远程身份或多组织；不保留长期双写；不得以目录或文档充当运行证据。 |
| Scale/Scope | 6 个模块、W01–W14 工作包、002–031 共 30 个实施 spec、版本 0.1.0–0.30.0；001 为总览，不发布功能版本。 |

## 3. Constitution Check

*GATE: Phase 0 研究前检查，Phase 1 设计后复核。*

| 门禁 | 设计对应章节 | 结论 |
|---|---|---|
| I 独立产品与单一权威 | [contracts/migration-plan.md](contracts/migration-plan.md) 的模块矩阵与权威表；[data-model.md](data-model.md) 的唯一权威不变量 | 通过：server 为业务权威，worker 只负责本机活进程与 session，旧端只作行为研究与可选导入。 |
| II 版本绑定与逐层批准 | 本文件 §13 的输入 SHA 与空白批准栏；§6 stage G6；不生成 tasks | 通过：plan 自身待批，tasks 与 002 spec 未创建，批准只由 HumanMiao 产生。 |
| III 数据边界与来源 | [research.md](research.md) §1 的来源与证据分级；[data-model.md](data-model.md) 的来源与公开副本实体 | 通过：只引用公开副本与公开索引；私人原件保持原位，不扩大授权。 |
| IV 真实验证与失败处理 | §11 的文档级证据与实施验收分离；记录规则中的失败处理字段 | 通过：001 不声称产品验收；真实运行证据归各实施 spec，不以模拟或空产物代替。 |
| V 可观察执行与完整交付 | §9 的版本映射与 §10 覆盖表；001 不发布版本 | 通过：未完成能力保持规划状态，不以目录、文档或后续承诺记为完成。 |
| 产品边界与安全要求 | §2 的待批技术方案；§8 的 002 loopback 范围 | 通过：技术选择由本 plan 提出并待批；002 不提前启用远程身份或多组织。 |
| 开发流程与版本交付 | §6 stage 注册表、§13 批准状态、单一作者与逐层审核 | 通过：主线程审核、单一写入者、阶段产物分别批准。 |
| Governance | 不修改 constitution、不更新保护基线、不写 bootstrap 批准文件 | 通过：治理文本保持送审状态，批准栏空白。 |

Phase 1 设计后复核：上述对应章节仍成立，无违反项；Complexity Tracking 无条目。

## 4. Project Structure

### 4.1 Documentation（本需求）

| 文件 | 内容 | 状态 |
|---|---|---|
| [plan.md](plan.md) | 本计划：技术上下文、门禁、阶段、覆盖、验收 | 待 HumanMiao 审批 |
| [research.md](research.md) | 证据基线、技术选择、权威模型、排序与边界结论 | 本计划 Phase 0 产物 |
| [data-model.md](data-model.md) | 001 规划记录实体与不变量，不含 DDL | 本计划 Phase 1 产物 |
| [contracts/migration-plan.md](contracts/migration-plan.md) | 六模块 × FR-006 字段的规划记录 | 本计划 Phase 1 产物 |
| [quickstart.md](quickstart.md) | 001 文档级验收步骤与预期结果 | 本计划 Phase 1 产物 |
| `tasks.md` | 不创建；plan 获批后才进入 tasks 阶段 | 未生成 |

### 4.2 Planned module roots

| 路径 | 计划职责 | 当前状态 |
|---|---|---|
| `protostar_server` | 业务记录、审批、图、派发、运行投影、知识与监督服务 | 计划中，目录未创建 |
| `protostar_worker` | 本机执行、后端进程、工作目录、session、本地队列与恢复 | 目录存在，空 |
| `protostar_cli` | 命令行操作与诊断入口 | 目录存在，空 |
| `protostar_mcp` | Agent 使用的 tools 与 resources | 目录存在，空 |
| `protostar_skills` | 版本化工作流与工程指引，经 CLI 执行 | 目录存在，空 |
| `protostar_gui` | Next.js／TypeScript 界面 | 目录存在，空 |

**Structure Decision**: 保持六个既有英文模块名与五个空目录不变，`protostar_server` 只作为计划路径记录，不在本阶段创建。模块内部目录、包结构与测试布局由各实施 spec 的 plan 决定；001 不预先规定代码结构，也不以空目录作为实现证据。

## 5. Complexity Tracking

无违反 constitution 的设计项，无需豁免。六模块划分、server 与 worker 分离、界面与 API 分离均为 constitution I 与产品边界的直接要求。

## 6. 阶段注册表

| Stage | 输入 | 产物 | 出口判据 | 001 tasks 派生范围 |
|---|---|---|---|---|
| G1 输入与证据基线 | 001 spec、constitution、PRD、公开来源、CodeGraph 与 Hindsight 现状 | [research.md](research.md) §1–§2 | 输入 SHA 与答复可核；来源表与缺口说明完整，无实现性断言 | 核对证据表与缺口措辞 |
| G2 六模块迁移矩阵 | G1、[spec.md](spec.md) FR-006、PRD §3–§4 | [contracts/migration-plan.md](contracts/migration-plan.md) | 6 个模块 × 11 项语义无空白；每项含来源与对应版本 | 核对字段完整性、来源链接与版本引用 |
| G3 权威与切换规则 | G2、PRD §3.3／§4.3／§7.4、[data-model.md](data-model.md) | 记录规则中的权威、切换、失败与退出章节 | 每类对象唯一权威；无双写；切换与退出判据可核对 | 核对权威冲突与切换边界 |
| G4 引导期与版本阶段 | G3、PRD §15、spec FR-008 | 本文件 §8–§9、[research.md](research.md) §5–§6 | FR-008 四项齐全；002–031 映射无缺项；W 仅作能力索引 | 核对引导期与版本映射 |
| G5 覆盖与验证 | G1–G4、spec FR／SC、[quickstart.md](quickstart.md) | 本文件 §10–§11 | FR-001–FR-014 与 SC-001–SC-007 逐项有对应章节，缺项 0 | 按 quickstart 执行文档核对并保存本地证据 |
| G6 审核与批准 | G5 全部产物 | 主线程审核记录、HumanMiao 决定 | 主线程审核通过；HumanMiao 对具体版本作出决定（当前空白） | 批准后才由 tasks 层派生，不在本计划生成 |

## 7. 六模块迁移方案入口

| 模块 | 权威范围 | 首个相关版本 | 矩阵 |
|---|---|---|---|
| `protostar_server` | 组织、项目、需求、产物版本、审批、图、派发、运行投影、知识绑定、流程与监督服务 | 002 起，003–010、015–017、027–029 完整化 | [§2](contracts/migration-plan.md) |
| `protostar_worker` | 本机活进程、后端 session、本地队列与恢复状态 | 002 的 OMP 单任务；011–014 完整化 | [§3](contracts/migration-plan.md) |
| `protostar_cli` | 无业务状态；经 server API 操作 | 018 | [§4](contracts/migration-plan.md) |
| `protostar_mcp` | 无业务状态；scope 由 server 校验 | 019 | [§5](contracts/migration-plan.md) |
| `protostar_skills` | 无业务状态；动作经 CLI | 020 | [§6](contracts/migration-plan.md) |
| `protostar_gui` | 无业务状态；经 HTTP／SSE 读取与提交 | 002 最小界面，006–009、014、022–030 扩展 | [§7](contracts/migration-plan.md) |

统一规则：每个模块按 FR-006 的十项语义加“批准版本与证据”共十一项填写；任何一项不得留空；无本仓代码时明确写“无本仓代码”，并列出所读行为来源与对应版本，不得编造代码路径或运行证据。

## 8. 人工引导期（FR-008）

### 8.1 方式

002 使用现有 spec-kit 与人工启动方式准备并批准 002 的 spec、plan、tasks；最小系统包含 Next.js 页面、Python server、Python worker 与 PostgreSQL，服务仅绑定 loopback。由 OMP 执行一个真实获批 task，并在界面显示结果。具体命令、进程参数与启动方式由 002 的 plan／tasks 定义；本计划不发明尚不存在的启动命令，也不声称 Protostar 已能开发 002。

### 8.2 操作者权限

引导期只允许本机单操作者、单个活动项目与一项研发需求。spec、plan、tasks 逐层人工批准；批准 tasks 与启动运行分别记录；代码合入、发布与关单保留独立人类授权。Agent 与服务身份不得产生人类批准，也不得代行高权限写入。操作者身份、组织与项目范围、授权动作必须随执行证据保存。

### 8.3 真实验收

002 验收必须覆盖“登记需求→准备并批准产物→由 OMP 执行一个已批准 task→显示真实结果”的完整循环，并以真实命令、退出码、输出与环境记录证明；界面行为在浏览器中验证。审批记录、运行记录与检查输出分别保存。模拟输出、空操作、以文档代替运行均不构成验收。

### 8.4 退出条件

退出人工引导期的必要条件只有：002 真实验收通过；`0.1.0` 的发布获得明确人类批准；形成 `0.1.0` 发布记录。退出后，003 起由已运行的 Protostar 承担需求登记、产物审阅、启动获批 tasks 与结果核对；003 的运行证据用于确认后续自举运行，不作为启动 003 的前置。人工审批持续保留。本计划只登记退出条件，不能提前宣告退出，也不能以 001 文档完成代替 002 验收。

### 8.5 001 文档验收与 002 产品验收的区分

001 的验收是文档级：plan 及扩展产物的字段完整性、来源可追溯、链接有效、版本映射与覆盖表无缺项，见 [quickstart.md](quickstart.md)。002 的验收是产品运行级：真实进程、真实数据库、真实执行输出与浏览器界面。两者分别记录，不得互相替代；001 不发布功能版本。

## 9. 版本与工作包映射

版本路线以 [PRD.md](../../docs/PRD.md) §15.1 为实现顺序；W01–W14 只是能力索引与能力依赖，不等于发版顺序。002–031 均为规划记录，尚无批准产物。

| 波次 | 版本 | 工作包 | 关键依赖 |
|---|---|---|---|
| 1 | 002 | W02、W04（OMP）、W06、W07 的最小交集 | 现有 spec-kit 与人工启动 |
| 2 | 003–007 | W02、W06、W07 | 002 验收与 `0.1.0` 发布 |
| 3 | 008–014 | W03、W04 | 005–007 的产物与派发基础 |
| 4 | 015–017 | W01 | 002 已按单操作者运行；身份与隔离在自有版本补齐 |
| 5 | 018–021 | W05、W07 | 003–010 的业务操作面 |
| 6 | 022–027 | W10、W09、W11、W06 | 018–019 的入口与 007 的运行记录 |
| 7 | 028–030 | W12、W13、W14 | 022–027 的知识、代码与事件 |
| 8 | 031 | W08 | 已批准的迁移前置条件与数据 |

顺序说明：PRD §15 写 W01 先于 W02，是能力依赖；§15.1 把身份版本放在 015–017，是发布顺序。002 以单操作者 loopback 运行，不提前启用远程身份或多组织；两处按“能力索引＋版本路线”共同解释，不互相替代。

## 10. FR/SC 覆盖与验收

### 10.1 Functional Requirements

| 需求 | 对应章节 | 验收方式 |
|---|---|---|
| FR-001 | 本文件标题与 §13；spec 路径与编号不变 | 路径、编号与 Draft 状态核对 |
| FR-002 | §6 G6、§13；不生成 tasks 与 002 spec | 产物清单与批准栏核对 |
| FR-003 | §4 文档与模块路径；配置值核对 | quickstart 检查配置与链接 |
| FR-004 | [research.md](research.md) §1；记录规则每项的来源 | 来源覆盖表与逐项引用核对 |
| FR-005 | §7；记录规则 §2–§7；[data-model.md](data-model.md) 权威不变量 | 六模块名、权威与空目录事实核对 |
| FR-006 | [contracts/migration-plan.md](contracts/migration-plan.md) | 6 × 11 项无空白 |
| FR-007 | [research.md](research.md) §1、§2、§7 | 证据分级与“不作已批准选型”措辞核对 |
| FR-008 | §8 全部小节 | 方式、权限、验收、退出四项齐全 |
| FR-009 | 记录规则权威、切换、退出章节；data-model 不变量 | 单一权威与无双写核对 |
| FR-010 | 本文件 Status、§6、§8.5、§13 | 未生成 tasks、未创建代码与服务 |
| FR-011 | [research.md](research.md) §1 的授权边界 | 仅公开来源与授权摘录，无私人全文 |
| FR-012 | §11、§13；记录规则中的失败处理字段 | 验证与批准分别记录，无自动合入／关单 |
| FR-013 | §9、§10；PRD 为全产品需求来源 | W01–W14 与 002–031 引用完整 |
| FR-014 | §9；记录规则中的版本与状态字段 | 未批准版本保持规划状态 |

### 10.2 Success Criteria

| 成功标准 | 对应章节 | 当前可核状态 |
|---|---|---|
| SC-001 | research §1 来源表；记录规则逐项来源 | 001 范围内来源均登记；缺项 0 |
| SC-002 | 记录规则 6 × 11 矩阵；§13 待批 | 字段缺项 0；计划待 HumanMiao 审批 |
| SC-003 | 记录规则权威表；data-model 不变量 | 未解释的重复权威 0 |
| SC-004 | §8；research §5 | 引导期四项齐全；退出仅依赖 002 验收与 `0.1.0` 发布批准记录 |
| SC-005 | quickstart 链接与公开边界检查 | 001 产物链接目标存在；不改变四份副本 |
| SC-006 | §4、§13；quickstart | 001 编号与路径不变；业务迁移动作 0 |
| SC-007 | §9、§10 | W01–W14 与 002–031 引用缺项 0；未批准版本未写成已批准 |

## 11. 验证与证据

001 的验证只包括文档级检查：输入 SHA 与答复记录、产物存在性、记录字段完整性、FR/SC 覆盖、相对链接有效性、公开边界与“无实现性断言”。检查步骤与预期结果见 [quickstart.md](quickstart.md)。

产品级验证由各实施 spec 负责，必须在真实环境产生：002 的启动与执行输出、008–010 的图读取与派发、011–014 的进程与会话、015–017 的身份与隔离、022–025 的外部连接与索引、027–030 的事件与统计。001 不运行 build、lint、test、formatter 或产品命令，也不把文档检查当作产品验收。

证据记录字段至少包含：检查项、命令或核对方式、日期、退出码或结论、结果摘要、范围、审核人、关联产物版本。运行证据保存在本机忽略目录，不进入公开导航；公开产物只保留可核结论与链接。

## 12. 风险与处置

| 风险 | 影响 | 处置 | 归属 |
|---|---|---|---|
| 实现来源缺少本仓代码证据 | 迁移矩阵可能被误读为已有实现 | 每项明确“无本仓代码”并列出行为来源；代码证据只能在后续实现与 031 导入中产生 | 本计划与 031 |
| 审批答复与批准栏状态不一致 | 可能被误读为 plan 已获批 | §13 分别记录输入 SHA、原始答复与空白批准栏；不自行填写 | 主线程与 HumanMiao |
| PRD 对治理状态有过时描述 | 读者可能引用旧状态 | 以 constitution 实际文件为准，不修改 PRD | 本计划引用层 |
| 待批技术选择被当作已批准 | 实施 spec 可能跳过选型审核 | 明确“本计划拟采用”，版本与锁文件归实施 spec 验收 | 各实施 spec |
| 002 产物尚不存在 | 引导期验收无法在 001 内完成 | §8 只登记条件与依赖，不预写命令或结果 | 002 |
| W 依赖与版本顺序看起来冲突 | 迁移与发版排序歧义 | §9 明确能力索引与版本路线分工 | 本计划 |
| 工作树未提交 | 证据版本可能不稳定 | 审核时按 SHA 绑定；提交与合并另行授权 | 主线程 |

## 13. 批准状态与输入

### 13.1 已记录的输入

| 输入 | 版本 SHA-256 | 原始答复 | 记录位置 |
|---|---|---|---|
| [spec.md](spec.md) | `ab8b0db5263f7e84a2c00f78997877f01233051167d644b6dda2c8e34fd098f4` | 全部自动审批 | [input-decision.md](checklists/input-decision.md) |
| [constitution.md](../../.specify/memory/constitution.md) | `eba9bce739c500c9129328a11e562479a7e5ca84afbae07b3b9632e8e7d79ac4` | 全部自动审批 | [input-decision.md](checklists/input-decision.md) |

上述答复只作为编写 001 plan 的输入依据：不批准本 plan、不批准 tasks、不批准 002–031 的任何产物，也不授权合入、发布或关单。constitution 与 001 spec 的批准栏、Draft 状态与保护基线保持原样。

### 13.2 本计划的批准栏

| 字段 | 内容 |
|---|---|
| 批准人 | |
| 批准日期 | |
| 批准范围 | |
| 批准依据 | |

本计划当前状态为“待 HumanMiao 审批”。主线程审核后提交 HumanMiao 对具体版本作出决定；在决定记录存在之前，本计划不得作为 tasks 的批准输入。
