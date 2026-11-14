> **整理副本，改名映射见 docs/temp/mapping-pipeline-prd-202605.md，原文哈希 ad5eb53301745b99c547cefa8f4d6696b9d0a6599fea90b51059c195d7b13f82。**
>
> 本文件是历史需求与 PRD 的公开副本，按映射表改名并移除内部地址，其余字符逐行一致；历史审批与完成状态只记录当时情况，不构成后续工作批准。
>
> 导航：[公开来源清单](../sources/README.md)。

# [Pipeline-dev] AI 驱动研发管线 需求与 PRD

## 任务信息
- 所属项目：example-org · 研发管线（Pipeline）跨项目
- 日期：2026-08-02 UTC+8
- 编号：[Pipeline-dev]
- Context：战略分析「AI 驱动研发管线」落地，基于 旧端 Pipeline 服务 + Hermes + Git 管理研发需求与执行

## 更新
- 2026-08-03 完善 3.2 阶段实例化 / 3.3 图状渲染与权限校验 / 3.5 CI 对接 / 3.6 通讯协议与 CSV 格式 / 3.7 keep 流程 / 四 状态枚举与 PRD 存储 / 五 API 示例

- 二次更新：3.3 图状渲染改为**自研无限画布库**（P1-4 独立开发，为大规模高性能渲染做技术储备）

- 三次更新：**阶段信息全部移入 pipeline**（task meta 不再承载阶段），task↔pipeline 通过 `pipeline_task_rel` n:n 关联（3.2 / 3.4 / 五 / P0-4）

- 四次更新：**Gitea CI 作为管线阶段**（stage_type=ci），pipeline 推送后读取 CI 信息（3.5 / 4.3 / 五 / P1-3）

- 五次更新：**仓库关联 B 方案**（pipeline_main.repo/branch + pipeline_stages.repo/branch，支持跨仓库管线）+ **PRD 手动审批流程**（0→1→2 流转、提示用户审批、approve 接口）+ **runner 认证（Token+HMAC）** + schedule_log 枚举/清理 + API/示例/验证补全

- 六次更新：**审批接口对智能助手开放** —— Hermes 等通过 API/Tool 调用 approve（`pipeline approve` CLI 封装，其他 agent 复用同一 REST API），决策权仍在用户

- 七次更新：**认证升级为 JWT Bearer Token**（仅请求头不写 URI，绑定 runner_id + 签发 manager_id，支持分布式 manager 与微服务无状态验签，dev_runner 增加 token_issuer/token_expires_at）

- 八次更新：**Token 持久化与审计** —— 新建 `runner_token`（存 SHA-256 hash）+ `runner_token_audit`（生命周期审计）表，吊销即时/级联生效，配合 AccessLog 全链路可审计（3.6 / 4.10 / 4.11 / P0-1）

- 九次更新：**失败重试（默认 3 次 config 可调、超限暂停报告人工决策）+ 调度分配（同机多 Hermes session 并行、runner_id:session_id 目标、多机扩展）+ 发起方轮询状态模型（WS/Web API）+ 指令帧补 repo/branch/worktree_path（本地 runner 建 worktree）+ Gitea webhook 推送到 旧端 Pipeline 服务 + 权限矩阵/Recurring/verify 时机补全**

- 十次更新：**终审一致性修复** —— schedule_log 枚举补 stage_retry/stage_skip、状态码 5 补失败重试超限、3.3 前端补审批/失败报告交互、P0-2 补自动重试、新增 stage skip 端点与 WS 订阅端点（/pipeline/ws/subscribe）、3.1 补发起方角色、P1-1 补 worktree 创建

- 十一次更新：**第四次终审修复** —— P0-2/交付物补 legacy_pipeline_api.py pipeline CLI 扩展、3.5 补 push 登记 API（POST /pipeline/pipelines/:uuid/push）、3.7 补回滚后节点重置待执行、3.2 补审批中重复推送保持 1、4.1 补 Testing 触发条件、4.5 补 trigger_by、4.8 补 retry_of_job_id

- 十二次更新：**衔接逻辑修复** —— 新增「管线状态联动与完成流转」（最活跃阶段映射 + manager 驱动完成流转，检查所有节点完成 → 置 4）、P1-2 补 token 签发/刷新/吊销、P1-5 补审批/失败报告交互、4.4 补 edges 同 pipeline 校验、4.6/4.8 补逻辑外键注释、3.7 补 rollback 执行衔接、3.5 补 push 登记后 CI 阶段置 2

- 十三次更新：**对照 pm_api 结构对齐** —— pipeline_history 重构为「**pipeline id + stage type(entity_type) + stage ID(entity_id)**」定位（对齐 tasks_history modify_key=UUID 语义）、old/new 改 JSONB、新增 idx_ph_entity、版本独立性说明；3.5/webhook 端点补 **Gitea secret 签名鉴权**（X-Gitea-Signature，非 Bearer）；3.7 补 **PATCH 自动触发 change-check** 的提交入口

- 十四次更新：**按用户确认调整** —— 移除 `if_ext_git`（git 操作由 runner 开发时处理，不入审计）、验证方式补 webhook secret 验签与完成流转

- 十五次更新：**认证统一为 HMAC secret 体系** —— 用户调用 `POST /dev-runner/issue-secret` 签发 **secret_id + secret_key**（非 token），与 `legacy_pipeline_api.py` **同一体系管理**（同一套签发/吊销/续期逻辑）；`runner_token/runner_token_audit` 表重构为 `runner_secret/runner_secret_audit`（secret_key_hash + issued_by），端点 refresh/revoke-secret，WS/HTTP 全部改 HMAC 签名，微服务/多 agent 引用同步更新；stage_status 补子集说明

- 十六次更新：**深度扫描 12 项全修** —— ①与现有 auth 体系复用（SignatureAuth 中间件/错误码、runner_secret vs api_keys、issue-secret vs /auth/api-keys）；②webhook 端点加入鉴权白名单；③runner_secret FK 逻辑修复（issued_by 逻辑外键、runner_id 签发时可为空+register 回填+占位记录）；④指令下发双向认证（auth 模块级 secret）；⑤API 列表补 refresh/revoke-secret/sessions/ws/subscribe；⑥entity_type 注释命名修复；⑦4.7 注释残留清除；⑧token_issuer/expires_at 改名 secret_issuer/secret_expires_at；⑨权限矩阵补智能助手凭证+issue-secret 权限+3.3 runner/session 展示；⑩register 幂等；⑪config.csv 变量命名（RUNNER_SECRET_*）；⑫验证方式补 refresh/revoke/指令签名

## 目标

构建一条 **AI 驱动研发管线**：Hermes 根据系统与项目关联知识制定 PRD → 调用 Codex / superpower / autoPlan 流程开发 → 旧端 Pipeline 服务 管理管线状态与阶段 → 旧端界面前端可视化追踪。

---

## 一、核心理念与定位

> 工业革命的本质是人类生产力的跨越性发展，AI 革命需要对生产力的跨越性发展提供底层基座。

- **落地路径**：AI 驱动的研发管线 —— 基于 旧端 Pipeline 服务 与 Hermes、Git 进行需求管理。
- **分层定位**：
  - 底层支撑：需求管理 —— 研发部分的底层支持
  - 应用层面：量化系统设计与研发

---

## 二、总体架构

```mermaid
graph TD
    A[1. 创建管线流程<br/>创建 Pipeline] --> B[2. 需求与管线状态管理<br/>旧端 Pipeline 服务 · 阶段 meta · n:n 关联]
    B --> C[3. 生成并推送 PRD.md 到管线中<br/>Hermes 制定 PRD · 写入管线]
    C --> D[4. 开始 autoPlan 开发<br/>Codex / superpower · 阶段推进]
    D --> E[Dev Runner<br/>多 Hermes / SSH 执行]
    E --> B
    A --> F[返回 Pipeline 链接<br/>可跳转特定 pipeline]
    F --> G[前端 GUI 随时审阅<br/>旧端界面 · 登录 + Gitea 权限校验]
    G --> B
```

**数据流（按序）**：
1. **创建管线流程**：用户/Agent 创建 Pipeline（pipeline_main 记录）
2. **需求与管线状态管理**：旧端 Pipeline 服务 管理管线状态、阶段 meta（`{阶段1: xxx}`）、需求↔管线 n:n 关联
3. **生成并推送 PRD.md 到管线中**：Hermes 根据系统/项目知识制定 PRD，生成 `PRD.md` 推送到管线
4. **开始 autoPlan 开发**：Codex + superpower 流程执行，每阶段 Python 脚本验证，Dev Runner 远程执行

**前端审阅**：
- 创建管线流程后**返回一个 link**，可跳转到特定 pipeline
- 需要**登录 + 校验 Gitea 权限**，同时具有**旧端界面权限**
- GUI 随时审阅上述过程（管线创建 → 状态 → PRD → 开发进度 → 阶段状态）

---

## 三、核心需求

### 3.1 Hermes 驱动研发流程

- Hermes 根据**系统与项目关联知识**制定 PRD（需求文档）
- Hermes 调用 **Codex 与 lmtech skill 的 superpower 与 autoPlan 流程**进行开发
- 研发管线当前进度可支持**一个或多个 Hermes** 运行
- Hermes 作为**发起方（客户端）**：通过 `legacy_pipeline_api.py` 创建管线、推送 PRD、**轮询管线状态**（见 3.6「状态获取模型」），驱动各阶段执行
- 审批动作可由 Hermes 通过 tool 调用 approve（见 3.2「PRD 审批与状态流转」）

### 3.2 旧端 Pipeline 服务 管线状态管理

#### 阶段定义（全部在 pipeline）

> **阶段信息全部存储在 pipeline（pipeline_stages + pipeline_stage_edges）中，task meta 不再承载阶段信息**。task 仅作为需求实体，通过 `pipeline_task_rel` 与管线 n:n 关联。

- **阶段定义**（阶段名词/描述/验证脚本/依赖边/CI 绑定）全部存于 pipeline_stages / pipeline_stage_edges
- **task 不持有阶段**：task 的 meta 不再写入 `{阶段1: xxx}` 阶段定义，任务侧只保留需求本身（标题/描述/状态）
- **阶段描述与测试定义**写入关联 issue（Gitea Issue body），阶段通过 `issue_link` 指向
- **创建管线时直接定义阶段**：请求中传入 stages（或先建管线再通过 stages/edges API 逐步构建 DAG），无需从 task 导入

#### 需求 ↔ 管线 n:n 关联

> **每个 pipeline 可以对应多个 task 需求，每个 task 也可以对应多个 pipeline** —— 通过 `pipeline_task_rel` 表解耦关联。

| 关系 | 说明 | 示例 |
|------|------|------|
| 管线 → 多 task | 一个管线聚合多个需求任务（如「量化后端开发」管线关联 quant_api / user_api / sync_api 多个 task） | pipeline P1 → task T1, T2, T3 |
| task → 多管线 | 一个需求可被多个管线引用（如「Embedding-3 向量化」同时服务量化管线与知识库管线） | task T2 → pipeline P1, P2 |

- 关联**不传递阶段**：pipeline 的阶段只属于该 pipeline 自身，task 只是需求内容的引用来源（通过 task 关联的 issue 获取描述/测试定义）
- 同一 task 出现在多个管线时，各管线的阶段定义独立（互不影响各自的 DAG）
- 关联关系变更（增/删 task↔pipeline 绑定）计入 `pipeline_history` 审计（entity_type=rel）

#### 阶段图状结构（DAG）

- 阶段是**图状（DAG）结构**，不是简单线性列表：
  - 允许存在**前驱（predecessor）与后继（successor）**关系
  - 允许**独立节点**（无前驱/后继，可随时执行）
  - 用于管线系统管理**推断能否并行执行**：无依赖链的节点可并行，有前驱依赖的节点需等待前驱完成
- **管线本身也是图状管线**，前端需支持**图状渲染**（节点 + 连线）

#### 本地验证脚本

- 每个需求的各个阶段写一个 **Python 脚本** 本地验证与测试
- 脚本路径与执行方式记录在 issue / 阶段描述中
- 并行阶段可同时执行各自验证脚本
- **执行时机**：`stage_run` 完成时自动触发 verify（同一 job 链），或由 Hermes 显式下发 `verify` 指令

#### 子需求分解

- 需求太大时可分解为多个子需求
- 阶段的 `issue_link` 指向子需求 issue（链接到其它子需求的 issue）
- 形成父子需求 / 管线依赖网络（图状）

#### PRD 审批与状态流转（手动审批）

> **PRD 审批由用户决定**：Hermes 推送 PRD 后进入审批中状态，**系统提示用户审批**，批准后管线才开始开发。批准动作可通过**前端按钮**或**智能助手 API/Tool 调用**（Hermes 等）完成 —— 决策权在用户，但 approve 接口对各类智能助手开放，方便自动化审批链路。

```mermaid
flowchart LR
    A[0 待规划] -->|Hermes 推送 PRD| B[1 审批中]
    B -->|系统提示用户审批| C{用户审阅 PRD 全文}
    C -->|批准 approve| D[2 开发中<br/>启动阶段执行]
    C -->|驳回 reject| A
    A -->|Hermes 修改 PRD 重新推送| B
```

