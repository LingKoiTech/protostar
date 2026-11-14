# Tasks: Protostar 001 产品需求总览与六模块迁移规划

**Input**: `specs/001-protostar-server-init-migration/` 下已批 plan 五件：`plan.md`、`research.md`、`data-model.md`、`quickstart.md`、`contracts/migration-plan.md`；用户故事取自 `spec.md`。

**Prerequisites**: plan.md（已批）、spec.md（已批输入）、research.md、data-model.md、contracts/、quickstart.md。

**Status**: 待 HumanMiao 审批；本文件所有任务均未执行、均未勾选。任务执行必须等待整份 tasks 获批；002 spec 与产品实施另走各自的 spec → plan → tasks 批准。

**Tests**: 不适用。001 是文档规划核对，无产品代码、无行为变更，不生成 RED／GREEN／REFACTOR，不运行 build、lint、test、formatter 或产品命令。每个任务的 `tdd` 字段统一写“不适用：文档规划核对，无产品代码或行为变更”，验证依据为真实文档证据与逐项人工核对。

## 0. 派生依据与边界

### 0.1 批准输入

| 对象 | SHA-256 | 依据 |
|---|---|---|
| `plan.md` | `f505e990e65808ebd69eff94cfb1fbf4e1dd3480ba3d2da7fc4571dcc20bf0c5` | `checklists/plan-decision.md`；`docs/temp/approval-001-plan.json` |
| `research.md` | `5bb91e920218880f2e89923a3c6af6e9d8061c41e8b6b555c7e9e4e5ee2f11a4` | 同上 |
| `data-model.md` | `e34dfdd51234cc15414983adf8dff57e455e9c725dbc2a6e89f50ceb6bc0dce7` | 同上 |
| `quickstart.md` | `3700d2a929af17ac82e8af1c1d6153e4e6139241c242922fbb0dec7a6e861bc2` | 同上 |
| `contracts/migration-plan.md` | `f2adb123495bddcd0760386a7a3d16bb6a9c81f3e118f4baff687719a9091ac3` | 同上 |

原始决定为 `approve_001_plan_versions_listed`，决定人 HumanMiao，日期 2026-11-13；批准范围仅为以这五个固定版本派生 001 tasks。该决定不批准 001 tasks、002–031 产物、业务实施、提交、合入、发布或关单。

### 0.2 范围

- 本 tasks 只核对 001 规划与证据，不编写任何产品实现、DDL、运行接口、安装脚本或测试，不迁移数据，不部署服务。
- 不修改 spec、plan 五件、constitution、保护基线、bootstrap、公开副本、原件、批准记录或任何入口文档。执行窗口内根 `AGENTS.md`、根 `README.md`、`docs/README.md`、`docs/governance.md` 全部只读；入口状态由主线程在窗口外仅维护 `docs/README.md` 与 `docs/governance.md`，根两文件继续禁止写入。
- 不读取私人原件全文、私人映射正文或 Memory；不做通用 secret 审计；只读公开文档、已批 plan 五件与本机 canonical 证据。
- Hindsight 未接入，知识能力保持规划状态；CodeGraph 查询结果仅作为“无相关代码”的查询记录，不证明任何产品能力。
- 001 不发布功能版本；文档级检查不得写成产品验收或治理获批。

### 0.3 任务字段与证据约定

每个任务严格使用以下字段：

- `owner`：执行角色。统一为 `task-agent`；并行派发时每个任务由独立代理执行。
- `stage`：G1–G6，对应 plan.md §6 阶段注册表。
- `depends`：前置任务或批次；未满足即阻塞，不跳过。
- `cmd`：实际读取命令或核对方式。PowerShell 7（`pwsh`）语法；路径使用 `-LiteralPath`（`New-Item` 仅支持 `-Path` 时除外）。`Select-String` 只用于定位行，不得以关键词命中代替逐项人工核对。
- `verify`：可观察的预期结果；必须逐项核对，不以固定字符串或空输出冒充通过。
- `covers`：对应的 FR／SC 编号。
- `result`：唯一结果文件。所有结果写入批次专属忽略目录 `docs/temp/001-tasks-execution/`；该路径仅以纯文本出现，不构成公开导航，不得在公开文档中建立链接。
- `tdd`：统一为“不适用：文档规划核对，无产品代码或行为变更”。

结果文件为 JSON，至少包含：`task`、`owner`、`stage`、`executed_at`（实际执行时间）、`command`（实际命令或核对方式）、`exit_code`（实际退出码；纯人工核对写 `null`）、`conclusion`（`pass`／`fail`／`blocked`）、`scope`（文件与版本）、`related_version`（001 plan 五件或 tasks 版本）、`evidence`（实际输出片段或记录路径）。失败必须原样保留；缺证据或前置失败时停止受影响任务并记 `blocked`，不补造输出、不以后续任务绕过。

哈希比较约定：所有 SHA-256 比较统一先 `ToLowerInvariant()` 再逐项比较；文件正文不写入自身 SHA，实际比较一律使用 `Get-FileHash` 实时计算，不产生自引用。

### 0.4 并行与写入规则

- `[P]` 仅表示只读来源相同但结果文件互斥，可由不同代理并行执行。
- 每个结果文件只有一个写入者；同一任务不得由两个代理同时写入。
- 本 tasks 不产生代码、业务数据或批准记录；唯一允许的写入是本任务结果文件与 T001 创建的证据目录。

## 1. Phase 1: Setup（执行基线）

**Purpose**: 建立证据目录与只读输入基线；本 Phase 不等于任何产品初始化。

- [ ] T001 (G1) 在独立执行批准存在后创建本批次证据目录并登记执行基线，路径 docs/temp/001-tasks-execution/
  - owner: task-agent
  - stage: G1
  - depends: 无（整份 tasks 获批后首任务；无独立执行批准则阻塞）
  - cmd: `$approvalPath = 'docs/temp/approval-001-tasks.json'; if (-not (Test-Path -LiteralPath $approvalPath)) { throw 'tasks execution approval record missing' }; $a = Get-Content -LiteralPath $approvalPath -Raw | ConvertFrom-Json; if ([string]::IsNullOrWhiteSpace($a.decision_maker) -or [string]::IsNullOrWhiteSpace($a.date) -or [string]::IsNullOrWhiteSpace($a.scope)) { throw 'approval record fields missing' }; if ($a.raw_answer.tasks_decision -ne 'approve_001_tasks_document_version') { throw 'unexpected tasks decision' }; if (@($a.approved_objects).Count -ne 1) { throw 'approved_objects must contain only this tasks' }; $target = $a.approved_objects[0]; if ($target.path -ne 'specs/001-protostar-server-init-migration/tasks.md') { throw 'approved object path mismatch' }; $current = (Get-FileHash -Algorithm SHA256 -LiteralPath 'specs/001-protostar-server-init-migration/tasks.md').Hash.ToLowerInvariant(); if ($current -ne ([string]$target.sha256).ToLowerInvariant()) { throw 'tasks SHA mismatch' }; if (Test-Path -LiteralPath 'docs/temp/001-tasks-execution') { throw 'batch evidence dir already exists; stop and report' }; New-Item -ItemType Directory -Path 'docs/temp/001-tasks-execution'`
  - verify: 固定批准证据 `docs/temp/approval-001-tasks.json` 实际存在；`decision_maker`、`date`、`scope` 非空；`raw_answer.tasks_decision` 为 `approve_001_tasks_document_version`；`approved_objects` 仅含本 tasks 的 path 与 sha256；当前 tasks.md 的 SHA 统一小写后与批准对象逐项一致；任一不匹配在创建目录前就地 `throw`；该记录不是 `approve_001_plan_versions_listed`，plan 批准仅是编写授权，不能当作执行授权；批次目录已存在时停止并报告，不用 `-Force` 复用或覆盖先前结果；仅在实际获批且校验通过后创建目录；结果 JSON 记录实际批准路径、决定人、时间、版本与范围，由执行者写入真实观察，不预写成功结论
  - covers: FR-012, SC-006
  - result: `docs/temp/001-tasks-execution/T001-evidence-dir.json`
  - tdd: 不适用：文档规划核对，无产品代码或行为变更