| 步骤 | 动作 | 说明 |
|------|------|------|
| ① | Hermes 推送 PRD | `POST /pipeline/pipelines/:uuid/prd` → 状态 0→1（审批中），写 history + schedule_log（prd_push） |
| ② | 系统提示用户审批 | 前端管线详情页展示「待审批」横幅 + PRD 全文审阅；Hermes/通知渠道提示用户 |
| ③ | 批准 | 用户在前端点「批准」按钮，或**智能助手（Hermes 等）通过 tool 调用** `POST /pipeline/pipelines/:uuid/approve` → 状态 1→2（开发中），可启动 ready 阶段 |
| ④ | 用户驳回 | `PATCH /pipeline/pipelines/:uuid`（status 回 0）→ Hermes 修改 PRD 重新推送（prd_version +0.0.1） |

- **审批人**：用户（旧端界面 GUI 批准）或**授权智能助手**（Hermes / Codex / 其他 agent 通过 API/tool 调用 approve，需持有有效凭证）
- **Tool 调用方式**：`legacy_pipeline_api.py pipeline approve <uuid>` 即 approve 接口的 CLI 封装，可注册为 Hermes Skill 的 tool，其他智能助手按同一 REST API 直接调用
- **审批动作全部审计**：approve / reject 写入 `pipeline_history`（entity_type=pipeline + entity_id=pipeline_id + modify_field=`status`）+ `pipeline_schedule_log`（event_type=prd_approve）
- **状态码 1=Approving 仅由「PRD 已推送未批准」触发**，无 PRD 的管线停留在 0 待规划
- **审批中重复推送**：状态 1（审批中）时再次推送 PRD 保持 1，版本递增（+0.0.1），不重置审批状态

#### 阶段失败处理与重试

> 阶段执行失败（CI failure / 验证失败 / runner 执行失败）→ stage_status=3（失败）。**自动重试，默认 3 次（config 可调）；超过上限暂停 pipeline，报告用户人工决策**。

```mermaid
flowchart TD
    A[阶段执行失败<br/>stage_status=3] --> B{重试次数 < max_retries?}
    B -->|是| C[自动重试<br/>重新派发执行<br/>schedule_log: stage_retry]
    C --> D{重试成功?}
    D -->|是| E[阶段完成 4<br/>后继可推进]
    D -->|否| B
    B -->|否 默认3次 config 可调| F[pipeline 暂停<br/>status=5 paused]
    F --> G[报告用户人工决策]
    G --> H{用户决策}
    H -->|修改后重跑| I[走 3.7 变更流程<br/>change-check 扫描 → 更新节点 → 重试该阶段]
    H -->|跳过该阶段| J[标记完成 4<br/>后继可推进]
    H -->|终止管线| K[status=6 cancelled]
```

- **重试配置**：`pipeline.retry.max_retries`（默认 3）、`pipeline.retry.backoff_sec`（默认指数退避 60s 起）；存于 旧端 Pipeline 服务 配置，可全局或按管线覆盖
- **超过上限**：pipeline 置 `paused`（5），通过前端/通知渠道报告用户人工决策
- **决策后更新**：按 3.7 变更管理的节点更新方式处理（discard/keep 语义一致），重试/跳过/终止均写 schedule_log（stage_retry / stage_skip / status_change）
- 重试次数记录在阶段（`pipeline_stages.retry_count`，见 4.3）与 dev_runner_jobs 历史中，可审计

#### 管线状态联动与完成流转

> **管线级状态由「当前最活跃阶段」映射**；**完成流转由管理 manager 驱动** —— manager 检查是否已抵达最后一个节点，若所有节点已完成，则流转至已完成状态。

**状态联动规则**（pipeline_main.status 随阶段状态变化）：

| pipeline 状态 | 触发条件 |
|:---:|------|
| 2 Developing | 存在阶段 stage_status=2（开发中） |
| 3 Testing | 存在 CI / 验证阶段运行中（stage_type=ci 或 verify 执行中） |
| 5 Paused | 任一暂停场景：失败重试超限 / 变更待处理（keep=manual）/ 用户暂停 |
| 4 Completed | **所有阶段均为已完成（4）或已跳过** |
| 6 Cancelled | 用户 / 决策终止 |

**完成流转（管理 manager 驱动）**：

1. manager 按轮询间隔检查管线（`GET /pipeline/pipelines/:uuid` 详情 / `topology`）
2. 判断**是否已抵达最后一个节点**：所有阶段 stage_status ∈ {4 已完成}（含 skip 标记完成的阶段）
3. 若全部完成 → 调 `PATCH /pipeline/pipelines/:uuid`（status=4）流转至已完成
4. 服务端写 schedule_log（event_type=status_change）+ history 审计

- 由 **manager 驱动**而非服务端自动：与「发起方轮询」模型一致（见 3.6 状态获取模型），manager 作为本地执行管理者在轮询时检查完成条件并推进
- Hermes（发起方）同样可检查并流转（`legacy_pipeline_api.py pipeline update <uuid> --status 4`）

### 3.3 旧端界面前端 · 研发管线界面

- 支持**按照项目、需求创建时间**进行分类或排序
- 支持返回**当前正在进行中的研发管线**和**已完成的管线**
- 需要 旧端 Pipeline 服务 返回 **JSON** 支持
- 一个页面同步所有阶段状态
- **创建管线流程后返回一个 link**，可跳转到特定 pipeline
- **权限校验**：跳转需**登录 + 校验 Gitea 权限**，同时具有**旧端界面权限**（双重校验）
- GUI 可随时审阅管线全流程：创建 → 状态 → PRD → 开发进度 → 阶段状态
- **审批交互**：管线详情页「待审批」横幅 + PRD 全文审阅 + 「批准 / 驳回」按钮（对接 3.2 PRD 审批）
- **失败重试报告**：阶段失败重试超限时展示报告面板（重试次数 / 失败原因 + 决策入口：修改重跑 / 跳过 / 终止，对接 3.2 失败处理）
- **runner/session 状态展示**：管线详情页展示执行 runner（在线 / 离线 / 忙碌）与 Hermes session 状态（对接 3.6 调度分配）
- **图状渲染**：管线与阶段以 **DAG 图**呈现（节点 + 前驱/后继连线），支持：
  - 独立节点 / 并行分支可视化
  - 按图推断并行执行路径
  - 阶段状态着色（完成/进行中/待执行/失败）

#### 图状渲染技术方案（自研无限画布库）

> **旧端界面前端（legacy_client，Flutter）自研「无限画布渲染库」**，不依赖第三方图渲染库。
> 目的：① 管线 DAG 图状渲染；② **为后续大规模高性能渲染开发做技术储备**（旧端界面行情图、拓扑监控、大规模流程图等）。

**为什么自研**：

| 方案 | 说明 | 选型 |
|------|------|:---:|
| **自研无限画布库**（CustomPaint + 视口变换） | 完全可控、按需扩展，沉淀大规模渲染能力 | ⭐ 首选 |
| graphview 等第三方库 | 满足小图但上限低（上百节点卡顿、定制布局/交互受限、引入依赖维护成本） | ❌ |
| 预渲染图片（svg/html） | 不适合交互式审阅 | ❌ |

#### 无限画布核心设计（渲染库层，legacy_client 内部独立库）

- **无限画布（Infinite Canvas）**：画布坐标**无边界**，仅通过**视口（Viewport）**展示当前可见区域
- **视口变换**：平移（pan）/ 缩放（zoom，建议 0.1x ~ 4x）/ 双击复位；逻辑坐标 ↔ 屏幕坐标经 Matrix4 映射
- **渲染裁剪（Culling）**：只绘制视口内的节点与边 → 上百节点的大规模 DAG 依然流畅（核心性能手段）
- **节点/边渲染**：CustomPaint 绘制阶段卡片 + 贝塞尔连线；节点状态着色（🟢 完成 / 🟡 进行中 / ⚪ 待执行 / 🔴 失败 / ⏸ 暂停）
- **交互**：节点点击 / 拖拽、连线 hover 高亮、框选、缩放手势（Pinch/滚轮）
- **虚拟化**：节点按视口范围分块索引（spatial partition），平移/缩放时增量加载可见块
- **复用性**：渲染库与管线业务解耦，提供通用「节点-边数据 → 无限画布」渲染接口，后续其他可视化场景直接复用

#### 管线界面接入（管线业务层）

- **布局**：调用 `/topology` 接口获取拓扑分层（levels），按层纵向排列，节点横向展开 → 层级布局天然契合 DAG
- **节点**：阶段卡片（阶段名 + 状态着色 + issue_link 入口 + 验证脚本标识），独立节点 / 并行分支加角标
- **变更提示交互**：change-check 返回受影响节点时，节点闪烁 + 弹窗「是否丢弃已完成开发？」（对接 3.7）
- **数据源**：单页面一次 `GET /pipeline/projects/:name/pipelines`（含 stages + edges + dev_runners），局部状态变更用 `PATCH` 后局部刷新，避免整图重建

#### 双重权限校验流程（Gitea + 旧端界面）

> pipeline link 跳转需**双重校验**：旧端界面登录权限 + Gitea 仓库访问权限。

```mermaid
sequenceDiagram
    participant U as 用户（前端）
    participant F as legacy_client（旧端界面）
    participant LS as 旧端 Pipeline 服务 后端
    participant G as Gitea API

    U->>F: ① 点击 pipeline link
    F->>F: ② 检查旧端界面登录态（Logto JWT）
    alt 未登录
        F-->>U: 跳转旧端界面登录页（Logto OAuth）
    else 已登录
        F->>LS: ③ GET /pipeline/pipelines/:uuid（携带旧端界面 JWT）
        LS->>LS: ④ 校验旧端界面 token 有效性（Logto JWT 验签）✅ 第一重
        LS->>G: ⑤ 用用户绑定的 Gitea 凭证<br/>GET /api/v1/repos/{owner}/{repo}
        alt Gitea 返回 200（有仓库读权限）
            LS-->>F: ⑥ 双重校验通过 → 返回 pipeline 详情（含 stages/edges/PRD）
        else Gitea 返回 403/404
            LS-->>F: 403 无 Gitea 仓库权限
        end
    end
```

- **旧端界面权限**：Logto OAuth 登录校验（现有 legacy_client 登录体系复用）
- **Gitea 权限**：旧端 Pipeline 服务 持有用户↔Gitea 凭证映射（OAuth 授权时绑定），用该凭证调 Gitea API 校验对应**项目仓库**读权限
- 任一重校验失败 → 403，前端展示无权限提示
- 后端统一代理：前端不直接持有 Gitea token，凭证不出 旧端 Pipeline 服务

**操作权限矩阵**：

| 操作 | 旧端界面登录 | Gitea 仓库权限 | 说明 |
|------|:---:|:---:|------|
| 查看管线详情 / 图状渲染 | ✅ | 读权限 | 双重校验（3.3 流程） |
| 创建管线 | ✅ | 对应项目写权限 | 前端 GUI 或 Hermes API |
| 推送 PRD / 推进阶段 | ✅ | 写权限 | Hermes 用 API 凭证 |
| 审批 approve / 驳回 | ✅ | 写权限 | 用户或授权智能助手 |
| 变更决策 discard / keep | ✅ | 写权限 | 见 3.7 |
| 删除 / 取消管线 | ✅ | 项目管理员 | 谨慎操作，审计记录 |

- **智能助手（Hermes 等）凭证**：通过 `legacy_pipeline_api.py`（HMAC 凭证，project=pipeline 或 pm）调用管线 API；Gitea 权限由**服务端代理**（服务端持有 Gitea 凭证），无需单独 Gitea 用户身份
- **issue-secret 权限**：签发 runner 凭证需**用户认证**（Logto / CLI HMAC）+ 对应 project 权限（pipeline）

### 3.4 数据模型 pipeline_main

- 管线数据表类似 `task_main`（参考 旧端 Pipeline 服务 现有四表架构）
- **需求 ↔ 管线 n:n**，各自独立：
  - 需求可以 link 到一个或多个管线
  - 管线也可以 link 到多个需求
- **task 与 pipeline 完全解耦**：
  - task 侧：不持有任何管线阶段信息（meta 无阶段定义），只保留需求本体
  - pipeline 侧：阶段定义（stages/edges）、PRD、状态全部自持，关联 task 仅通过 `pipeline_task_rel`（详见 4.2）
  - 删除管线不影响 task，删除 task 不影响管线阶段（仅解除关联）
- **仓库关联（B 方案：管线级默认 + 阶段级覆盖）**：
  - `pipeline_main.repo`：管线**默认开发仓库**（如 `example-org/legacy_observatory`），未指定阶段的开发/commit/worktree/回滚基于此仓库
  - `pipeline_stages.repo`：阶段级**覆盖仓库**（为空则继承管线默认）→ 支持**跨仓库管线**（前端阶段用 `legacy_client` 仓库、后端阶段用 `legacy_pipeline_service` 仓库，一个管线完成）
  - `pipeline_stages.branch`：阶段开发分支（为空则用仓库默认分支）
  - 3.7 变更管理的 commit / worktree / git 回滚按**各阶段的 repo + branch** 执行