- [ ] T002 [P] (G1) 核对五件规划产物、spec 与 constitution 的 SHA-256 绑定，输入 `specs/001-protostar-server-init-migration/plan.md`、`research.md`、`data-model.md`、`quickstart.md`、`contracts/migration-plan.md`、`spec.md` 与 `.specify/memory/constitution.md`
  - owner: task-agent
  - stage: G1
  - depends: T001
  - cmd: `$files = @('specs/001-protostar-server-init-migration/plan.md','specs/001-protostar-server-init-migration/research.md','specs/001-protostar-server-init-migration/data-model.md','specs/001-protostar-server-init-migration/quickstart.md','specs/001-protostar-server-init-migration/contracts/migration-plan.md','specs/001-protostar-server-init-migration/spec.md','.specify/memory/constitution.md'); Get-FileHash -Algorithm SHA256 -LiteralPath $files | ForEach-Object { [pscustomobject]@{ Path = $_.Path; Hash = $_.Hash.ToLowerInvariant() } }`；再用 `Get-Content -LiteralPath 'docs/temp/approval-001-plan.json' -Raw | ConvertFrom-Json` 与 `Get-Content -LiteralPath 'specs/001-protostar-server-init-migration/checklists/plan-decision.md' -Raw` 读取批准对象
  - verify: 五件 SHA 统一小写后与批准记录的 `approved_objects` 及 plan-decision 表逐项一致；spec 为 `ab8b0db5263f7e84a2c00f78997877f01233051167d644b6dda2c8e34fd098f4`；constitution 为 `eba9bce739c500c9129328a11e562479a7e5ca84afbae07b3b9632e8e7d79ac4`；任一不一致即停止并记 `fail`
  - covers: FR-002, SC-006
  - result: `docs/temp/001-tasks-execution/T002-input-sha.json`
  - tdd: 不适用：文档规划核对，无产品代码或行为变更

- [ ] T003 [P] (G1) 核对本仓无实现证据与 CodeGraph 查询结果，对象为六个模块目录及仓内源码清单
  - owner: task-agent
  - stage: G1
  - depends: T001
  - cmd: `$dirs = @('protostar_worker','protostar_cli','protostar_mcp','protostar_skills','protostar_gui'); foreach ($d in $dirs) { if (-not (Test-Path -LiteralPath $d -PathType Container)) { throw "module dir missing: $d" } }; Get-ChildItem -LiteralPath $dirs -Recurse -File -Force -ErrorAction Stop | Select-Object FullName; Test-Path -LiteralPath 'protostar_server'; Get-ChildItem -LiteralPath '.' -File -Force -ErrorAction Stop | Select-Object Name`；不遍历 `.git`、`.codegraph` 或 `docs/temp`；MCP `codegraph_explore`，`projectPath` 为仓根，query 为 `protostar_server protostar_worker dispatch schedule migration tasks plan`
  - verify: 五个既有目录均存在且可读；其递归文件清单为空；`protostar_server` 不存在；仓根文件清单中无产品源码（`*.py`／`*.ts`／`*.tsx`）、依赖清单（如 `pyproject.toml`、`package.json`、`uv.lock`、`requirements*.txt`）或测试；本机检查目录不被遍历；任一模块目录缺失或不可读、或 `Get-ChildItem` 报错时立即失败，不把无输出当作空目录；CodeGraph 原样返回无相关代码，并记录该结果仅为查询事实；无 MCP 权限时记 `blocked` 并停止，不推断
  - covers: FR-007
  - result: `docs/temp/001-tasks-execution/T003-no-implementation.json`
  - tdd: 不适用：文档规划核对，无产品代码或行为变更

- [ ] T004 [P] (G1) 核对 spec-kit 只读路径、tasks 模板与扩展钩子，对象为 `.specify/feature.json`、`.specify/project-config.json`、`.specify/templates/tasks-template.md`
  - owner: task-agent
  - stage: G1
  - depends: T001
  - cmd: `pwsh -NoProfile -File .specify/scripts/powershell/check-prerequisites.ps1 -Json -PathsOnly`；`Get-Content -LiteralPath '.specify/feature.json' -Raw | ConvertFrom-Json`；`Get-Content -LiteralPath '.specify/project-config.json' -Raw | ConvertFrom-Json`；`Test-Path -LiteralPath '.specify/templates/tasks-template.md'`；`Test-Path -LiteralPath '.specify/extensions.yml'`
  - verify: 命令退出码 0；FEATURE_DIR 指向 `specs/001-protostar-server-init-migration`；feature 为 001；需求根为 `specs`；模板存在；`.specify/extensions.yml` 不存在。本任务不运行 `setup-tasks.ps1`，复用父线程已取得的模板返回
  - covers: FR-003
  - result: `docs/temp/001-tasks-execution/T004-spec-kit.json`
  - tdd: 不适用：文档规划核对，无产品代码或行为变更

---

## 2. Phase 2: Foundational（阻塞性证据基线）

**Purpose**: 在任何用户故事核对前，固定输入、证据缺口、来源登记与保护状态。

**⚠️ CRITICAL**: Phase 1 与 Phase 2 未通过前，不进入用户故事 Phase。任一任务失败或 `blocked` 时停止后续依赖任务。

- [ ] T005 [P] (G1) 核对 plan 送审快照：五件产物存在、生成前 `tasks.md` 缺失、plan 状态待审且批准栏空白，文件为 `specs/001-protostar-server-init-migration/plan.md`
  - owner: task-agent
  - stage: G1
  - depends: T002, T003, T004
  - cmd: `Get-ChildItem -LiteralPath 'specs/001-protostar-server-init-migration' -File | Select-Object Name`；`Get-Content -LiteralPath 'specs/001-protostar-server-init-migration/plan.md' -Raw` 逐项读取状态与 §13.2 批准栏；`Get-Content -LiteralPath 'docs/temp/approval-001-plan.json' -Raw | ConvertFrom-Json`
  - verify: 五件规划产物存在；本任务记录“tasks.md 在本 tasks 生成前不存在”的适用时间为 2026-11-13 送审快照，不据此在生成后制造失败；plan 文件内状态栏与空白批准栏保持送审时字节；该空白不等同于没有外部批准，外部批准事实由 T025 依据 plan-decision／approval JSON 核对；二者不互相替代
  - covers: FR-010, SC-006
  - result: `docs/temp/001-tasks-execution/T005-q2-snapshot.json`
  - tdd: 不适用：文档规划核对，无产品代码或行为变更

- [ ] T006 [P] (G1) 核对 plan §13 输入表、input-decision 与状态措辞，文件为 `plan.md`、`checklists/input-decision.md`
  - owner: task-agent
  - stage: G1
  - depends: T002, T003, T004
  - cmd: `Select-String -LiteralPath 'specs/001-protostar-server-init-migration/plan.md' -Pattern '13\.1','13\.2','待 HumanMiao 审批','批准人','批准日期','批准范围','批准依据'`；`Get-Content -LiteralPath 'specs/001-protostar-server-init-migration/checklists/input-decision.md' -Raw` 逐项人工核对
  - verify: plan §13.1 的 spec 与 constitution SHA、原始答复与 input-decision 表一致；plan 文件内状态与空白批准栏保持送审时字节，不补写、不改写；不得据空白栏推断 plan 未获外部批准，也不得据此推断 tasks 已获授权；外部批准范围以 plan-decision／approval JSON 为准
  - covers: FR-002
  - result: `docs/temp/001-tasks-execution/T006-plan-inputs.json`
  - tdd: 不适用：文档规划核对，无产品代码或行为变更

- [ ] T007 [P] (G1) 核对 research 证据基线与缺口措辞，文件为 `specs/001-protostar-server-init-migration/research.md`
  - owner: task-agent
  - stage: G1
  - depends: T002, T003, T004
  - cmd: `Get-Content -LiteralPath 'specs/001-protostar-server-init-migration/research.md' -Raw` 逐节读取 §1、§2、§7；`Select-String -LiteralPath 'specs/001-protostar-server-init-migration/research.md' -Pattern '无本仓代码','Hindsight','CodeGraph','无相关代码','未接入','待审批方案'`
  - verify: §1 来源表 S01–S09 与用途、限制逐项可核；明确记录无本仓代码、CodeGraph 无相关代码、Hindsight 未接入、技术选择为待审批方案；§7 下放决策均有负责版本与验收出口；无实现性断言；无私人路径或本机绝对路径
  - covers: FR-007, FR-011
  - result: `docs/temp/001-tasks-execution/T007-research-gaps.json`
  - tdd: 不适用：文档规划核对，无产品代码或行为变更

- [ ] T008 [P] (G1) 核对公开来源清单与四副本、两摘录的登记完整性，文件为 `docs/sources/README.md`
  - owner: task-agent
  - stage: G1
  - depends: T002, T003, T004
  - cmd: `Get-Content -LiteralPath 'docs/sources/README.md' -Raw` 逐行核对 S01–S09 表；`Get-ChildItem -LiteralPath 'docs/archive','docs/sources' -File | Select-Object FullName`；`Get-FileHash -Algorithm SHA256 -LiteralPath 'docs/archive/pipeline-prd-202605.md','docs/archive/ci-plan-20260516.md','docs/archive/approval-20260605.md','docs/archive/scheduling-20260828.md','docs/sources/overview-excerpt.md','docs/sources/planning-excerpt.md'`
  - verify: S01–S09 均有公开路径、分类与处置；四份整理副本与两份授权摘录均登记原始与公开 SHA-256；副本 SHA 与清单一致；S06-C 的五个历史来源占位标识齐全；公开清单不依赖本机资料即可阅读；缺项 0
  - covers: FR-004, SC-001, SC-005
  - result: `docs/temp/001-tasks-execution/T008-source-registry.json`
  - tdd: 不适用：文档规划核对，无产品代码或行为变更

- [ ] T009 [P] (G1) 核对治理与根文件保护状态，对象为 `.specify/memory/constitution.md`、固定保护基线、bootstrap 文件、根 `AGENTS.md` 与根 `README.md` 的既有改动
  - owner: task-agent
  - stage: G1
  - depends: T002, T003, T004
  - cmd: `Get-FileHash -Algorithm SHA256 -LiteralPath '.specify/memory/constitution.md'`；`Get-FileHash -Algorithm SHA256 -LiteralPath 'AGENTS.md','README.md','docs/README.md','docs/governance.md'`；`Select-String -LiteralPath 'specs/001-protostar-server-init-migration/checklists/analyze-plan.md','specs/001-protostar-server-init-migration/checklists/input-decision.md' -Pattern 'ce7549540fa45543cca797a150201d868e64495fdff39dc38246fb17bd4024b3'`；`Test-Path -LiteralPath '.specify/bootstrap-approval.json'`
  - verify: constitution 当前 SHA 为 `eba9bce739c500c9129328a11e562479a7e5ca84afbae07b3b9632e8e7d79ac4`；固定保护基线仍为 `ce7549540fa45543cca797a150201d868e64495fdff39dc38246fb17bd4024b3`；`.specify/bootstrap-approval.json` 不存在或保持未创建；以执行开始时四文件当前 SHA 作为只读快照，报告本轮已告知的根文件位置（根 AGENTS 第 22–23 行、根 README 第 9、39 行）与待外部 `015:T030/T031` 处理事项即可，不要求固定正文措辞、不恢复内容；本 tasks 不写入上述任何文件，不更新基线
  - covers: FR-010, FR-011
  - result: `docs/temp/001-tasks-execution/T009-protected-state.json`
  - tdd: 不适用：文档规划核对，无产品代码或行为变更

**Checkpoint**: 输入、缺口、来源与保护状态固定后，四个用户故事可按依赖并行核对。

---

## 3. Phase 3: User Story 1 - 明确独立服务端需求（Priority: P1）

**Goal**: 证明六模块职责、server／worker 分工与迁移矩阵完整，且空目录未被当作运行实现。

**Independent Test**: 只读 spec 模块表、contracts §2–§8 与 data-model §3–§4，核对 6 个模块、66 项字段、无空白、无重复写权威；不依赖 US2／US3／US4 的任务结果。

- [ ] T010 [P] [US1] (G2) 核对 spec 模块职责表与 server／worker 分工，文件为 `spec.md` 与 `contracts/migration-plan.md`
  - owner: task-agent
  - stage: G2
  - depends: T005, T006, T007, T008, T009
  - cmd: `Get-Content -LiteralPath 'specs/001-protostar-server-init-migration/spec.md' -Raw` 逐行读取模块职责表；`Get-Content -LiteralPath 'specs/001-protostar-server-init-migration/contracts/migration-plan.md' -Raw` 读取 §2、§3；`$dirs = @('protostar_worker','protostar_cli','protostar_mcp','protostar_skills','protostar_gui'); foreach ($d in $dirs) { if (-not (Test-Path -LiteralPath $d -PathType Container)) { throw "module dir missing: $d" } }; Get-ChildItem -LiteralPath $dirs -Recurse -File -Force -ErrorAction Stop | Select-Object FullName`
  - verify: 六个模块名称与 FR-005 完全一致；server 承担业务记录、审批、图、派发与运行投影；worker 承担活进程、原生 session 与本地队列；五个既有目录均存在且可读、文件清单为空、server 未创建；任一模块目录缺失或不可读时立即失败；无“空目录已运行”或“历史代码已迁入”措辞
  - covers: FR-005, SC-003
  - result: `docs/temp/001-tasks-execution/T010-module-responsibility.json`
  - tdd: 不适用：文档规划核对，无产品代码或行为变更