### 3.5 Gitea CI 对接（CI 作为管线阶段）

> **CI 构建本身就是 pipeline 的一个阶段节点（stage_type=ci）**，与普通开发阶段同处 DAG；**pipeline 推送（push 代码）后读取 CI 信息**，同步 CI 阶段状态。

- **CI 即阶段**：阶段列表中的「CI 构建」节点，通过 Gitea Actions 执行并回传状态
- **普通阶段 vs CI 阶段**：普通阶段用本地验证脚本（verify_script）验证；CI 阶段用 Gitea Actions 构建验证
- 一个页面同步所有状态（构建成功/失败/进行中）即同步 CI 阶段节点的 stage_status

#### CI 阶段定义（pipeline_stages，stage_type=ci）

| 字段 | 说明 | 示例 |
|------|------|------|
| `stage_type` | 阶段类型：0=normal 普通 / 1=ci CI 构建阶段 | `1` |
| `ci_repo` | Gitea 仓库（owner/repo） | `example-org/legacy_observatory` |
| `ci_workflow` | workflow 文件路径 | `.gitea/workflows/lmo-api.yml` |
| `ci_job` | 目标 job 名 | `build-lmo-api` |
| `ci_run_id` | 最近一次关联构建 run id（推送后回填） | `123456` |

- CI 阶段是 DAG 中的**普通节点**：同样有前驱/后继、参与拓扑排序与并行推断、受 3.7 变更管理约束
- 典型位置：开发阶段之后（阶段3 开发 → 阶段4 CI 构建 → 阶段5 部署）
- **同一管线可有多个 CI 阶段**（如各开发阶段后各配一个构建），各自独立 run_id 与状态

#### 状态同步机制（pipeline 推送后读取 CI 信息）

```mermaid
sequenceDiagram
    participant H as Hermes（开发阶段）
    participant P as pipeline
    participant LS as 旧端 Pipeline 服务
    participant G as Gitea Actions API
    participant R as Gitea Runner

    H->>P: ① 开发阶段完成，push 代码到 Gitea
    P->>LS: ② pipeline 推送事件（登记推送，CI 阶段进入等待）
    R-->>G: ③ push 触发 Gitea Actions 构建
    G-->>LS: ④ 构建事件推送（webhook：run_id + 状态）
    LS->>LS: ⑤ 回填 ci_run_id → 定位 CI 阶段节点（stage_type=ci）
    LS->>G: ⑥ 读取 CI run 状态<br/>GET /api/v1/repos/{owner}/{repo}/actions/runs/{run_id}
    G-->>LS: ⑦ 返回构建状态（queued/running/success/failure）
    LS->>P: ⑧ 状态映射 → CI 阶段 stage_status + 写 schedule_log（ci_build）
    P-->>H: ⑨ CI 通过 → 后继阶段可推进；失败 → 标记需处理
```

- **pipeline 推送登记**：开发阶段完成 push 后，由 Hermes 调 `POST /pipeline/pipelines/:uuid/push` 登记（或由 Gitea push webhook 自动触发登记），服务端写 schedule_log + 回填 ci_run_id，**CI 阶段置 stage_status=2（等待构建）**
- **Gitea webhook 推送**：Gitea Actions/Push 事件 → **webhook 推送到 旧端 Pipeline 服务**（`POST /pipeline/webhooks/gitea`，见五、API）；旧端 Pipeline 服务 是接收方，处理后更新 CI 阶段
  - **webhook 鉴权**（与 runner HMAC secret 区分）：Gitea 侧配置 **webhook secret**，请求携带 `X-Gitea-Delivery`（事件 ID）+ `X-Gitea-Signature`（HMAC-SHA256(secret, body)）；旧端 Pipeline 服务 验签通过才处理，失败返回 401（不使用 runner 凭证，因调用方是 Gitea 非用户/runner）；**该端点在鉴权中间件白名单中**（跳过 SignatureAuth，见 3.6）
- **客户端轮询**：发起方（Hermes/前端）**定期轮询 旧端 Pipeline 服务** 获取管线状态（见 3.6「状态获取模型」），不依赖 Gitea 直接通知发起方
- **读取方式**：旧端 Pipeline 服务 主动查询 Gitea API 兜底（`GET /api/v1/repos/{owner}/{repo}/actions/runs/{run_id}`）
- **状态映射**：CI queued/running → stage_status=2（开发中）；CI success → stage_status=4（已完成，后继可推进）；CI failure → stage_status=3（失败，标记需处理）
- 构建状态变化写入 `pipeline_schedule_log`（event_type=ci_build），前端在 CI 阶段节点上同步展示

### 3.6 Dev Runner / Manager（多环境执行与管理）

> **独立项目**：`legacy_worker`（**Go 项目**，与 旧端 Pipeline 服务 开发语言一致，独立仓库/目录开发），作为研发管线的执行器端与管理端。

- 项目可能分布在**多个 SSH 或开发环境**中
- 支持指定某一个 **Hermes 或 SSH 链接**
- 推送和返回可通过 **旧端 Pipeline 服务 和 dev runner(client)** 执行
- 类似 Gitea CI 的执行器（runner）模式

#### 双角色设计：Runner 与 Manager

> **pm 模块在 旧端 Pipeline 服务 中是整体**：管线/任务/阶段/需求/pm 相关逻辑（**含 pipeline 模块**）属于 旧端 Pipeline 服务 整体，**不能单独分离出 hermes manager，pipeline 模块同样不分离**。manager 是 旧端 Pipeline 服务 的客户端/执行端角色，负责本机 Hermes session 管理与执行，pm + pipeline 业务逻辑仍由 旧端 Pipeline 服务 承载。

**同一个程序（legacy_worker），两种运行模式**：

| 模式 | 职责 | 运行位置 | 数据存储 |
|------|------|---------|---------|
| **runner** | 远程执行器：主动连接 旧端 Pipeline 服务，接收指令，执行阶段/验证/回滚 | 各 SSH/开发环境 | **本地 CSV（最小化）**：config / state 快照 / jobs 日志；业务数据实时查服务端 |
| **manager** | 本地管理器：管理本机多个 Hermes session + 本地执行状态（state/jobs），后台启动/停止/监控多个实例 | 单机本地 | **本地 CSV（本地版：state/jobs/sessions）** / **PostgreSQL（服务器版：集中数据）** |

- **单个 runner 也可作为 manager**：管理本机上的多个 Hermes session，能够在后台启动多个
- **manager 可单机运行**：作为本地管理工具独立使用，不依赖远端调度
- **服务端 manager 与客户端共用一致代码**：同一份代码功能，只区分 `runner` / `manager` 运行模式（通过启动参数 / 配置文件切换）
- **pm 职责边界**：manager 本地版**同样记录 state 与 jobs**（本地执行状态完整可见），但管线/需求等 pm 业务数据（**含 pipeline 模块**）的**权威源仍是 旧端 Pipeline 服务**——manager 不替代 pm 模块，只是执行端 + 本地状态管理

#### 数据存储设计

> **核心原则：本地最小化，服务端权威化**。runner/manager 本地**不存 pm 业务权威数据**（管线/需求/任务权威源在 旧端 Pipeline 服务 PG），但**执行端状态（state）与执行记录（jobs）在本地完整记录**（CSV 或 PG），避免多端双写业务数据，同时保证本地可审计、可排查。

**按模式的数据分布**：

```mermaid
graph LR
    subgraph 服务端 旧端 Pipeline 服务 PG
        A[pm 权威数据<br/>pipeline / stages / edges / task<br/>dev_runner 注册表 / 调度日志]
    end
    subgraph runner 本地 CSV
        B[执行端状态<br/>config / state 快照 / jobs 日志<br/>（业务数据实时查服务端）]
    end
    subgraph manager 本地版 CSV
        C[执行端状态<br/>config / state / jobs / sessions.csv<br/>（进程管理 + 本地执行状态）]
    end
    subgraph manager 服务器版 PG
        D[集中数据<br/>state / jobs / sessions / 多 manager 协同]
    end
    A <--> B
    A <--> C
    A <--> D
```

| 数据类别 | runner 本地 CSV | manager 本地版 CSV | manager 服务器版 PG | 服务端 旧端 Pipeline 服务 PG |
|---------|:---:|:---:|:---:|:---:|
| **pm 业务数据（管线/阶段/需求/task）** | ❌（不存，查服务端） | ❌（不存，查服务端） | ❌（查服务端） | ✅ **权威** |
| **runner/manager 注册表** | ❌ | ❌ | ✅ | ✅ 权威 |
| **state（执行状态快照）** | ✅ 快照 | ✅ 快照 | ✅ 完整 | ✅ 权威（调度侧） |
| **jobs（执行记录）** | ✅ 日志 | ✅ 日志 | ✅ 完整 | ✅ 权威（调度侧） |
| **Hermes session** | ❌（manager 才管） | ✅ 进程状态（pid/日志） | ✅ 完整 | ✅ 注册/状态上报 |
| **本地配置** | ✅ config.csv | ✅ config.csv | ✅ config | ❌（本地私密） |
| **导入导出** | ✅ 可迁移 | ✅ 可迁移 | ✅ 可导出 | ✅ 可导出 |

**三种模式数据分布详解**：

**① runner 模式（本地 CSV 执行端状态）**
- 本地存：`config.csv`（连接配置/凭证引用）、`state.csv`（执行状态快照）、`jobs.csv`（执行记录日志，便于本地排查）
- **不存** pm 业务数据（管线/需求/阶段）—— 全部实时查 旧端 Pipeline 服务
- 性价比：本地只存执行端状态，业务权威数据在服务端

**② manager 本地版（本地 CSV 完整执行状态）**
- 本地存：`state.csv`（**执行状态快照**）、`jobs.csv`（**执行记录**）、`sessions.csv`（**Hermes session 进程管理**：pid / log_path / image / 状态）、`config.csv`
- **同样完整记录 state 与 jobs**：manager 单机运行时本地执行状态完整可见、可审计、可排查
- **pm 业务数据（管线/需求）仍不本地存** —— 从 旧端 Pipeline 服务 查询（pm 模块在 旧端 Pipeline 服务 是整体，manager 不承担 pm 权威存储）
- CSV 便于：session 进程信息本地可查、配置导出备份、整体迁移

**③ manager 服务器版（PostgreSQL 集中数据）**
- state / jobs / sessions / runner 状态全存 PG（可独立库或与 旧端 Pipeline 服务 同库）
- 支持多 manager 实例共享、集中查询、备份恢复
- pm 业务数据仍以 旧端 Pipeline 服务 为权威源，manager 服务器版存储的是执行端数据

**存储抽象（代码层）**：
- legacy_worker 内置存储接口：`CSVStore`（本地）/ `PGStore`（服务器版）
- runner/manager 共用同一套逻辑，仅注入不同存储后端
- CSV 写本地，PG 写集中库，业务层无感知
- **pm 模块不分离**：执行端只存 state/jobs/sessions 等执行数据，pm 业务逻辑与权威数据（**含 pipeline 模块**）始终在 旧端 Pipeline 服务

#### 本地 CSV 格式定义

> 存储目录：`~/.legacy_worker/`（runner 与 manager 本地版共用，按实体分文件）。CSV 首行为表头，UTF-8 编码。

**config.csv（本地配置，runner/manager 共用）**

```csv
key,value,updated_at
server_url,example.org,2026-08-03T00:00:00Z
runner_name,hermes-dev,2026-08-03T00:00:00Z
mode,runner,2026-08-03T00:00:00Z
auth_token_ref,.env:DEV_RUNNER_TOKEN,2026-08-03T00:00:00Z
poll_interval_sec,30,2026-08-03T00:00:00Z
```

**state.csv（执行状态快照，断线恢复）**

```csv
pipeline_id,stage_id,stage_status,last_event,updated_at
019f4a6b-...,s1,4,stage_done,2026-08-03T00:00:00Z
019f4a6b-...,s2,2,stage_run,2026-08-03T00:00:00Z
019f4a6b-...,s3,0,pending,2026-08-03T00:00:00Z
```

**jobs.csv（执行记录日志，短期保留）**

```csv
job_id,job_type,stage_id,status,output_ref,trigger_by,created_at,finished_at
019f...-job1,stage_run,s2,success,jobs/job1/stdout.log,hermes,2026-08-03T00:00:00Z,2026-08-03T01:00:00Z
019f...-job2,verify,s3,failed,jobs/job2/stdout.log,hermes,2026-08-03T02:00:00Z,2026-08-03T02:10:00Z
```

**sessions.csv（Hermes session 进程管理，仅 manager 本地版）**

```csv
session_id,session_name,session_status,project_name,image_name,pid,log_path,started_at,updated_at
019f...-sess1,hermes-dev-1,running,legacy_observatory,,45231,/var/log/hermes-dev-1.log,2026-08-03T00:00:00Z,2026-08-03T01:00:00Z
019f...-sess2,hermes-ops,idle,,lmo-hermes:latest,45289,/var/log/hermes-ops.log,2026-08-03T00:30:00Z,2026-08-03T01:00:00Z
```