- [ ] T011 [P] [US1] (G2) 核对 contracts §2 `protostar_server` 的 11 项语义，文件为 `contracts/migration-plan.md`
  - owner: task-agent
  - stage: G2
  - depends: T005, T006, T007, T008, T009
  - cmd: `Get-Content -LiteralPath 'specs/001-protostar-server-init-migration/contracts/migration-plan.md' -Raw` 逐行读取 §2；`Select-String -LiteralPath 'specs/001-protostar-server-init-migration/contracts/migration-plan.md' -Pattern '^## 2\.','^## 3\.'` 仅用于定位章节边界
  - verify: §2 恰有 11 行语义；每行有计划内容与来源／对应版本；实际实现来源明确写“无本仓代码”；无空白单元格；无编造代码路径、进程或运行记录；版本引用在 002–031 内
  - covers: FR-006, SC-002
  - result: `docs/temp/001-tasks-execution/T011-server-matrix.json`
  - tdd: 不适用：文档规划核对，无产品代码或行为变更

- [ ] T012 [P] [US1] (G2) 核对 contracts §3 `protostar_worker` 的 11 项语义，文件为 `contracts/migration-plan.md`
  - owner: task-agent
  - stage: G2
  - depends: T005, T006, T007, T008, T009
  - cmd: `Get-Content -LiteralPath 'specs/001-protostar-server-init-migration/contracts/migration-plan.md' -Raw` 逐行读取 §3；`Select-String -LiteralPath 'specs/001-protostar-server-init-migration/contracts/migration-plan.md' -Pattern '^## 3\.','^## 4\.'` 仅用于定位章节边界
  - verify: §3 恰有 11 行语义；每行有来源与版本；“无本仓代码”明确；权威仅限活进程、后端 session、本地队列与恢复状态；不写业务图或审批权威；无空白
  - covers: FR-006, SC-002
  - result: `docs/temp/001-tasks-execution/T012-worker-matrix.json`
  - tdd: 不适用：文档规划核对，无产品代码或行为变更

- [ ] T013 [P] [US1] (G2) 核对 contracts §4 `protostar_cli` 的 11 项语义，文件为 `contracts/migration-plan.md`
  - owner: task-agent
  - stage: G2
  - depends: T005, T006, T007, T008, T009
  - cmd: `Get-Content -LiteralPath 'specs/001-protostar-server-init-migration/contracts/migration-plan.md' -Raw` 逐行读取 §4；`Select-String -LiteralPath 'specs/001-protostar-server-init-migration/contracts/migration-plan.md' -Pattern '^## 4\.','^## 5\.'` 仅用于定位章节边界
  - verify: §4 恰有 11 行语义；无业务状态、经 server API 操作；来源与版本齐全；“无本仓代码”明确；无空白；不把计划命令写成已实现命令
  - covers: FR-006, SC-002
  - result: `docs/temp/001-tasks-execution/T013-cli-matrix.json`
  - tdd: 不适用：文档规划核对，无产品代码或行为变更

- [ ] T014 [P] [US1] (G2) 核对 contracts §5 `protostar_mcp` 的 11 项语义，文件为 `contracts/migration-plan.md`
  - owner: task-agent
  - stage: G2
  - depends: T005, T006, T007, T008, T009
  - cmd: `Get-Content -LiteralPath 'specs/001-protostar-server-init-migration/contracts/migration-plan.md' -Raw` 逐行读取 §5；`Select-String -LiteralPath 'specs/001-protostar-server-init-migration/contracts/migration-plan.md' -Pattern '^## 5\.','^## 6\.'` 仅用于定位章节边界
  - verify: §5 恰有 11 行语义；无业务状态、scope 由 server 校验；来源与版本齐全；“无本仓代码”明确；无空白；无占位 tools 被写成已交付
  - covers: FR-006, SC-002
  - result: `docs/temp/001-tasks-execution/T014-mcp-matrix.json`
  - tdd: 不适用：文档规划核对，无产品代码或行为变更

- [ ] T015 [P] [US1] (G2) 核对 contracts §6 `protostar_skills` 的 11 项语义，文件为 `contracts/migration-plan.md`
  - owner: task-agent
  - stage: G2
  - depends: T005, T006, T007, T008, T009
  - cmd: `Get-Content -LiteralPath 'specs/001-protostar-server-init-migration/contracts/migration-plan.md' -Raw` 逐行读取 §6；`Select-String -LiteralPath 'specs/001-protostar-server-init-migration/contracts/migration-plan.md' -Pattern '^## 6\.','^## 7\.'` 仅用于定位章节边界
  - verify: §6 恰有 11 行语义；无业务状态、动作经 CLI；来源与版本齐全；“无本仓代码”明确；无空白；不把历史提示词写成已迁入代码
  - covers: FR-006, SC-002
  - result: `docs/temp/001-tasks-execution/T015-skills-matrix.json`
  - tdd: 不适用：文档规划核对，无产品代码或行为变更

- [ ] T016 [P] [US1] (G2) 核对 contracts §7 `protostar_gui` 的 11 项语义，文件为 `contracts/migration-plan.md`
  - owner: task-agent
  - stage: G2
  - depends: T005, T006, T007, T008, T009
  - cmd: `Get-Content -LiteralPath 'specs/001-protostar-server-init-migration/contracts/migration-plan.md' -Raw` 逐行读取 §7；`Select-String -LiteralPath 'specs/001-protostar-server-init-migration/contracts/migration-plan.md' -Pattern '^## 7\.','^## 8\.'` 仅用于定位章节边界
  - verify: §7 恰有 11 行语义；无业务状态、经 HTTP／SSE 读取与提交；来源与版本齐全；“无本仓代码”明确；无空白；不把界面计划写成已运行页面
  - covers: FR-006, SC-002
  - result: `docs/temp/001-tasks-execution/T016-gui-matrix.json`
  - tdd: 不适用：文档规划核对，无产品代码或行为变更

- [ ] T017 [US1] (G2) 汇总核对六模块矩阵总数、名称与空白，文件为 `contracts/migration-plan.md`
  - owner: task-agent
  - stage: G2
  - depends: T011, T012, T013, T014, T015, T016
  - cmd: `Select-String -LiteralPath 'specs/001-protostar-server-init-migration/contracts/migration-plan.md' -Pattern '^## [2-7]\.'` 定位章节；逐章人工计数并与 T011–T016 结果交叉核对
  - verify: 6 个模块章节；每章 11 项；合计 66 项；空白单元格 0；模块名称与 FR-005 一致；每项至少一个来源与一个 002–031 版本引用；缺项 0
  - covers: FR-006, SC-002
  - result: `docs/temp/001-tasks-execution/T017-matrix-total.json`
  - tdd: 不适用：文档规划核对，无产品代码或行为变更

- [ ] T018 [US1] (G3) 核对跨模块权威与无双写规则，文件为 `contracts/migration-plan.md` §8–§9 与 `data-model.md` §3–§4
  - owner: task-agent
  - stage: G3
  - depends: T010, T017
  - cmd: `Get-Content -LiteralPath 'specs/001-protostar-server-init-migration/contracts/migration-plan.md' -Raw` 读取 §8、§9；`Get-Content -LiteralPath 'specs/001-protostar-server-init-migration/data-model.md' -Raw` 读取 §3、§4 的 12 条不变量
  - verify: 用户／组织／项目／需求／产物／审批／图／派发／运行投影唯一写权威为 server；活进程与原生 session 唯一权威为 worker；CLI／MCP／skills／GUI 无业务真源；界面仅展示；无对象出现两个写权威；无长期双写
  - covers: FR-005, FR-009, SC-003
  - result: `docs/temp/001-tasks-execution/T018-authority.json`
  - tdd: 不适用：文档规划核对，无产品代码或行为变更

**Checkpoint**: US1 可独立判定；不依赖 US2–US4 结果。

---

## 4. Phase 4: User Story 2 - 归档与授权摘录入基线（Priority: P1）

**Goal**: 证明来源登记、公开副本标注、哈希与公开边界完整，且公开正文可脱离本机资料阅读。

**Independent Test**: 只读 `docs/sources/README.md`、`docs/archive/` 四副本头部、`docs/sources/` 两摘录与 canonical 等价结果，核 S01–S09、4+2 登记、哈希与边界；不读取私人原件全文。

- [ ] T019 [P] [US2] (G1) 核对来源与副本覆盖表，文件为 `spec.md` 来源表与 `docs/sources/README.md`
  - owner: task-agent
  - stage: G1
  - depends: T005, T006, T007, T008, T009
  - cmd: `Get-Content -LiteralPath 'specs/001-protostar-server-init-migration/spec.md' -Raw` 读取来源与交接索引；`Get-Content -LiteralPath 'docs/sources/README.md' -Raw` 逐行读取 S01–S09 与 §三、§四
  - verify: spec 四份公开副本、两份授权摘录、公开来源清单与本仓说明均有登记；S01–S09 无缺项；每项注明公开路径、分类与处置；历史证据与当前要求分开；缺项 0
  - covers: FR-004, SC-001
  - result: `docs/temp/001-tasks-execution/T019-source-coverage.json`
  - tdd: 不适用：文档规划核对，无产品代码或行为变更

- [ ] T020 [P] [US2] (G1) 核对四副本标注、公开哈希与 canonical 等价结果，文件为 `docs/archive/` 四份 Markdown 与 `docs/temp/checks/strict-copy-equivalence-result.json`
  - owner: task-agent
  - stage: G1
  - depends: T005, T006, T007, T008, T009
  - cmd: `Get-Content -LiteralPath 'docs/archive/pipeline-prd-202605.md','docs/archive/ci-plan-20260516.md','docs/archive/approval-20260605.md','docs/archive/scheduling-20260828.md' -TotalCount 8`；`Get-FileHash -Algorithm SHA256 -LiteralPath 'docs/archive/pipeline-prd-202605.md','docs/archive/ci-plan-20260516.md','docs/archive/approval-20260605.md','docs/archive/scheduling-20260828.md'`；`$j = Get-Content -LiteralPath 'docs/temp/checks/strict-copy-equivalence-result.json' -Raw | ConvertFrom-Json; $j | Select-Object status; $j.issues`
  - verify: 每份副本头部注明“整理副本，改名映射见 docs/temp/mapping-<slug>.md，原文哈希 <sha256>”；副本 SHA 与 source 清单一致；等价结果为 `PASS` 且 issues 为空；时间标签 16:43 与退出码来自 HumanMiao 本轮确认的既有执行记录，JSON 本身不证明时间或退出码；不重算等价、不读原件
  - covers: FR-009, SC-005
  - result: `docs/temp/001-tasks-execution/T020-copy-equivalence.json`
  - tdd: 不适用：文档规划核对，无产品代码或行为变更

- [ ] T021 [P] [US2] (G1) 核对公开边界、摘录范围与相对链接，文件为 `docs/sources/README.md`、`docs/sources/overview-excerpt.md`、`docs/sources/planning-excerpt.md`
  - owner: task-agent
  - stage: G1
  - depends: T005, T006, T007, T008, T009
  - cmd: `Select-String -LiteralPath 'docs/sources/README.md','docs/sources/overview-excerpt.md','docs/sources/planning-excerpt.md','docs/archive/pipeline-prd-202605.md','docs/archive/ci-plan-20260516.md','docs/archive/approval-20260605.md','docs/archive/scheduling-20260828.md' -Pattern 'https?://','[A-Za-z]:\\','\\\\[A-Za-z0-9._-]+\\'` 只用于定位候选行；对每个相对链接，以源文件目录 `Split-Path -Parent` 为基准，对目标执行 `[System.Uri]::UnescapeDataString($target)` 后用 `Test-Path -LiteralPath (Join-Path $base $decoded)` 核验；逐条人工记录
  - verify: 无私有主机地址、个人绝对路径、真实会话／任务标识；按 FR-011 人工核对上述公开文件是否存在凭据值，不做通用 secret 审计；摘录范围与 source 清单行段一致；所有仓内相对链接按所在源文件目录解析并 URL 解码后目标实际存在；无指向 `docs/temp/` 的公开链接；外部链接仅为公开官方资料；`Select-String` 命中或 `Get-Content` 读取不自动等于违规或通过，每条必须人工判定并记录依据
  - covers: FR-009, FR-011, SC-005
  - result: `docs/temp/001-tasks-execution/T021-public-boundary.json`
  - tdd: 不适用：文档规划核对，无产品代码或行为变更

**Checkpoint**: US2 可独立判定；不依赖 US1／US3／US4 任务结果。

---

## 5. Phase 5: User Story 3 - 制定可审核的技术迁移计划（Priority: P2）

**Goal**: 证明权威、切换、失败处理、人工引导期与批准链可审核，且未提前宣告实现或退出。

**Independent Test**: 只读 plan §8–§11、contracts §8–§10、research §6 与批准记录，逐项核对四要素、六条切换规则、证据字段与批准范围；不运行产品命令。

- [ ] T022 [P] [US3] (G3) 核对切换与旧端退出规则，文件为 `contracts/migration-plan.md` §9 与 `research.md` §6
  - owner: task-agent
  - stage: G3
  - depends: T005, T006, T007, T008, T009
  - cmd: `Get-Content -LiteralPath 'specs/001-protostar-server-init-migration/contracts/migration-plan.md' -Raw` 读取 §9；`Get-Content -LiteralPath 'specs/001-protostar-server-init-migration/research.md' -Raw` 读取 §6
  - verify: 当前无旧端进程、无当前停机窗口；031 获批后才发生项目级切换；逐条核对 §9 六条规则：无当前停机、切换前置、切换顺序、禁止事项、失败处理、旧端退出判据均齐全；无“已切换”“已导入”“已退出”断言
  - covers: FR-009, SC-003
  - result: `docs/temp/001-tasks-execution/T022-switch-exit.json`
  - tdd: 不适用：文档规划核对，无产品代码或行为变更