- `auth_token_ref` 只存**凭证引用**（环境变量/文件路径），不存明文 token
- jobs.csv 为**短期日志**：默认保留 7 天 / 1000 条，滚动清理；完整记录以服务端 `dev_runner_jobs` 为权威
- 断线恢复：重启时读取 state.csv → 上报 heartbeat → 服务端比对未确认 job

#### 实现语言与运行形态

- **使用 Go 开发**（项目名：`legacy_worker`），与 旧端 Pipeline 服务（go-zero）语言一致
- **后台常驻运行**（daemon/background），可持续接收指令
- **主动连接服务器**（outbound connection，无需公网端口暴露），连接 旧端 Pipeline 服务 等候指令
- **控制 Hermes 调用**：runner/manager 收到指令后，可调用/调度 Hermes Agent 执行任务
- **Hermes session 管理**（manager 模式）：可管理本机多个 Hermes session，后台启动多个实例
- **启动方式**（CLI 示例）：
  ```bash
  legacy-worker --mode runner --config ~/.legacy_worker/config.csv        # runner 模式
  legacy-worker --mode manager --config ~/.legacy_worker/config.csv       # manager 本地版（CSV）
  legacy-worker --mode manager --db postgres://user:pass@host/legacy_pipeline       # manager 服务器版（PG）
  ```

#### 主动连接模型（类似 Gitea CI Runner）

```mermaid
sequenceDiagram
    participant DR as legacy_worker (Go daemon)<br/>runner / manager 双模式
    participant LS as 旧端 Pipeline 服务
    participant H as Hermes Agent (本机多 session)

    DR->>LS: ① 启动后主动连接（register / 长连接）
    LS-->>DR: ② 注册成功，进入等候指令状态
    LS->>DR: ③ 推送任务指令（stage 执行 / PRD 推送 / 验证脚本）
    DR->>H: ④ 调度 Hermes 执行（本地多 session / SSH / 容器）
    H-->>DR: ⑤ 执行结果返回
    DR->>LS: ⑥ 回传结果（成功/失败 + 输出）
    LS-->>DR: ⑦ 下一条指令 / 空闲等待
```

- **Runner 主动连接**：无需在开发环境开放入站端口，由 runner 发起出站长连接/轮询
- **旧端 Pipeline 服务 作为调度中心**：持有 runner 注册表，按管线调度派发指令
- **多 Runner 注册**：每个 SSH/开发环境运行一个 runner，注册时上报环境信息（hostname、路径、可用 Hermes）

#### 通讯协议（传输层）

> **WebSocket 长连接为主，HTTP 轮询兜底** —— 兼顾服务端主动下发的低延迟与弱网环境的可靠性。

```mermaid
sequenceDiagram
    participant DR as legacy_worker
    participant LS as 旧端 Pipeline 服务

    DR->>LS: ① POST /dev-runner/register（上报环境信息，获得 runner_id）
    DR->>LS: ② 升级 WebSocket：GET /dev-runner/:id/ws
    LS-->>DR: ③ WS 建立成功，进入长连接监听
    Note over DR,LS: 正常链路：服务端通过 WS 主动推送指令帧<br/>runner 执行后通过 WS 回传结果
    DR->>LS: ④ 心跳：WS ping/pong 每 30s（异常时 HTTP heartbeat 每 60s）
    Note over DR,LS: 断线兜底：WS 断开 → runner 自动切换 HTTP 轮询<br/>GET /dev-runner/:id/jobs?pending=1（30s 间隔）
```

| 传输方式 | 用途 | 说明 |
|---------|------|------|
| **WebSocket 长连接**（首选） | 指令下发 / 结果回传 | 服务端可实时推送指令，双向低延迟 |
| **HTTP 轮询**（兜底） | 指令拉取 / 心跳 | WS 断线时自动降级：`GET /dev-runner/:id/jobs?pending=1`，30s 间隔 |
| **HTTP 上报** | 结果 / 心跳上报 | `POST /dev-runner/:id/jobs/:job_id/report`、`POST /dev-runner/:id/heartbeat` |

- **指令帧格式**（WS 消息 / 轮询响应统一）：

```json
{
  "job_id": "019f...",
  "job_type": "stage_run",
  "target": "hermes-dev:hermes-dev-1",   // 执行目标：runner_id:session_id（调度分配策略见下）
  "payload": {
    "pipeline_id": "019f...",
    "stage_id": "s2",
    "repo": "example-org/legacy_observatory",  // 执行仓库（继承阶段/管线默认）
    "branch": "main",                           // 执行分支（阶段 branch 或仓库默认）
    "worktree_path": "",                        // 本地 worktree 路径（runner 创建后写入并回传）
    "command": "hermes run ...",
    "timeout_sec": 3600
  }
}
```

- **worktree 创建由本地 runner/manager 处理**：收到 `stage_run` 后，在本地按 `repo + branch` 创建 worktree（`git -C <repo> worktree add <path> <branch>`），将路径填入 `worktree_path` 并回传；执行完成后可保留（供审计/回滚）或按配置清理
- **执行目标**：`target` 字段由 旧端 Pipeline 服务 调度时按 3.6「调度分配策略」填入（同机 session 优先 / 多机扩展）

- **回传格式**（结果统一）：

```json
{
  "job_id": "019f...",
  "status": "success",           // success / failed / timeout（timeout 归为 failed，触发重试机制）
  "exit_code": 0,
  "output": "...",               // 执行输出（截断后）
  "output_ref": "jobs/019f.../stdout.log",  // 完整日志引用
  "finished_at": "2026-08-03T00:00:00Z"
}
```

- **断线恢复**：runner 重连后先 `POST /dev-runner/:id/heartbeat` 上报本地 state.csv 快照，服务端比对未确认的 job，决定重发或标记中断

#### 状态获取模型（发起方轮询）

> **pipeline 的发起方（Hermes / 前端）定期调用 WS 或 Web API 轮询管线状态**；旧端 Pipeline 服务 不主动向发起方推送（除 runner 长连接场景）。

- **Web API 轮询**：`GET /pipeline/pipelines/:uuid`（详情）/ `GET /pipeline/pipelines/:uuid/topology`（拓扑），间隔可配（默认 30s~60s，`pipeline.poll.interval_sec`）
- **WS 订阅（可选）**：发起方维持 WS 长连接（`GET /pipeline/ws/subscribe`，HMAC secret 鉴权）订阅状态变更，服务端在状态变化时推送轻量通知，降低轮询开销；与 runner 长连接（`/dev-runner/:id/ws`）相互独立
- **流转驱动**：pipeline 状态流转全部通过 API 调取/推进（PATCH status / approve / stages 更新），发起方轮询到新状态后驱动下一步
- 适用：Hermes 开发循环（轮询阶段状态 → 执行 → 回传）、前端 GUI 自动刷新

#### 认证与安全（runner ↔ 旧端 Pipeline 服务）

> **统一使用 HMAC secret 体系（与 legacy_pipeline_api.py 完全一致）**：runner/manager 通过 **secret_id + secret_key** 做 HMAC 签名访问 API；凭证**仅放请求头，不写 URI**（避免泄露到 URL / 访问日志 / 代理缓存）。
> 由 旧端 Pipeline 服务 auth 模块**统一签发与管理**，一套 secret 体系同时服务 CLI 与 runner，天然适配分布式 manager 与微服务。

**凭证设计（secret_id + secret_key）**：

| 字段 | 说明 |
|------|------|
| `secret_id` | 凭证标识（明文，请求头携带，用于识别身份） |
| `secret_key` | 签名密钥（仅签发时返回一次，HMAC-SHA256 签名用） |
| `runner_id` | 绑定的 runner（只能在对应 runner 的 API 上生效） |
| `issued_by` | 签发者（用户 / manager，溯源） |
| `scope` | 权限范围（dispatch / heartbeat / jobs / refresh） |
| `expires_at` | 过期时间（默认 24h，可续期） |

- **签名方式**：与 `legacy_pipeline_api.py` **同一体系** —— 请求头携带 secret_id + HMAC 签名（secret_key 派生 + timestamp 防重放），auth 模块统一验签
- **绑定与溯源**：签发时**绑定 runner_id + 签发者** —— 只能在对应 runner 的 API 上生效；任何操作可溯源到「谁签发的」

**分布式 manager / 微服务适配**：

| 场景 | 方案 |
|------|------|
| **分布式 manager（多实例）** | 所有 manager 实例共享同一 HMAC secret 签发体系（或统一向 auth 服务申请），任一实例签发的凭证可被**其他 manager 实例与所有服务**校验 → 多实例部署、滚动重启、故障切换无感知 |
| **微服务架构** | pipeline / dev-runner / auth 等微服务共用同一 HMAC secret 验签能力（auth 模块统一管理），**无状态验签**，无需中心化会话存储；符合 go-zero 微服务体系（中间件统一校验 HMAC） |
| **多 agent 调用** | 其他智能助手（Codex 等）复用同一 HMAC secret 体系：按 runner 身份签发，scope 限权 |

**各环节鉴权**：

| 环节 | 鉴权方式 |
|------|---------|
| **register（首次）** | 请求头携带 `secret_id` + HMAC 签名（**由用户调用签发 API 发放**，见下）→ 注册成功后绑定 runner_id |
| **WebSocket 升级** | **握手请求头携带 HMAC 签名**（secret_id + 签名头；WebSocket 握手即 HTTP 请求，头可校验；**不使用 URI query**，避免凭证进入 URL/日志） |
| **HTTP 轮询/上报** | 每次请求 HMAC 签名（secret_id + secret_key 派生 + timestamp 防重放） |
| **指令下发** | 旧端 Pipeline 服务 → runner 的指令帧带服务端签名，runner 验签后执行 |

> **指令下发双向认证**：服务端只存 runner 的 `secret_key_hash`（无法用 runner 的 key 签名），故指令帧由服务端用 **auth 模块级 HMAC secret**（服务端自有凭证）签名；runner 预置同一 auth secret 验签——请求方向用 runner 凭证、下发方向用 auth 凭证，双向互验。

**Secret 签发（用户调用 API）**：

- **secret_id + secret_key 由用户调用签发 API**生成：`POST /dev-runner/issue-secret`（用户先通过 旧端 Pipeline 服务 认证——Logto 登录态 / CLI HMAC 凭证），请求指定 `runner_name` + `scope` → 服务端生成 **secret_id + secret_key**（key 仅此一次返回），写入目标环境 `config.csv` 的 `auth_token_ref`（引用 .env）分发
- runner 用 secret_id + secret_key 做 HMAC 签名访问 API（与 legacy_pipeline_api.py **同一体系**），register 成功后绑定 runner_id
- **签发时 runner 未注册**：issue-secret 时若 runner 尚未注册，服务端先创建 dev_runner 占位记录（status=0 offline，按 runner_name），或 runner_secret.runner_id 暂空；runner 首次 register 按 runner_name 匹配并回填 runner_id
- **register 幂等**：按 `runner_name` 幂等——已存在则更新 status / env_info / heartbeat，不重复创建（重启 / 重连安全）
- 凭证持久化：secret_key 只存 **SHA-256 hash**（`runner_secret` 表，见 4.10），吊销 / 级联 / 审计同一体系（见 4.10/4.11）
- **同一体系管理**：runner 凭证与 CLI 凭证由 auth 模块**同一套管理逻辑**（签发 / 吊销 / 续期），一套密钥体系两处使用

**与现有 auth 体系复用**：

| 现有体系（旧端 Pipeline 服务） | 复用方式 |
|------|---------|
| **SignatureAuth 中间件**（`internal/middleware/signature_auth.go`） | runner 凭证验签**复用同一中间件**：无认证头→401 `authentication required` / HMAC 缺字段→401 `incomplete HMAC headers` / secret_id 无效→403 `invalid or revoked secret_id` / 签名不匹配→403 `signature mismatch`（与 CLI / 用户 API key 完全一致的错误码语义） |
| **api_keys 表**（secret_id / secret_key_hash / project=`*`/`pm`/`quant` / active） | `runner_secret` 为**独立表**（runner 场景需 runner_id / scope / issued_by），但**复用同一套签发 / 吊销 / 验签逻辑**；隐含 project=pipeline 数据范围 |
| **POST /auth/api-keys**（用户 Bearer 认证后创建 API key） | `POST /dev-runner/issue-secret` **复用同一签发模式**：用户认证后调用，服务端生成 secret_id + secret_key 并落库 |

- **白名单**：`POST /pipeline/webhooks/gitea` 加入鉴权中间件**白名单**（与 /auth/login、/auth/callback、/auth/api-keys、/db/init 同级），跳过 SignatureAuth，由 Gitea secret 专用验签处理

**Secret 生命周期**：