- [ ] T023 [P] [US3] (G3) 核对失败处理、证据字段与人工权限，文件为 `plan.md` §11 与 `contracts/migration-plan.md` §9.5
  - owner: task-agent
  - stage: G3
  - depends: T005, T006, T007, T008, T009
  - cmd: `Get-Content -LiteralPath 'specs/001-protostar-server-init-migration/plan.md' -Raw` 读取 §11；`Get-Content -LiteralPath 'specs/001-protostar-server-init-migration/contracts/migration-plan.md' -Raw` 读取 §9.5 与 §10
  - verify: 证据字段至少含检查项、命令或核对方式、日期、退出码或结论、结果摘要、范围、审核人、关联产物版本；错误保留原始原因并在发生位置停止；不自动重放远端副作用；Agent 不自动合并、关单或发布；人工审批保留
  - covers: FR-012
  - result: `docs/temp/001-tasks-execution/T023-failure-evidence.json`
  - tdd: 不适用：文档规划核对，无产品代码或行为变更

- [ ] T024 [P] [US3] (G4) 核对人工引导期四要素与 001／002 验收区分，文件为 `plan.md` §8
  - owner: task-agent
  - stage: G4
  - depends: T005, T006, T007, T008, T009
  - cmd: `Get-Content -LiteralPath 'specs/001-protostar-server-init-migration/plan.md' -Raw` 逐节读取 §8.1–§8.5
  - verify: 方式、操作者权限、真实验收、退出条件四项齐全；退出仅依赖 002 真实验收通过、`0.1.0` 明确发布批准与发布记录；003 起自举；001 文档验收与 002 产品验收分别记录；不提前宣告退出或自举
  - covers: FR-008, SC-004
  - result: `docs/temp/001-tasks-execution/T024-bootstrap.json`
  - tdd: 不适用：文档规划核对，无产品代码或行为变更

- [ ] T025 [P] [US3] (G6) 核对批准链与当前范围，文件为 `checklists/plan-decision.md`、`docs/temp/approval-001-plan.json`、`checklists/analyze-plan.md`
  - owner: task-agent
  - stage: G6
  - depends: T001, T005, T006, T007, T008, T009
  - cmd: `Get-Content -LiteralPath 'specs/001-protostar-server-init-migration/checklists/plan-decision.md' -Raw`；`$a = Get-Content -LiteralPath 'docs/temp/approval-001-plan.json' -Raw | ConvertFrom-Json; $a.raw_answer; $a.approved_objects; $a.scope; $a.protected_scope`；`Get-Content -LiteralPath 'specs/001-protostar-server-init-migration/checklists/analyze-plan.md' -Raw`；`Get-ChildItem -LiteralPath 'specs' -Directory | Select-Object Name`
  - verify: 原始决定为 `approve_001_plan_versions_listed`，决定人 HumanMiao，日期 2026-11-13，附注为空；五个对象的 SHA 与 T002 一致；范围仅为派生 001 tasks，仅授权编写 tasks，不构成 tasks 执行批准；T001 结果必须记载本 tasks 的独立执行批准（记录路径、决定人、时间、对象 SHA 与范围）；`specs` 下只有 001 目录，无 002 产物；不得把 plan 批准误当 tasks 批准，也不得因外部 tasks 批准存在而否定本核对；本 tasks 内四项批准栏保持空白，外部独立决定负责绑定版本
  - covers: FR-002, FR-010, SC-006
  - result: `docs/temp/001-tasks-execution/T025-approval-chain.json`
  - tdd: 不适用：文档规划核对，无产品代码或行为变更

**Checkpoint**: US3 可独立判定；不依赖 US1／US2／US4 任务结果。

---

## 6. Phase 6: User Story 4 - 追踪全产品需求与版本路线（Priority: P2）

**Goal**: 证明 W01–W14、002–031、FR／SC 覆盖完整，且未把规划写成已批准或已实施。

**Independent Test**: 只读 plan §9–§10、spec 产品范围表与 PRD §15／§15.1，核对工作包与版本引用、14 项 FR、7 项 SC、状态措辞与 001 身份；不运行产品命令。

- [ ] T026 [P] [US4] (G4) 核对 W01–W14 与 002–031 的映射及规划状态，文件为 `plan.md` §9、`spec.md` 产品范围表、`docs/PRD.md` §15 标题
  - owner: task-agent
  - stage: G4
  - depends: T005, T006, T007, T008, T009
  - cmd: `Get-Content -LiteralPath 'specs/001-protostar-server-init-migration/plan.md' -Raw` 读取 §9；`Get-Content -LiteralPath 'specs/001-protostar-server-init-migration/spec.md' -Raw` 读取产品范围与版本追踪表；`Get-Content -LiteralPath 'docs/PRD.md' -Raw` 逐项读取 §15 与 §15.1 的实际内容与表格
  - verify: W01–W14 全部出现；002–031 全部出现且顺序连续；每项有工作包或版本引用；未批准版本标为规划状态；W 仅作能力索引、002–031 为实现顺序；缺项 0
  - covers: FR-013, FR-014, SC-007
  - result: `docs/temp/001-tasks-execution/T026-version-coverage.json`
  - tdd: 不适用：文档规划核对，无产品代码或行为变更

- [ ] T027 [P] [US4] (G5) 核对 plan §10 的 FR／SC 覆盖表，文件为 `plan.md`
  - owner: task-agent
  - stage: G5
  - depends: T026
  - cmd: `Get-Content -LiteralPath 'specs/001-protostar-server-init-migration/plan.md' -Raw` 逐行读取 §10.1、§10.2；`Select-String -LiteralPath 'specs/001-protostar-server-init-migration/plan.md' -Pattern '^\| FR-','^\| SC-'` 仅用于列行
  - verify: FR-001–FR-014 共 14 行；SC-001–SC-007 共 7 行；每行有对应章节与验收方式；缺项 0；不得以“其余类似”跳过；本任务只核对覆盖表完整性，不替代各 FR／SC 主任务
  - covers: FR-001–FR-014, SC-001–SC-007（覆盖矩阵完整性）
  - result: `docs/temp/001-tasks-execution/T027-fr-sc-coverage.json`
  - tdd: 不适用：文档规划核对，无产品代码或行为变更

- [ ] T028 [P] [US4] (G5) 核对无实现性断言、001 身份与配置，文件为 `plan.md`、`spec.md`、`research.md`、`.specify/project-config.json`、`.specify/feature.json`
  - owner: task-agent
  - stage: G5
  - depends: T026
  - cmd: `Select-String -LiteralPath 'specs/001-protostar-server-init-migration/plan.md','specs/001-protostar-server-init-migration/spec.md','specs/001-protostar-server-init-migration/research.md' -Pattern '已实现','已运行','已发布'` 仅用于定位候选；逐条人工判断上下文；`Get-FileHash -Algorithm SHA256 -LiteralPath 'specs/001-protostar-server-init-migration/spec.md'`；`Get-Content -LiteralPath '.specify/project-config.json' -Raw`；`Get-Content -LiteralPath '.specify/feature.json' -Raw`
  - verify: “已实现”“已运行”“已发布”只出现在禁止、条件或未来语境，无 001 能力完成声明；001 编号与路径不变，spec SHA 为 `ab8b0db5263f7e84a2c00f78997877f01233051167d644b6dda2c8e34fd098f4`；需求根为 `specs`，当前 feature 为 001；公开导航为相对链接
  - covers: FR-001, FR-003, FR-007, SC-005
  - result: `docs/temp/001-tasks-execution/T028-claims-identity.json`
  - tdd: 不适用：文档规划核对，无产品代码或行为变更

**Checkpoint**: US4 可独立判定；不依赖 US1／US2／US3 任务结果。

---

## 7. Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 复用 canonical 证据、核对证据完整性并自检本 tasks 的写入面。

- [ ] T029 (G5) 只读复用 canonical 三件结果，文件为 `docs/temp/checks/automation-ready-publication.json`、`strict-public-documents-result.json`、`strict-copy-equivalence-result.json`
  - owner: task-agent
  - stage: G5
  - depends: T018, T019, T020, T021, T022, T023, T024, T025, T027, T028
  - cmd: `$files = @('docs/temp/checks/automation-ready-publication.json','docs/temp/checks/strict-public-documents-result.json','docs/temp/checks/strict-copy-equivalence-result.json'); foreach ($f in $files) { $j = Get-Content -LiteralPath $f -Raw | ConvertFrom-Json; [pscustomobject]@{ File=$f; Status=$j.status; Phase=$j.phase; Issues=($j.issues | ConvertTo-Json -Compress) } }`
  - verify: planning 为 `FAIL`、phase 为 `planning`、issues 恰为一项 `{"kind":"ProtectedFileChanged","file":"constitution.md"}`；publication 为 `FAIL`、phase 为 `publication`、issues 恰为同一项；等价为 `PASS`、issues 为空；时间标签 strict 16:43、planning 17:01、等价 16:43 由 HumanMiao 本轮确认，退出码依据既有执行记录；JSON 本身不含时间或 exit 字段，不据此推断；不重跑、不改基线、不写 bootstrap、不把 FAIL 记为通过
  - covers: FR-012, SC-006
  - result: `docs/temp/001-tasks-execution/T029-canonical.json`
  - tdd: 不适用：文档规划核对，无产品代码或行为变更

- [ ] T030 (G6) 核对 T001–T029 结果文件完整性与证据字段，目录为 `docs/temp/001-tasks-execution/`
  - owner: task-agent
  - stage: G6
  - depends: T029（并需 T001–T029 全部任务产生结果文件）
  - cmd: `Get-ChildItem -LiteralPath 'docs/temp/001-tasks-execution' -File | ForEach-Object { Get-Content -LiteralPath $_.FullName -Raw | ConvertFrom-Json }`；`Get-ChildItem -LiteralPath 'docs/temp/001-tasks-execution' -File | Select-Object Name`
  - verify: T001–T029 每个任务有唯一结果文件；字段 `task`、`owner`、`stage`、`executed_at`、`command`、`exit_code`、`conclusion`、`scope`、`related_version`、`evidence` 齐全；失败或 `blocked` 原样保留；无私人地址、凭据或真实内部标识；缺任一结果即停止并记 `blocked`，不以其它任务替代
  - covers: FR-012, SC-006
  - result: `docs/temp/001-tasks-execution/T030-evidence-completeness.json`
  - tdd: 不适用：文档规划核对，无产品代码或行为变更

- [ ] T031 (G6) 自检本 tasks 的格式、字段与写入面，文件为 `specs/001-protostar-server-init-migration/tasks.md`
  - owner: task-agent
  - stage: G6
  - depends: T030
  - cmd: `Get-Content -LiteralPath 'specs/001-protostar-server-init-migration/tasks.md' -Raw` 逐项核对；`Get-FileHash -Algorithm SHA256 -LiteralPath 'specs/001-protostar-server-init-migration/tasks.md'`；`Get-ChildItem -LiteralPath 'specs/001-protostar-server-init-migration' -File | Select-Object Name`；`Get-ChildItem -LiteralPath 'specs' -Directory | Select-Object Name`；`Get-FileHash -Algorithm SHA256 -LiteralPath 'AGENTS.md','README.md','docs/README.md','docs/governance.md'`
  - verify: 作者送审版本为 31 个未勾选任务，结构、ID 连续、`[US1]`–`[US4]`、owner/stage/depends/cmd/verify/covers/result/tdd、Phase↔G 映射与依赖图一致；执行代理保持 tasks 文件只读，其 SHA 与 T001 批准对象一致；当前任务状态与勾选状态以真实结果和主线程登记为准，本任务不断言 tasks 仍未获批；批准栏四项保持空白，外部独立决定绑定版本；未修改 spec、plan 五件、constitution、根 AGENTS／README、两份 docs 入口、公开副本或基线，四文件 SHA 与 T009 执行开始快照一致（执行窗口内入口同样冻结）；`specs` 下只有 001 目录，无 002 产物与产品代码；不把 plan 检查写成 tasks 已执行完成
  - covers: FR-010, SC-006
  - result: `docs/temp/001-tasks-execution/T031-tasks-selfcheck.json`
  - tdd: 不适用：文档规划核对，无产品代码或行为变更

---

## 8. Phase 与 Stage 注册表映射

| Phase | 内容 | 任务 | G1 | G2 | G3 | G4 | G5 | G6 |
|---|---|---|---|---|---|---|---|---|
| Phase 1 Setup | 证据目录与输入基线 | T001–T004 | T001–T004 | — | — | — | — | — |
| Phase 2 Foundational | 输入、缺口、来源、保护状态 | T005–T009 | T005–T009 | — | — | — | — | — |
| Phase 3 US1 | 六模块职责与矩阵 | T010–T018 | — | T010–T017 | T018 | — | — | — |
| Phase 4 US2 | 来源、副本与公开边界 | T019–T021 | T019–T021 | — | — | — | — | — |
| Phase 5 US3 | 权威、切换、引导期、批准链 | T022–T025 | — | — | T022–T023 | T024 | — | T025 |
| Phase 6 US4 | 版本路线与 FR／SC 覆盖 | T026–T028 | — | — | — | T026 | T027–T028 | — |
| Phase 7 Polish | canonical、证据完整性、自检 | T029–T031 | — | — | — | — | T029 | T030–T031 |

阶段注册表与 Phase 的对应关系：G1→Phase 1／2／4；G2→Phase 3；G3→Phase 3／5；G4→Phase 5／6；G5→Phase 6／7；G6→Phase 5／7。每个 G 阶段至少有一个任务，且无任务不属于任何 Phase；表中每个任务只登记在其 `stage` 字段声明的单一 G 列。

## 9. 四用户故事独立验收条件

| 故事 | 独立验收条件 | 主任务 | 允许的最小前置 |
|---|---|---|---|
| US1 明确独立服务端需求（P1） | 六模块名称与 FR-005 一致；server／worker 职责分离；五个目录为空、server 未创建；6×11=66 项无空白；每类对象单一写权威 | T010–T018 | T005–T009（Phase 2） |
| US2 归档与授权摘录入基线（P1） | S01–S09 无缺项；四副本与两摘录登记；副本标注与哈希一致；canonical 等价 PASS；无私有地址、个人路径、真实标识或凭据；公开正文可独立阅读 | T019–T021 | T005–T009（Phase 2） |
| US3 制定可审核技术迁移计划（P2） | 权威、切换、失败、退出规则可核；引导期四要素齐全；退出仅依赖 002 验收与 `0.1.0` 发布批准；批准链与范围明确；无自动合并、关单或发布 | T022–T025 | T005–T009（Phase 2）；T025 另需 T001 批准记录 |
| US4 追踪全产品需求与版本路线（P2） | W01–W14 与 002–031 无缺项；FR-001–014 与 SC-001–007 有对应章节；未批准版本保持规划状态；001 身份与配置不变；无实现性断言 | T026–T028 | T005–T009（Phase 2） |