- 短期有效（默认 24h），到期用 `POST /dev-runner/:id/refresh-secret`（携带当前有效凭证）换发新 secret
- 吊销：`POST /dev-runner/:id/revoke-secret` → 该 runner_id 绑定的 secret 全部失效；**吊销签发者时级联吊销其签发的所有 runner secret**
- **凭证管理**：runner 侧 secret 存于 `config.csv` 的 `auth_token_ref`（引用 `.env` 的 `RUNNER_SECRET_ID` / `RUNNER_SECRET_KEY`，与 CLI 的 `LEGACY_PIPELINE_*` 区分，不存明文）；服务端在 dev_runner 注册记录中存 `secret_issuer` + `secret_expires_at`（见 4.7）
- **最小权限**：scope 限定能力（如只读 runner 只能 heartbeat/jobs，不能 dispatch）

**Secret 存储（数据库持久化）**：

- 所有签发的 secret 均**持久化到数据库**（`runner_secret` 表，见 4.10），不依赖内存/会话存储
- 存储**哈希**而非明文：`secret_key_hash = SHA-256(secret_key)`，原始 key 只在签发响应中返回一次
- 用途：① 签发记录 + 吊销状态管理（即时吊销 / 级联吊销）；② 有效凭证列表查询；③ 审计溯源
- 校验路径：HMAC 验签（secret_id 定位 + secret_key_hash 验签）；**即时吊销校验**查 `runner_secret.status`（配置 `enforce_revocation=true` 时吊销立即生效，不等 exp）

**Secret 审计（日志）**：

- 凭证生命周期事件全部写入 **`runner_secret_audit` 审计日志**（见 4.11）：`issue / refresh / revoke / expire / rotate`
- 审计字段：secret_id、runner_id、issued_by、event_type、actor（runner / manager / user / system）、detail、timestamp
- 配合 旧端 Pipeline 服务 现有 **AccessLog 中间件**（`[ACCESS]` 日志记录请求身份），形成「**签发 → 使用 → 吊销**」全链路可审计
- 每次签发 / 吊销同步更新 `dev_runner.secret_issuer` / `secret_expires_at`（当前生效凭证快照）

#### Hermes 调用控制（runner/manager 共用）

- Runner/Manager 可**控制 Hermes 调用**：指定目标 Hermes 实例（本地进程 / SSH 远端 / 容器）
- 支持调用方式：
  - 本地子进程（`hermes` CLI）
  - **本机多 session 管理**（manager 模式：后台启动多个 Hermes session，各自独立）
  - SSH 远端执行（`ssh user@host hermes ...`）
  - 容器内执行（Docker / Hermes image）
- 执行超时、重试、日志采集由 runner/manager 负责

#### Hermes Session 管理（manager 模式）

- **管理本机多个 Hermes session**：可查看、启动、停止、重启多个 session
- **后台启动多个**：支持在后台并行拉起多个 Hermes 实例（不同项目 / 不同上下文）
- session 状态监控：运行中 / 空闲 / 停止 / 异常，上报给 旧端 Pipeline 服务 或本地展示

#### Hermes Image 封装与执行

- **计划用于 Hermes image 封装与执行**：将 Hermes 环境封装为镜像（含 lmtech skill、Codex、依赖）
- Runner/Manager 从镜像拉起 Hermes 执行环境，隔离不同项目的开发上下文
- 镜像化优势：环境一致、可复用、并行多实例互不干扰
- **镜像命名规范**：基础镜像 `lmo-hermes:base`（Hermes + lmtech skill + Codex + 常用依赖）；项目镜像 `lmo-hermes:<project>`（如 `lmo-hermes:legacy_observatory`，叠加项目上下文）；session 的 `image_name` 字段记录实际使用镜像

#### 指令类型（runner/manager 接收）

| 指令 | 说明 |
|------|------|
| `stage_run` | 执行某管线阶段（调用 Hermes + 验证脚本） |
| `prd_push` | 推送/拉取 PRD.md |
| `verify` | 运行本地 Python 验证脚本 |
| `rollback` | 执行 git 回滚（变更管理） |
| `session_start` | 后台启动 Hermes session（manager 模式） |
| `session_stop` | 停止 Hermes session |
| `session_list` | 列出本机 Hermes sessions |
| `status` | 上报 runner/环境/session 状态 |

#### Dev Runner API（旧端 Pipeline 服务 侧，供 runner/manager 调用）

```json
// POST /dev-runner/issue-secret      → 用户调用签发 secret_id + secret_key（runner 首次注册凭证，认证后调用）
// POST /dev-runner/register        → runner/manager 注册（上报环境信息）
// GET  /dev-runner/list            → 查看已注册 runner/manager
// POST /dev-runner/:id/dispatch    → 向指定 runner/manager 派发指令
// GET  /dev-runner/:id/jobs        → 查询任务历史
// POST /dev-runner/:id/heartbeat   → 心跳/状态上报（含 session 状态）
```

#### 调度分配策略（并行阶段执行目标）

> **默认派发给同一机器的 runner**（manager 模式启动多个 Hermes session 并行执行）；**支持多机 Hermes**，执行目标用 **`runner_id:session_id`** 形式精确定位。

- **执行目标标识**：`runner_id:session_id`（如 `hermes-dev:hermes-dev-1`、`ssh-10:hermes-ops`）—— 定位到「哪台机器的哪个 Hermes session」
- **默认策略（同机并行）**：并行阶段优先派发给**同一 runner/manager**，由 manager 在本地启动**多个 Hermes session** 并行执行 → 避免跨机网络开销，本地资源利用率高
- **多机扩展**：当单机 session 不足、或阶段需要特定环境（不同 repo/镜像）时，派发给其他机器的 runner（多机 Hermes 分布执行）
- **分配规则**：
  1. 优先：同机 runner 的空闲 session（并行度高）
  2. 其次：环境匹配（阶段 repo 在本机存在 / Hermes image 匹配）的其它 runner
  3. 无可用 runner/session：任务排队等待（job_status=0 queued）
- **执行目标记录**：派发时写入 dev_runner_jobs（`runner_id` + `session_id`），可审计

#### 项目归属

| 部分 | 项目 |
|------|------|
| **legacy_worker**（Go daemon：runner/manager 双模式 + 主动连接 + 指令循环 + Hermes 调用控制 + Hermes session 管理 + Hermes image 封装 + CSV/PG 存储抽象） | 独立项目 |
| **pm 模块（管线/任务/阶段/需求 + pipeline 模块 + dev_runner 注册表 + 调度 API）** | **旧端 Pipeline 服务（整体，不分离）** |
| 前端 runner/session 状态展示 | legacy_client（旧端界面） |

### 3.7 变更管理与图状回滚

> 阶段可能变更（内容/依赖/新增节点），变更后**整个管线调度流程随之改变**，需要专门的更新处理机制。

#### 设计原则

- **丢弃更新（immutable stages）**：已提交的阶段数据不直接更新，而是**对每个阶段提交 commit**（Git 层面）
- **并行开发使用 worktree**：各阶段在独立 worktree 开发，互不阻塞
  - worktree 基于**各阶段的 `repo` + `branch`** 创建：`git -C <repo> worktree add <stage-worktree> <branch>`
  - 跨仓库管线：每个阶段在自己的仓库（repo 字段）建 worktree，并行互不干扰
- **变更检测**：当某个节点（阶段）的数据/依赖发生变更时，若**其后续节点已有已完成开发**，需要提示用户处理
- **回滚对象**：git 回滚按受影响阶段的 `repo + branch` 执行（worktree 内 reset / 重开分支）
- **回滚后状态**：受影响节点重置为待执行（stage_status=0），可重新调度执行

#### 图状回滚扫描（服务端算法）

当修改已完成的节点（或其前驱）时，服务端执行**后续节点扫描**：

```mermaid
graph LR
    A[已修改节点<br/>前驱变更] --> B[后继节点 1]
    A --> C[后继节点 2]
    C --> D[后继节点 3 已完成]
    B --> D
```

1. 服务端对目标节点做**图遍历（DFS/BFS）**，扫描所有**后续节点**
2. 识别每个后续节点的状态：`未开始 / 进行中 / 已完成`
3. 返回受影响节点清单 + 各自状态给调用方

#### 用户决策流程

当「已完成节点 A 的前驱被修改」时：

> **提交入口**：客户端通过 `PATCH /pipeline/pipelines/:uuid`（更新 stages/edges/依赖）提交变更时，服务端**自动执行 change-check 逻辑**（先判 pipeline 状态 → 未开始静默 / 已开始扫描），与显式调用 `POST /pipeline/pipelines/:uuid/change-check` 等价。

```
客户端提交变更 → ① 判断 pipeline 是否已开始
├── ✅ 未开始（status=0 待规划，尚未进入任何阶段执行）
│   └── 静默更新管线（无需检测变更状态）
│       └── 客户端重新渲染管线状态图
│
└── ⚠️ 已开始（已有阶段进入执行）
    └── ② 服务端 change-check 扫描后续节点
        ├── ✅ 无受影响节点（无已完成/进行中的后继）
        │   └── 静默更新管线（直接应用变更）
        │       └── 客户端重新渲染管线状态图
        │           （提交变更必然由客户端进行，是否有图形界面不影响；
        │             有 GUI 则重新渲染即可）
        └── ⚠️ 有受影响节点（存在已完成/进行中的后继）
            ├── 服务端: 检测到节点 A 前驱变更，扫描后续节点
            │           → 受影响: [A(已完成), B(进行中), C(未开始)]
            │           → 返回提示给用户
            │
            └── 用户: 是否丢弃更新？
                ├── ✅ 丢弃（丢弃已完成开发）
                │   └── 回滚到「已完成的最小修改节点」
                │       ├── 服务端计算最小回滚点（受影响子图中最近未受影响节点）
                │       └── 客户端 Hermes 执行 git 回滚（worktree）
                └── ❌ 不丢弃（保留已完成开发）
                    └── 用户指示如何处理后续已完成的开发
                        ├── 由 Hermes 处理（客户端）
                        ├── 服务器调度只负责发出提示
                        └── 处理结果回传服务器，Hermes 做对应更新
```

#### keep 分支处理流程（保留已完成开发）

> 用户选择「保留」时，需明确处理策略。服务端记录决策、派发处理指令，处理完成后回传结果并恢复管线。

```mermaid
flowchart TD
    A[change-decision: keep] --> B{keep_strategy}
    B -->|hermes_handle 推荐| C[服务端记录决策 + 待处理变更]
    C --> D[派发处理指令给客户端 Hermes<br/>含受影响节点清单 + 变更内容]
    D --> E[Hermes 处理<br/>① 合并变更到已完成开发<br/>② 迁移已完成开发到新阶段<br/>③ 手动修复冲突代码]
    E --> F[Hermes 回传结果<br/>change-decision: result=updated + 处理摘要]
    F --> G[服务端更新管线 + 写 schedule_log]
    B -->|manual 手动| H[服务端标记变更待处理<br/>pipeline 进入 paused 状态等待]
    H --> I[用户在 GUI 手动处理<br/>变更提示面板操作]
    I --> J[用户处理完成后确认<br/>→ 服务端恢复管线]
```

| 策略 | 说明 | 适用场景 |
|------|------|---------|
| `hermes_handle`（推荐） | 服务端派发处理指令给 Hermes，Hermes 自动合并/迁移/修复后回传 | 常规变更，可自动化处理 |
| `manual` | 用户手动处理，管线暂停等待；完成确认后恢复 | 复杂变更 / 需要人工判断 |

- **变更待处理期间**：pipeline 状态置为 `paused`（5），前端变更提示面板常驻展示待处理事项
- **处理结果回传**：复用 `POST /pipeline/pipelines/:uuid/change-decision`（`result=updated` + `handled_by` + 摘要），服务端据此恢复管线状态并写 `pipeline_schedule_log`

#### 职责划分

| 角色 | 职责 |
|------|------|
| **服务端（旧端 Pipeline 服务）** | **管线状态判断**（未开始 → 直接静默，无需扫描）、图状回滚扫描算法、受影响节点识别、最小回滚点计算、发出变更提示、接收处理结果 |
| **客户端（Hermes）** | 执行实际更新（git 回滚/commit/worktree）、处理后续已完成开发的用户指示、回传处理结果、重新渲染管线状态图 |
| **用户** | 决策：丢弃 or 保留已完成开发 |

**执行衔接**：Hermes 主导变更处理（决策/协调/回传）；实际 git 操作（回滚/commit/worktree）通过派发 runner `rollback` 指令执行（指定 repo/branch + worktree 路径），或 Hermes 本地直接执行（同机场景）。

#### 变更处理 API

```json
// POST /pipeline/pipelines/:uuid/change-check
// 请求: 变更的节点 + 新数据
// 服务端逻辑: 先判断 pipeline 状态 → 未开始直接返回 silent（无需扫描）；
//             已开始 → 图遍历扫描后续节点
{
  "changed_stage": "s1",
  "change_type": "modify_dependency"   // modify_data / add_stage / remove_stage / modify_dependency
}

// 响应: pipeline 未开始 → silent=true（不扫描，直接静默更新）
{
  "pipeline_started": false,
  "affected": [],
  "silent": true,
  "prompt": null
}

// 响应: pipeline 已开始 → 受影响节点扫描结果
{
  "pipeline_started": true,
  "affected": [
    {"stage_uuid": "s2", "status": 4, "impact": "completed_will_invalidate"},
    {"stage_uuid": "s3", "status": 0, "impact": "pending"}
  ],
  "min_rollback_point": "s1",   // 最小回滚点（服务端计算）
  "prompt": "节点 s2 已完成，其前驱 s1 被修改，是否丢弃已完成开发？"
}

// 响应: pipeline 已开始但无受影响节点 → silent=true，客户端静默应用变更 + 重新渲染
{
  "pipeline_started": true,
  "affected": [],
  "silent": true,
  "prompt": null
}

// POST /pipeline/pipelines/:uuid/change-decision
// 请求: 用户决策结果
{
  "decision": "discard" | "keep",
  "keep_strategy": null | "hermes_handle",   // keep 时用户指示
  "handled_by": "hermes-dev",                // 处理方
  "result": "rolled_back" | "updated"        // 回传处理结果
}
```

---

## 四、数据表设计（草案）

### 4.1 pipeline_main（参考 task_main）

> **无时间戳字段**：创建/更新时间不写在数据表中，统一由审计 log（pipeline_history）记录，保证所有数据操作可审计。

```sql
CREATE TABLE pipeline_main (
    id            UUID          PRIMARY KEY DEFAULT uuidv7(),
    pipeline_name VARCHAR(200)  NOT NULL,
    project_name  VARCHAR(100)  NOT NULL,
    status        SMALLINT      NOT NULL DEFAULT 0,   -- 状态码见下方枚举
    repo          VARCHAR(200)  DEFAULT '',           -- 默认开发仓库（owner/repo，阶段未指定时继承）
    branch        VARCHAR(200)  DEFAULT '',           -- 默认开发分支（阶段未指定时继承）
    prd_content   TEXT          DEFAULT '',           -- PRD.md 当前版本内容（推送后存储，API 返回）
    prd_version   VARCHAR(20)   DEFAULT '',           -- PRD 版本（如 1.0.0，配合 history 审计）
    prd_git_ref   VARCHAR(200)  DEFAULT ''            -- PRD 落盘 Git 仓库的引用（owner/repo:path@sha），可为空
);

CREATE INDEX idx_pm_project ON pipeline_main(project_name);
CREATE INDEX idx_pm_name ON pipeline_main(project_name, pipeline_name);
```

**状态码枚举（pipeline_main.status / pipeline_stages.stage_status 统一）**

> 与 旧端 Pipeline 服务 任务状态码体系一致（以代码常量 + swagger 为准），保证跨模块语义统一。

| 值 | 常量 | 含义 | 说明 |
|:---:|------|------|------|
| 0 | Pending | 待规划 | 未开始，可静默变更（3.7 判定依据） |
| 1 | Approving | 审批中 | 等待 PRD 审批 |
| 2 | Developing | 开发中 | 有阶段进入执行 |
| 3 | Testing | 测试中 | 存在 CI / 验证阶段运行中时管线状态为 3 |
| 4 | Completed | 已完成 | 阶段/管线完成 |
| 5 | Paused | 暂停 | 变更待处理 / 失败重试超限 / 用户暂停（keep=manual 时） |
| 6 | Cancelled | 已取消 | 终止 |
| 7 | Recurring | 持续中 | 周期性管线（由 cron/调度定时触发重复执行，如每日报告管线） |

> **stage_status 实际使用子集**：0 待执行 / 2 开发中 / 3 测试中 / 4 完成 / 5 暂停 / 6 取消（1=审批中与 7=持续中仅管线级使用，阶段无此语义）

**PRD.md 存储方案**：

| 存储 | 角色 | 说明 |
|------|------|------|
| **旧端 Pipeline 服务 DB**（`prd_content`） | 权威 | API 直接返回；TEXT 存当前版本全文 |
| **pipeline_history** | 审计 | PRD 推送记为 update（entity_type=pipeline + entity_id=pipeline_id + modify_field=`prd_content`，old/new 存**内容 hash**，避免历史表膨胀） |
| **Git 仓库**（可选落盘，`prd_git_ref`） | 协同 | 推送 PRD.md 时同步 commit 到管线对应仓库目录（如 `AutoPlan/LongtermPlan/`），便于 diff/审阅 |

- PRD 推送流程：Hermes 生成 PRD.md → `POST /pipeline/pipelines/:uuid/prd` → 服务端写 `prd_content` + 更新 `prd_version` + 记 history + 写 schedule_log（prd_push）
- 版本：PRD 每次推送递增 patch 版本（1.0.0 → 1.0.1），major/minor 由用户/Hermes 显式指定

### 4.2 需求 ↔ 管线 n:n 关联表

```sql
CREATE TABLE pipeline_task_rel (
    id            UUID          PRIMARY KEY DEFAULT uuidv7(),
    pipeline_id   UUID          NOT NULL REFERENCES pipeline_main(id),
    task_id       UUID          NOT NULL,              -- 逻辑外键 → task_main.id（跨模块，不建物理 FK）
    UNIQUE (pipeline_id, task_id)
);

CREATE INDEX idx_ptr_task ON pipeline_task_rel(task_id);
```

### 4.3 阶段状态表（图状 DAG 节点）

```sql
CREATE TABLE pipeline_stages (
    id            UUID          PRIMARY KEY DEFAULT uuidv7(),
    pipeline_id   UUID          NOT NULL REFERENCES pipeline_main(id),
    stage_name    VARCHAR(100)  NOT NULL,   -- 阶段名词（阶段1/阶段2/...）
    stage_status  SMALLINT      NOT NULL DEFAULT 0,  -- 状态码见 4.1 枚举
    stage_desc    TEXT,                     -- 阶段描述（或存 issue）
    verify_script TEXT,                     -- 本地验证脚本路径
    issue_link    TEXT,                     -- 关联 issue / 子需求 issue 链接
    is_parallel   BOOLEAN       NOT NULL DEFAULT false,  -- 是否可并行（独立节点）
    repo          VARCHAR(200)  DEFAULT '', -- 阶段开发仓库（覆盖管线默认，为空继承 pipeline_main.repo；支持跨仓库管线）
    branch        VARCHAR(200)  DEFAULT '', -- 阶段开发分支（为空用仓库默认分支）
    stage_type    SMALLINT      NOT NULL DEFAULT 0,  -- 阶段类型：0=normal 普通 / 1=ci CI 构建阶段
    retry_count   SMALLINT      NOT NULL DEFAULT 0,  -- 失败重试次数（默认上限 3，config 可调）
    ci_repo       VARCHAR(200)  DEFAULT '', -- CI 阶段专属：Gitea 仓库（owner/repo）
    ci_workflow   VARCHAR(200)  DEFAULT '', -- CI 阶段专属：workflow 文件路径
    ci_job        VARCHAR(100)  DEFAULT '', -- CI 阶段专属：job 名
    ci_run_id     BIGINT        DEFAULT 0   -- CI 阶段专属：最近一次关联构建 run id（推送后回填）
);

CREATE INDEX idx_ps_pipeline ON pipeline_stages(pipeline_id);
CREATE INDEX idx_ps_type ON pipeline_stages(stage_type);
```

### 4.4 阶段前驱/后继关系表（DAG 边）

```sql
CREATE TABLE pipeline_stage_edges (
    id             UUID        PRIMARY KEY DEFAULT uuidv7(),
    pipeline_id    UUID        NOT NULL REFERENCES pipeline_main(id),
    from_stage_id  UUID        NOT NULL REFERENCES pipeline_stages(id),  -- 前驱阶段
    to_stage_id    UUID        NOT NULL REFERENCES pipeline_stages(id),  -- 后继阶段
    UNIQUE (pipeline_id, from_stage_id, to_stage_id)
);

-- 并行推断：无入边（无前驱）且 is_parallel=true 的节点可并行执行
-- 拓扑排序：根据 edges 计算执行顺序，无依赖链的节点可并行
-- 约束：from_stage_id / to_stage_id 必须属于同一 pipeline（应用层校验或 CHECK），禁止跨管线引用
```

### 4.5 pipeline_history：审计日志（参考 tasks_history）

> **所有数据操作可审计**：pipeline_main / stages / edges / rel 的任何 create / update / delete 都记录在此表，含版本号与 old/new diff。
> **定位方式：`pipeline id + stage type + stage ID`** —— 与 pm_api tasks_history 的 modify_key=UUID 语义对齐；pipeline 含多实体（pipeline/stage/edge/rel），故用 entity_type + entity_id 唯一定位被修改实体。
> **git 操作不入审计**：commit / worktree / 回滚由 runner 开发时处理（运行时行为），不属于数据操作，pipeline_history 不记录（无 if_ext_git 字段）。

```sql
CREATE TABLE pipeline_history (
    id            UUID          NOT NULL,             -- pipeline id（FK → pipeline_main.id）
    ver_major     SMALLINT      NOT NULL DEFAULT 0,   -- 语义化版本 - major
    ver_minor     SMALLINT      NOT NULL DEFAULT 0,   -- 语义化版本 - minor
    ver_patch     SMALLINT      NOT NULL DEFAULT 0,   -- 语义化版本 - patch
    entity_type   VARCHAR(30)   NOT NULL,             -- 实体类型：pipeline / stage / edge / rel
    entity_id     UUID          NOT NULL,             -- stage ID：被修改实体 id（pipeline 自身 = 本表 id；stage/edge/rel 用各自 id）
    modify_type   SMALLINT      NOT NULL DEFAULT 0,   -- 0=create 1=update 2=delete
    modify_field  VARCHAR(100)  DEFAULT '',           -- 修改的字段名（可选，便于查询；空 = 整体 diff）
    old_value     JSONB         DEFAULT '{}',         -- 修改前值（结构化）
    new_value     JSONB         DEFAULT '{}',         -- 修改后值（结构化）
    trigger_by    VARCHAR(100)  DEFAULT '',           -- 触发者（hermes / user / system / runner）
    timestamp     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id, entity_type, entity_id, ver_major, ver_minor, ver_patch),
    CONSTRAINT fk_ph_main FOREIGN KEY (id) REFERENCES pipeline_main(id) ON DELETE CASCADE
);

CREATE INDEX idx_ph_version ON pipeline_history(id, ver_major DESC, ver_minor DESC, ver_patch DESC, timestamp DESC);
CREATE INDEX idx_ph_entity ON pipeline_history(entity_type, entity_id, timestamp DESC);
```

**版本说明**：`ver_major/ver_minor/ver_patch`（数据审计版本，按 entity 递增）与 `pipeline_main.prd_version`（PRD 文档版本）**相互独立**——PRD 文档更新只影响 prd_version，任何数据操作都产生独立的审计版本。

### 4.6 pipeline_schedule_log：调度日志（独立存储）

> **调度阶段与状态变更日志**：记录管线调度、阶段推进、状态变更、Runner 调度等事件。
> **数据量大，与数据更新分离**：独立表、独立写入路径，不参与 pipeline_history 的版本 diff，避免高频调度日志拖慢审计与数据操作。

```sql
CREATE TABLE pipeline_schedule_log (
    id             BIGSERIAL     PRIMARY KEY,          -- 自增序号（高频写入）
    pipeline_id    UUID          NOT NULL,             -- 逻辑外键 → pipeline_main.id（高频日志表不建物理 FK）
    stage_id       UUID,                               -- 逻辑外键 → pipeline_stages.id（可为 NULL）
    event_type     VARCHAR(50)   NOT NULL,             -- schedule / stage_start / stage_done / stage_fail / stage_retry / stage_skip / status_change / runner_dispatch / prd_push / prd_approve / pipeline_push / ci_build / verify
    event_detail   TEXT          DEFAULT '',           -- 事件详情（JSON 或文本）
    runner_name    VARCHAR(100)  DEFAULT '',           -- 执行 Runner（hermes-dev / ssh://...）
    trigger_by     VARCHAR(100)  DEFAULT '',           -- 触发者（hermes / user / cron）
    timestamp      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_psl_pipeline ON pipeline_schedule_log(pipeline_id, timestamp DESC);
CREATE INDEX idx_psl_stage ON pipeline_schedule_log(stage_id, timestamp DESC);
-- 清理策略：默认保留 90 天，到期按时间归档/清理（与审计日志分开，可独立保留策略）
```

### 4.7 dev_runner：执行器注册表

> **多环境执行器**：每个 SSH/开发环境运行一个 Go runner/manager 守护进程，主动连接 旧端 Pipeline 服务 注册并等候指令。