## 10. 依赖与执行顺序

### 10.1 Phase 依赖

- Phase 1（T001–T004）无前置，但必须整份 tasks 获批后才能开始；T001 先于同 Phase 其余任务。
- Phase 2（T005–T009）依赖 Phase 1 全部通过；任一失败或 `blocked` 时停止后续依赖任务。
- Phase 3–6（US1–US4）均依赖 Phase 2 全部通过；四个用户故事之间不建立任务级依赖，可按资源并行，也可按 P1 → P1 → P2 → P2 顺序执行。
- Phase 7（T029–T031）依赖全部用户故事与 Phase 2 的证据；T029 依赖 T018、T019–T025、T027、T028，T030 依赖 T029 与 T001–T029 的结果文件，T031 依赖 T030。

### 10.2 任务依赖

| 任务 | 直接依赖 |
|---|---|
| T001 | 无（另需外部独立执行批准记录） |
| T002、T003、T004 | T001 |
| T005–T009 | T002、T003、T004 |
| T010–T016 | T005、T006、T007、T008、T009 |
| T017 | T011–T016 |
| T018 | T010、T017 |
| T019–T024、T026 | T005–T009 |
| T025 | T001、T005–T009 |
| T027、T028 | T026 |
| T029 | T018、T019、T020、T021、T022、T023、T024、T025、T027、T028 |
| T030 | T029 及 T001–T029 结果文件 |
| T031 | T030 |

## 11. 并行机会

- Phase 1：T002、T003、T004 在 T001 后并行；结果文件分别为 T002／T003／T004，互不写入。
- Phase 2：T005–T009 并行，均依赖 T002、T003、T004；结果文件互斥。
- Phase 3：T010–T016 在 Phase 2 后并行（只读同一 contracts 文件的不同章节）；T017 汇总后 T018 串行。
- Phase 4：T019–T021 在 Phase 2 后并行（只读公开来源与副本头部；结果文件互斥）。
- Phase 5：T022–T025 在 Phase 2 后并行（分别读取不同章节与批准记录）；T025 另需 T001 的批准记录。
- Phase 6：T026 在 Phase 2 后执行；T027、T028 在 T026 后并行。
- Phase 7：T029 → T030 → T031 串行；T030 必须等待全部前置结果文件。

```powershell
# 示例：Phase 1 并行派发前确认目录已建立（T001 已完成）
Test-Path -LiteralPath 'docs/temp/001-tasks-execution'
# 示例：Phase 2 并行前确认输入 SHA 已通过（T002 结果为 pass）
(Get-Content -LiteralPath 'docs/temp/001-tasks-execution/T002-input-sha.json' -Raw | ConvertFrom-Json).conclusion
```

## 12. FR／SC 覆盖表

### 12.1 Functional Requirements

| 需求 | 主任务 | 说明 |
|---|---|---|
| FR-001 | T028 | 001 编号、路径与 Draft 状态保持 |
| FR-002 | T006、T025 | plan 输入与逐层批准链 |
| FR-003 | T004、T028 | 需求根、feature、相对链接与配置 |
| FR-004 | T008、T019 | 来源登记与可追溯 |
| FR-005 | T010、T018 | 六模块职责、空目录事实与权威边界 |
| FR-006 | T011–T017 | 每模块 11 项语义与 6×11 完整性 |
| FR-007 | T003、T007、T028 | 证据分级、无本仓代码、无已批选型断言 |
| FR-008 | T024 | 引导期方式、权限、验收、退出 |
| FR-009 | T018、T020、T021、T022 | 单一权威、副本处理、切换与退出 |
| FR-010 | T005、T009、T025、T031 | 无实现、无越权写入、无未授权执行 |
| FR-011 | T007、T021 | 私人资料保护与公开边界 |
| FR-012 | T023、T029、T030 | 验证与批准分离、证据字段、无自动动作 |
| FR-013 | T026 | W01–W14 与产品范围追踪 |
| FR-014 | T026 | 002–031 规划状态与版本引用 |

### 12.2 Success Criteria

| 成功标准 | 主任务 | 说明 |
|---|---|---|
| SC-001 | T008、T019 | 来源与副本登记缺项 0 |
| SC-002 | T011–T017 | 6 模块 × 11 项字段缺项 0 |
| SC-003 | T010、T018、T022 | 责任分离、单一权威、切换条件可核 |
| SC-004 | T024 | 引导期验收与退出条件缺项 0 |
| SC-005 | T008、T020、T021、T028 | 哈希、标注、边界与相对链接可核 |
| SC-006 | T002、T005、T025、T029、T030、T031 | 输入版本、approval 前置、无未授权迁移 |
| SC-007 | T026 | W01–W14 与 002–031 引用缺项 0 |

## 13. 完整 001 核对执行策略

- **本次范围**：T001–T031 共 31 项全部属于本轮 001 核对；按 Phase 1 → Phase 2 → 四个用户故事 → Phase 7 执行，不能只执行其中一部分就宣告 001 完成。
- **US1 checkpoint**：Phase 1 + Phase 2 + US1（T001–T018）完成后可按 US1 独立验收条件判定 US1；该判定不代表 US2／US3／US4 已完成，也不代表 001 已完成。
- **故事顺序**：US1、US2、US3、US4 在 Phase 2 后可并行，也可按 P1 → P1 → P2 → P2 顺序执行；每条故事分别保存本机结果，失败即停止受影响任务及其依赖。
- **收尾**：T029 只读复用 canonical；T030 核对全部结果文件；T031 核对本文件、写入面与执行窗口只读状态。
- **完成判定**：只有 31 项均有真实结果、失败与阻塞原样记录、主线程登记完成后，才能讨论本次 001 核对完成；文档检查不构成产品验收或治理获批。
- **禁止**：提前勾选任务、把 plan 检查写成 tasks 已执行、以文档检查替代产品验收、修改上层文档、创建 002 或产品代码、运行 build／lint／test／formatter／checker／git。

## 14. 编号与外部事项说明

- 本文 T001–T031 是 001 tasks 的内部编号。外部流程（015 相关）所指的根状态 T030／T031 与本文件 T030／T031 不是同一对象，也不构成本 tasks 的批准、执行或完成标志；根 AGENTS.md 与根 README.md 的状态更新仍待外部 T030／T031 处理，本 tasks 只读并记录现状。
- 作者送审时 31 项均未勾选；执行后的勾选状态由真实结果与主线程登记维护，执行代理保持本文件只读。
- 001 tasks 获批后才创建 002 spec；002 及其后续版本分别经自己的 spec → plan → tasks 批准。

## 15. 本 tasks 批准栏

| 字段 | 内容 |
|---|---|
| 批准人 | |
| 批准日期 | |
| 批准范围 | |
| 批准依据 | |

作者送审状态：本 tasks 待 HumanMiao 审批。批准栏四项保持空白；批准只引用已经存在的 HumanMiao 原始决定。该栏不等同于执行状态，执行批准由外部独立记录绑定具体版本；任务执行必须等待整份 tasks 获批，后续 002 另走 spec 批准。