```sql
CREATE TABLE dev_runner (
    id            UUID          PRIMARY KEY DEFAULT uuidv7(),
    runner_name   VARCHAR(100)  NOT NULL,              -- runner 标识（hermes-dev / ssh-10 / dev-container-1 / local-manager）
    runner_type   VARCHAR(50)   NOT NULL DEFAULT 'ssh', -- 类型：ssh / local / container / hermes-image / manager
    mode          VARCHAR(20)   NOT NULL DEFAULT 'runner', -- 运行模式：runner / manager
    endpoint      VARCHAR(200)  DEFAULT '',            -- 连接信息（ssh://user@host / docker://image / local）
    status        SMALLINT      NOT NULL DEFAULT 0,    -- 0=offline 1=online 2=busy
    last_heartbeat TIMESTAMPTZ  DEFAULT NULL,          -- 最后心跳时间
    env_info      TEXT          DEFAULT '',            -- 环境信息（JSON：hostname/path/hermes 可用性/sessions 状态）
    secret_issuer UUID          DEFAULT NULL,          -- 签发当前凭证的签发者（用户/manager，分布式溯源；NULL=未签发）
    secret_expires_at TIMESTAMPTZ DEFAULT NULL,        -- 当前凭证过期时间（到期需 refresh-secret）
    description   TEXT          DEFAULT ''
);

CREATE INDEX idx_dr_name ON dev_runner(runner_name);
CREATE INDEX idx_dr_status ON dev_runner(status);
CREATE INDEX idx_dr_mode ON dev_runner(mode);
```

### 4.8 dev_runner_jobs：执行任务记录

```sql
CREATE TABLE dev_runner_jobs (
    id            UUID          PRIMARY KEY DEFAULT uuidv7(),
    runner_id     UUID          NOT NULL REFERENCES dev_runner(id),
    session_id    UUID          DEFAULT NULL,          -- 逻辑外键 → hermes_session.id（runner_id:session_id 目标中的 session，可为 NULL）
    pipeline_id   UUID,                                -- 关联管线（可为 NULL）
    stage_id      UUID,                                -- 关联阶段（可为 NULL）
    retry_of_job_id UUID      DEFAULT NULL,            -- 重试来源 job（首次执行为 NULL，重试指向原 job）
    job_type      VARCHAR(50)   NOT NULL,              -- stage_run / prd_push / verify / rollback / session_start / session_stop / session_list / status
    job_status    SMALLINT      NOT NULL DEFAULT 0,    -- 0=queued 1=running 2=success 3=failed
    job_output    TEXT          DEFAULT '',            -- 执行输出（回传结果）
    trigger_by    VARCHAR(100)  DEFAULT '',            -- 触发者
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    finished_at   TIMESTAMPTZ
);

CREATE INDEX idx_drj_runner ON dev_runner_jobs(runner_id, created_at DESC);
CREATE INDEX idx_drj_pipeline ON dev_runner_jobs(pipeline_id, created_at DESC);
```

### 4.9 hermes_session：本机 Hermes session 管理（manager 模式）

```sql
CREATE TABLE hermes_session (
    id            UUID          PRIMARY KEY DEFAULT uuidv7(),
    runner_id     UUID          NOT NULL REFERENCES dev_runner(id),  -- 管理该 session 的 manager
    session_name  VARCHAR(100)  NOT NULL,              -- session 标识（hermes-dev-1 / hermes-ops / hermes-analyst）
    session_status SMALLINT     NOT NULL DEFAULT 0,    -- 0=stopped 1=running 2=idle 3=error
    project_name  VARCHAR(100)  DEFAULT '',            -- 关联项目（可为空）
    image_name    VARCHAR(200)  DEFAULT '',            -- 使用的 Hermes image（如有）
    pid           INTEGER       DEFAULT 0,             -- 本地进程 PID（后台启动）
    log_path      TEXT          DEFAULT '',            -- session 日志路径
    started_at    TIMESTAMPTZ,                         -- 启动时间
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hs_runner ON hermes_session(runner_id);
CREATE INDEX idx_hs_status ON hermes_session(session_status);
```

### 4.10 runner_secret：凭证存储与管理

> **所有签发的 secret（secret_id + secret_key）持久化入库**（key 存哈希不存明文），支撑吊销管理、有效凭证查询与审计溯源。与 `legacy_pipeline_api.py` 的 HMAC secret **同一体系管理**。

```sql
CREATE TABLE runner_secret (
    id              UUID          PRIMARY KEY DEFAULT uuidv7(),
    secret_id       VARCHAR(100)  NOT NULL,            -- 凭证标识（明文，请求头携带）
    runner_id       UUID          DEFAULT NULL,        -- 绑定的 runner（签发时可为空，register 后回填；逻辑外键 → dev_runner.id）
    issued_by       UUID          NOT NULL,            -- 签发者（用户/manager，逻辑外键；用户不在 dev_runner，不建物理 FK）
    secret_key_hash VARCHAR(64)   NOT NULL,            -- SHA-256(secret_key)，不存明文
    scope           TEXT          NOT NULL DEFAULT '[]', -- 权限范围（JSON 数组：dispatch/heartbeat/jobs/refresh）
    status          SMALLINT      NOT NULL DEFAULT 0,  -- 0=active 1=revoked 2=expired
    issued_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ   NOT NULL,            -- 过期时间（默认 24h）
    revoked_at      TIMESTAMPTZ,
    revoked_reason  VARCHAR(200)  DEFAULT '',
    created_by      VARCHAR(50)   NOT NULL DEFAULT 'user'  -- user / manager / refresh
);

CREATE INDEX idx_rs_runner ON runner_secret(runner_id, status);
CREATE INDEX idx_rs_secret ON runner_secret(secret_id);
CREATE INDEX idx_rs_issuer ON runner_secret(issued_by, status);
CREATE INDEX idx_rs_expiry ON runner_secret(status, expires_at);
```

### 4.11 runner_secret_audit：凭证审计日志

> **凭证生命周期事件审计**：签发 / 刷新 / 吊销 / 过期 / 轮换 全部记录，配合 AccessLog（请求使用记录）形成全链路可审计。

```sql
CREATE TABLE runner_secret_audit (
    id            BIGSERIAL     PRIMARY KEY,
    secret_id     UUID          NOT NULL,              -- FK → runner_secret.id
    runner_id     UUID,                                -- 绑定的 runner（可为 NULL）
    issued_by     UUID,                                -- 签发者（可为 NULL）
    event_type    VARCHAR(50)   NOT NULL,              -- issue / refresh / revoke / expire / rotate
    detail        TEXT          DEFAULT '',            -- 事件详情（JSON：原因/scope）
    actor         VARCHAR(100)  DEFAULT '',            -- 触发者（runner / manager / user / system）
    timestamp     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rsa_secret ON runner_secret_audit(secret_id, timestamp DESC);
CREATE INDEX idx_rsa_runner ON runner_secret_audit(runner_id, timestamp DESC);
-- 清理策略：与 pipeline_schedule_log 一致，默认保留 90 天归档
```

---

## 五、JSON API 草案

> **双消费方**：同一套 JSON API 同时服务 **Hermes Agent**（查询/管理管线状态）与**旧端界面前端**（接收渲染），保证数据一致。
> - Hermes：通过 `legacy_pipeline_api.py`（HMAC 签名）或 Hermes Skill 调用，查询管线状态、推进阶段、获取 PRD
> - 前端：通过旧端界面后端代理 / 直接调用，接收 JSON 渲染管线界面
> - **创建发起方**：Hermes（`legacy_pipeline_api.py pipeline create`）或前端 GUI 均可创建管线；创建成功返回 `pipeline_link` 供跳转审阅

```json
// GET /pipeline/projects/:name/pipelines
{
  "pipelines": [
    {
      "pipeline_uuid": "019f...",
      "pipeline_name": "legacy_observatory 量化后端开发",
      "project_name": "legacy_observatory",
      "status": 2,
      "status_label": "开发中",
      "created_at": "2026-08-02T12:00:00Z",
      "pipeline_link": "https://example.org/pipeline/019f...",  // 可跳转链接
      "stages": [
        {"stage_uuid": "s1", "stage_name": "阶段1", "stage_status": 4, "issue_link": "...", "is_parallel": false, "stage_type": 0, "repo": "example-org/legacy_observatory", "branch": "main"},
        {"stage_uuid": "s2", "stage_name": "阶段2", "stage_status": 2, "issue_link": "...", "is_parallel": false, "stage_type": 0, "repo": "example-org/legacy_client", "branch": "feature/pipeline"},
        {"stage_uuid": "s3", "stage_name": "CI 构建", "stage_status": 0, "issue_link": "...", "is_parallel": false, "stage_type": 1, "ci_run_id": 0}
      ],
      "stage_edges": [   // DAG 边：前驱 → 后继
        {"from": "s1", "to": "s2"},
        {"from": "s2", "to": "s3"}
      ],
      "tasks": ["task_uuid1", "task_uuid2"],
      "dev_runners": ["hermes-dev", "ssh://runner.example.org"]
    }
  ]
}

// POST /pipeline/pipelines  → 创建管线，返回 { pipeline_uuid, pipeline_link }
// GET /pipeline/pipelines?status=active   → 进行中管线
// GET /pipeline/pipelines?status=done     → 已完成管线
// GET /pipeline/pipelines?sort=created_at&project=X  → 按项目/创建时间排序
// GET /pipeline/pipelines/:uuid           → 单管线详情（含 PRD.md 内容 + DAG edges，供图状渲染）
// PATCH /pipeline/pipelines/:uuid         → 推进管线状态 / 更新阶段（Hermes 调用）
// POST /pipeline/pipelines/:uuid/prd      → 推送 PRD.md 到管线（Hermes 调用，状态 0→1 审批中）
// POST /pipeline/pipelines/:uuid/push     → 登记代码推送（回填 ci_run_id，CI 阶段进入等待；或 Gitea push webhook 自动触发）
// POST /pipeline/pipelines/:uuid/approve  → 批准 PRD（用户前端按钮或智能助手 tool 调用；状态 1→2 开发中）
// POST /pipeline/pipelines/:uuid/stages   → 添加阶段节点
// POST /pipeline/pipelines/:uuid/edges    → 添加阶段依赖边（前驱/后继）
// GET  /pipeline/pipelines/:uuid/topology → 拓扑排序结果 + 可并行节点推断（Hermes/前端共用）
// POST /pipeline/pipelines/:uuid/tasks    → 关联 task（n:n 增加）
// DELETE /pipeline/pipelines/:uuid/tasks/:task_id → 解绑 task（不影响管线阶段）
// POST /pipeline/pipelines/:uuid/change-check    → 变更检测：受影响节点扫描 + 最小回滚点（3.7）
// POST /pipeline/pipelines/:uuid/change-decision → 变更决策：discard / keep（3.7）
// POST /pipeline/pipelines/:uuid/stages/:sid/skip → 跳过阶段（失败决策/人工介入，标记完成 4）
// DELETE /pipeline/pipelines/:uuid        → 删除管线（含级联 stages/edges/rel；或置 status=6 取消）
// POST /pipeline/webhooks/gitea           → 接收 Gitea Actions/Push 事件（webhook secret 签名校验 X-Gitea-Signature，非 runner 凭证；见 3.5）
// POST /dev-runner/issue-secret            → 用户调用签发 secret_id + secret_key（runner 首次注册凭证，认证后调用；见 3.6）
// POST /dev-runner/:id/refresh-secret       → 凭证续期（携带当前有效凭证换发新 secret）
// POST /dev-runner/:id/revoke-secret        → 吊销凭证（该 runner 全部失效；级联签发者）
// GET  /dev-runner/:id/sessions             → 查询本机 Hermes session 列表（manager 模式）
// GET  /dev-runner/:id/ws                   → runner 主动连接 WebSocket 长连接（指令下发/回传，HMAC secret 鉴权）
// GET  /pipeline/ws/subscribe               → 发起方 WS 订阅管线状态变更（可选，HMAC secret 鉴权）
```

#### 关键接口响应示例

**① 创建管线（直接定义阶段 + 关联 task）**

```json
// POST /pipeline/pipelines
{
  "pipeline_name": "legacy_observatory 量化后端开发",
  "project_name": "legacy_observatory",
  "repo": "example-org/legacy_observatory",   // 默认开发仓库（B 方案：管线级默认）
  "branch": "main",                             // 默认开发分支
  "task_ids": ["019f...", "019f..."],          // 关联需求（n:n，可关联多个 task）
  "stages": [
    {"stage_name": "阶段1", "issue_link": "https://gitea.../issues/5", "is_parallel": false},
    {"stage_name": "阶段2", "is_parallel": true},
    {"stage_name": "阶段3", "verify_script": "scripts/verify_stage3.py", "is_parallel": false,
     "repo": "example-org/legacy_client", "branch": "feature/pipeline"}   // 阶段级覆盖：跨仓库管线示例
  ],
  "stage_edges": [{"from": "阶段1", "to": "阶段2"}, {"from": "阶段2", "to": "阶段3"}]
}

// 响应：创建管线 + 阶段节点 + 依赖边 + task 关联（n:n），返回链接
{
  "pipeline_uuid": "019f...",
  "pipeline_link": "https://example.org/pipeline/019f...",
  "repo": "example-org/legacy_observatory",
  "stages_created": ["阶段1", "阶段2", "阶段3"],
  "edges_created": 2,
  "tasks_linked": ["019f...", "019f..."]
}
```

- 阶段定义**只属于管线**：创建后通过 `POST /pipeline/pipelines/:uuid/stages` / `edges` 继续调整 DAG
- 阶段 `repo` 为空时**继承管线默认仓库**，`branch` 为空时用仓库默认分支
- task 关联可后续增删：`POST /pipeline/pipelines/:uuid/tasks`（解绑同理），不影响管线阶段
- 阶段不依赖 task 存在：stage 的 `issue_link` 可指向任意需求 issue（即使该 task 未关联本管线）

**② 单管线详情（含 PRD 内容，供图状渲染 + 审阅）**

```json
// GET /pipeline/pipelines/:uuid
{
  "pipeline_uuid": "019f...",
  "pipeline_name": "legacy_observatory 量化后端开发",
  "project_name": "legacy_observatory",
  "status": 1,
  "status_label": "审批中",
  "prd": {
    "version": "1.0.0",
    "content": "# 需求与 PRD ...",        // prd_content 全文
    "git_ref": "example-org/legacy_lib:AutoPlan/LongtermPlan/...@a3f2b9c1"
  },
  "stages": [
    {"stage_uuid": "s1", "stage_name": "阶段1", "stage_status": 4,
     "issue_link": "https://gitea.../issues/5", "is_parallel": false, "stage_type": 0},
    {"stage_uuid": "s2", "stage_name": "阶段2", "stage_status": 0, "issue_link": "", "is_parallel": true, "stage_type": 0},
    {"stage_uuid": "s4", "stage_name": "CI 构建", "stage_status": 2, "issue_link": "", "is_parallel": false, "stage_type": 1,
     "ci": {"repo": "example-org/legacy_observatory", "workflow": ".gitea/workflows/lmo-api.yml", "job": "build-lmo-api", "run_id": 123456}}
  ],
  "stage_edges": [{"from": "s1", "to": "s2"}],
  "tasks": ["019f...", "019f..."],
  "dev_runners": [{"name": "hermes-dev", "status": "online", "mode": "runner", "sessions": [{"name": "hermes-dev-1", "status": "running"}]}]
}
```

**③ 拓扑排序 + 并行节点推断（Hermes/前端共用）**

```json
// GET /pipeline/pipelines/:uuid/topology
{
  "pipeline_uuid": "019f...",
  "topo_order": ["s1", "s2", "s3", "s4"],       // 拓扑排序（执行顺序）
  "levels": [["s1"], ["s2"], ["s3", "s4"]],     // 分层：同层无依赖可并行
  "parallel_groups": [["s3", "s4"]],            // 可并行执行的节点组（推断结果）
  "independent_nodes": ["s5"],                  // 独立节点（无前驱无后继，随时可执行）
  "ready_nodes": ["s2"],                        // 当前立即可执行的节点（前驱均已完成）
  "cycles": [],                                 // 环检测结果（正常为空，有环报错）
  "estimated_parallelism": 2                    // 最大并行度（供前端展示）
}
```

- **使用场景**：Hermes 拿到 `ready_nodes` / `parallel_groups` 决定并行调度策略；前端按 `levels` 做层级布局渲染

**Hermes 消费示例**（legacy_pipeline_api.py 扩展）：

```bash
# Hermes 创建管线（直接定义阶段 + 关联 task + 指定仓库/分支）
python3 legacy_pipeline_api.py pipeline create --name "量化后端开发" --project legacy_observatory \
    --repo example-org/legacy_observatory --branch main \
    --tasks 019f... --tasks 019f... \
    --stages '阶段1:{"issue_link":"https://gitea.../issues/5"}' \
    --edges '阶段1->阶段2,阶段2->阶段3'

# Hermes 查询进行中管线（JSON）
python3 legacy_pipeline_api.py pipeline list --status active

# Hermes 查询单管线详情（含 PRD）
python3 legacy_pipeline_api.py pipeline get <uuid>

# Hermes 推进管线阶段
python3 legacy_pipeline_api.py pipeline update <uuid> --stage 阶段2 --status 2

# Hermes 推送 PRD.md（状态自动 0→1 审批中，系统提示用户审批）
python3 legacy_pipeline_api.py pipeline prd <uuid> --file PRD.md

# Hermes 登记代码推送（CI 阶段进入等待，回填 ci_run_id）
python3 legacy_pipeline_api.py pipeline push <uuid>

# 审批 PRD（用户前端按钮 或 智能助手 tool 调用；Hermes 可代为调用，其他 agent 复用同一 REST API）
python3 legacy_pipeline_api.py pipeline approve <uuid>     # 等价 POST /pipeline/pipelines/:uuid/approve → 状态 1→2

# Hermes 关联 / 解绑 task（n:n，不影响管线阶段）
python3 legacy_pipeline_api.py pipeline task link <uuid> --task 019f...
python3 legacy_pipeline_api.py pipeline task unlink <uuid> --task 019f...

# Hermes 添加阶段节点 / 依赖边（构建 DAG）
python3 legacy_pipeline_api.py pipeline stage add <uuid> --name 阶段3 --parallel --repo example-org/legacy_client
python3 legacy_pipeline_api.py pipeline edge add <uuid> --from s2 --to s3

# Hermes 查询拓扑排序 + 可并行节点推断（决定并行执行策略）
python3 legacy_pipeline_api.py pipeline topology <uuid>

# Hermes 变更检测 / 决策（3.7）
python3 legacy_pipeline_api.py pipeline change-check <uuid> --stage s1 --type modify_dependency
python3 legacy_pipeline_api.py pipeline change-decision <uuid> --decision keep --strategy hermes_handle

# Hermes 跳过失败阶段（人工决策：跳过，后继可推进）
python3 legacy_pipeline_api.py pipeline stage skip <uuid> --stage s2
```

---

## 六、实施步骤（阶段划分）

| 阶段 | 内容 | 依赖 | 状态 |
|:---:|------|------|:---:|
| P0-1 | pipeline_main + rel + stages/edges + **history/schedule_log/dev_runner/dev_runner_jobs/hermes_session/runner_secret/runner_secret_audit** DDL 与 DAL | 旧端 Pipeline 服务 现有 DAL 模式 | ⏳ |
| P0-2 | pipeline API（CRUD + 状态查询 + 排序筛选 + stages/edges 管理 + **阶段失败自动重试与超限暂停** + **审计写入**）+ **legacy_pipeline_api.py pipeline CLI 扩展**（create/get/update/prd/approve/push/task/stage/edge/topology/change/skip） | P0-1 | ⏳ |
| P0-3 | pipeline topology（拓扑排序 + 并行推断） | P0-2 | ⏳ |
| P0-4 | pipeline_task_rel n:n 关联（task↔pipeline 增删查）+ 阶段 issue 关联 | 现有 pm_api | ⏳ |
| P0-5 | **图状回滚扫描算法（change-check）+ 最小回滚点计算 + change-decision** | P0-3 | ⏳ |
| P1-1 | **legacy_worker 开发（独立项目，Go）：runner/manager 双模式 + 主动连接 + 指令循环 + Hermes 调用控制 + Hermes session 管理 + **worktree 本地创建（repo/branch）** + Hermes image 封装 + 本地 CSV 存储 + PG 存储抽象** | P0-2 + P0-5 | ⏳ |
| P1-2 | 旧端 Pipeline 服务：Dev Runner API（register / list / dispatch / jobs / heartbeat）+ **secret 签发/刷新/吊销（HMAC secret_id+secret_key + runner_secret 落库 + 审计，与 legacy_pipeline_api.py 同一体系）** + session API + **schedule_log 写入** | P0-1 + P1-1 | ⏳ |
| P1-3 | Gitea CI 对接：CI 作为管线阶段（stage_type=ci）+ pipeline 推送后读取 CI 信息（webhook 优先/轮询兜底 + 状态映射 + schedule_log 写入） | P0-2 | ⏳ |
| P1-4 | **legacy_client 自研无限画布渲染库**（视口变换 + Culling + 节点/边渲染 + 空间分块虚拟化，通用「节点-边→画布」接口） | legacy_client | ⏳ |
| P1-5 | 旧端界面前端管线界面（基于自研无限画布库的 DAG 图状渲染 + 变更提示交互 + **审批交互（待审批横幅/批准/驳回）** + **失败重试报告面板** + runner/session 状态展示） | P0-2 + P0-3 + P0-5 + P1-4 | ⏳ |
| P2-1 | 本地 Python 验证脚本模板 + 子需求分解流程 | P0-4 | ⏳ |

---

## 七、交付物

- **legacy_worker（独立项目，Go）**：runner/manager 双模式 daemon（主动连接 + 指令循环 + Hermes 调用控制 + Hermes session 管理 + Hermes image 封装 + **本地 CSV 存储 / PG 存储抽象**，CSV 便于导入导出）
- 旧端 Pipeline 服务：pipeline_main + rel + stages/edges + history + schedule_log + dev_runner + dev_runner_jobs + hermes_session + **runner_secret（secret 持久化）+ runner_secret_audit（凭证审计日志）** 数据表 + pipeline API（JSON 支持排序/筛选/状态/拓扑）
- **legacy_pipeline_api.py：pipeline 子命令扩展**（Hermes 调用入口，create/get/update/prd/approve/push/task/stage/edge/topology/change/skip，见五、API Hermes 消费示例）
- 旧端 Pipeline 服务：`/topology` 拓扑排序 + 可并行节点推断接口（Hermes/前端共用）
- 旧端 Pipeline 服务：**图状回滚扫描**（change-check / change-decision API + 最小回滚点计算）
- 旧端 Pipeline 服务：Dev Runner API（register / list / dispatch / jobs / heartbeat）+ Hermes Session API
- **legacy_client 自研「无限画布渲染库」（内部库）**：视口变换（pan/zoom）+ 渲染裁剪（Culling）+ 节点/边渲染 + 空间分块虚拟化；与管线业务解耦，为后续大规模高性能渲染做技术储备
- 旧端界面前端：研发管线界面（按项目/创建时间分类排序，进行中/已完成切换，**DAG 图状渲染（基于自研无限画布库）**，变更提示交互，runner/session 状态展示）
- Gitea CI：CI 作为管线阶段（stage_type=ci）对接 —— pipeline 推送后读取构建状态（webhook 优先 / 轮询兜底 + 状态映射）
- Python 验证脚本模板

---

## 八、验证方式

1. `go build` 通过 + 新增 API 路由 curl 验证
2. 创建测试管线（pipeline_main + stages + edges + task 关联 + repo/branch 继承）→ 前端图状显示
3. 拓扑接口返回正确执行顺序、分层（levels）、并行组、ready_nodes 与独立节点
4. 创建管线时直接定义 stages/edges + 关联多个 task（n:n）+ 阶段 repo 覆盖（跨仓库管线）；task 侧 meta 确认无阶段信息
5. **PRD 审批流转**：推送 PRD → 状态 0→1 审批中 + 前端提示用户审批；用户 approve（前端/智能助手 tool）→ 1→2 开发中；reject → 退回 0 待规划
6. PRD 推送：写 prd_content + prd_version 递增 + history 审计（hash diff）+ schedule_log（prd_push）
7. CI 作为管线阶段：stage_type=ci 节点 + Gitea webhook 推送到 旧端 Pipeline 服务（POST /pipeline/webhooks/gitea，**X-Gitea-Signature secret 验签**，验签失败 401）+ 状态同步（success→4 / failure→3）
8. 多环境 Dev Runner 执行 → WebSocket 指令下发 + 结果回传验证；断线后 HTTP 轮询兜底；HMAC secret 鉴权验证
9. **Secret 存储与审计**：用户签发 secret_id+secret_key → 入库（SHA-256 hash）→ HMAC 签名使用 → refresh 续期 / revoke 吊销（即时生效/级联签发者）→ 指令帧服务端签名验签（双向认证）→`runner_secret_audit` 全链路记录完整
10. **失败重试**：失败自动重试（默认 3 次，config 可调）→ 超限 pipeline 暂停（5）→ 用户决策（修改重跑/跳过 stage skip/终止）按 3.7 更新节点
11. **调度分配**：并行阶段默认同机多 Hermes session（runner_id:session_id）并行；多机 runner 扩展；无可用排队等待
12. **状态轮询与完成流转**：发起方轮询 旧端 Pipeline 服务 获取状态（WS 订阅/Web API）驱动阶段流转；manager 检查所有节点完成 → 调 PATCH status=4 流转至已完成
13. 变更管理：change-check 返回受影响节点 + 最小回滚点；keep=manual 时管线进入 paused 等待确认；回滚按阶段 repo/branch 执行
14. 权限校验：未登录跳转 Logto；无 Gitea 仓库权限返回 403；权限矩阵各操作按表校验
15. **无限画布渲染库**：100+ 节点 DAG 平移/缩放流畅（Culling 生效）；pan/zoom/框选/节点点击交互正常
16. 总览文档更新

---

## TDD 红绿灯状态

🔴 RED ──→ 🟢 GREEN ──→ 🔵 REFACTOR
[░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0%

## 当前结果
- ⏳ 待审批（2026-08-02 初稿；2026-08-03 完善补充）
