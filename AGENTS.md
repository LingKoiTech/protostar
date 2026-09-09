# Protostar（将明）— AGENTS

本仓 agent 的入口索引。**开工前按顺序读**：本文件 → `.specify/memory/constitution.md` 对应节 → 当前任务的 `spec.md` / `plan.md` / `tasks.md` → 对应 skill。

本文件只作索引，**不写规范细节**；治理条文一律落在 `.specify/memory/constitution.md`。

---

## 一、本仓定位与自举迭代

将明（Protostar）是 AI 研发管线的本体：执行端 `protostar_worker`、命令行 `protostar_cli`、MCP 服务 `protostar_mcp`、项目 skills `protostar_skills`、前端 `protostar_gui`。

> **仓库现状（2026-09-09）**：仅目录骨架（五个模块目录为空占位），尚未 `git init`；README / AGENTS 描述的是设计契约。动手前先按 §二 生成 constitution，再按 §三 落 spec。

**全项目基于 protostar 自身迭代管理（自举 / self-hosting）**：

```
需求 → Gitea issue（编号权威）→ pipeline 注册 → 懒分解 → spec / plan / tasks
     → job 执行（agent 会话）→ 验证 / 回测 → PR → 收尾（总结 / 检查 / 关单）
```

- **执行体**：每个 job 由 `protostar_worker` 调度的 agent 会话承担；agent 的通用入口是 `protostar_mcp`，本地动作优先走 `protostar_cli`。
- **引导期例外（bootstrap）**：当某环节 protostar 自身能力尚未覆盖（worker 不可运行、后端未就绪等），允许用既有 `lmo_pipeline_runner` + `lmo_server` 管线或人工执行。此类例外**必须写进 spec**，并注明退出条件（该能力落地后切回自举）。
- **自举不自证**：PR 合并、issue 关闭、验收仍由 HumanMiao 审批；agent 不得自行合并或关单。

## 二、spec-kit 工作流

本仓 spec 基于 spec-kit 引入，命令链（每步先读对应 skill）：

```
constitution → specify → clarify → plan → tasks → implement → analyze → checklist → taskstoissues
```

| 阶段 | 命令 | 产物 |
|---|---|---|
| 治理 | `/speckit-constitution` | `.specify/memory/constitution.md` |
| 需求 | `/speckit-specify` `/speckit-clarify` `/speckit-converge` | `spec.md`（做什么 + 验收） |
| 方案 | `/speckit-plan` | `plan.md`（技术方案） |
| 任务 | `/speckit-tasks` | `tasks.md`（bite-sized，每条标 RED / GREEN / REFACTOR） |
| 实施 | `/speckit-implement` `/speckit-checklist` | 代码 + 交付四查 |
| 门禁 | `/speckit-analyze` | 一致性 / 性能门禁（性能测试平时不要求不执行） |
| 收单 | `/speckit-taskstoissues` | 回写 issue |

硬约束：

- **1 agent = 1 产物**；产物单向派生 `spec.md → plan.md → tasks.md → 代码`，下层只读上层产物 + 自己的 skill。
- **无 spec 不改码；plan 未过审批不动手。**
- **TDD 强制**：RED（先写失败测试）→ GREEN（最小实现）→ REFACTOR（清理）；tasks.md 每条任务必标红绿灯。
- 治理真源 `.specify/memory/constitution.md`；本仓尚未生成时，先执行 `/speckit-constitution`（可从 `LingMeowObservatory/.specify/` 复制骨架，**禁止手写**）。

## 三、spec 存放约定（本仓强制）

| 范围 | 目录 | 命名 |
|---|---|---|
| **项目级**（跨模块、治理、自举流程、MCP 契约） | `specs/`（仓根） | `NNN-<slug>` |
| **子项目级**（模块内需求） | `protostar_<module>/specs/` | `NNN-<slug>`（域内 sequential） |

- 项目级 spec 与 skills 一并**整合在 protostar 仓内**，不散落到外部目录。
- 各子项目的 spec **存储在各自的项目文件夹中**，随模块版本一同演进；不得集中到根 `specs/`。
- spec-kit 默认写入仓根 `specs/`。写子项目 spec 时**必须显式指定** `SPECIFY_FEATURE_DIRECTORY=protostar_<module>/specs/<NNN>-<slug>`，并同步 `.specify/feature.json`，避免落错目录。
- 跨模块需求：在项目级 `specs/` 建 spec，`plan.md` 内列明涉及模块与执行顺序。
- 已落地 spec **不迁移、不改名**（引用锚点）；废弃用新 spec supersede，并在原 spec 顶部标注。

模块目录：

| 模块 | 职责 | spec 目录 |
|---|---|---|
| `protostar_worker/` | 执行端 daemon：注册 / 心跳 / 节点轮询 / 图调度 / 懒分解 / 会话池 / 离线队列 / 重启恢复 / IO 流转 | `protostar_worker/specs/` |
| `protostar_cli/` | 命令行：管线 / 节点 / 会话 / 调度 / 诊断 | `protostar_cli/specs/` |
| `protostar_mcp/` | MCP server：tools + resources，agents 通用调用 | `protostar_mcp/specs/` |
| `protostar_skills/` | 项目自有 skill：agent 工作流指引 | `protostar_skills/specs/` |
| `protostar_gui/` | 前端：基于 DSH 与 CLI 的可视化与观测 | `protostar_gui/specs/` |

## 四、skills 约定

- **单一真源**：`protostar_skills/<skill-name>/SKILL.md`；frontmatter `name` 必须等于目录名，YAML 冒号后必须跟空格。
- **内容与来源**：承载 agent 运行时 skill（TDD 红绿灯、spec-kit 命令链、提交规范、issue 回写、收尾检查、懒分解工作流）；来源为原 runner 注入的 lmtech skill 中**管线专属部分** + `internal/agents/prompt.go` 固化工作流里适合以 skill 形态交付的段落。
- **形态**：不是 runner 内部执行层——runner 只把 skill 根目录注入 agent 提示词（沿用原语义）；**skill 只写流程与判定，动作统一经 `protostar_cli` 执行**（skills → CLI → worker / MCP），不内嵌实现代码。
- **与公司级 lmtech skill 的分工**：lmtech 是跨项目知识库（外部）；`protostar_skills` 是本项目知识（仓内、随代码版本走）。二者不互相复制；需要 lmtech 时按需加载。
- 新增 / 修改 skill 走 spec-kit 流程，并在 SKILL.md 记录版本。

## 五、开发纪律（摘要）

| 项 | 要求 |
|---|---|
| 治理真源 | `.specify/memory/constitution.md`（细则只在此处，本文件不复写） |
| TDD | RED → GREEN → REFACTOR，测试任务必列 |
| 干净切替 | 迁移即删 shim / 别名 / 废弃路径；不留占位、no-op 兜底、假回退 |
| 代码风格 | 注释只写「为什么」；禁止无谓抽象；ASCII 默认 |
| 提交 | LMTech 标签式 `[{Tag}] 描述`，Tag ∈ `[Add]` `[Feature]` `[Update]` `[Fix]` `[Rename]` `[Create]` `[Import]` |
| worktree | 实施阶段 `worktree/<NNN>-impl`；计划阶段不开 worktree |
| 构建 | 禁止 hack 共享构建 / 配置绕错；差异从源码侧收敛 |
| 密钥 | 只经环境变量 / 平台配置通道，不写入仓库 |

## 六、模块映射（原实现 → 本仓）

| 原实现（Go） | 本仓 |
|---|---|
| `internal/client` | `protostar_worker/client` |
| `internal/runner` | `protostar_worker/daemon` |
| `internal/scheduler` | `protostar_worker/scheduler` |
| `internal/agents` | `protostar_worker/agents` |
| `internal/session` + `internal/codex` | `protostar_worker/sessions` |
| `internal/store` | `protostar_worker/store` |
| `internal/gitea` + `internal/worktree` | `protostar_worker/gitea` / `.../worktree` |
| `internal/handler` + `internal/logic` | `protostar_worker/api` + `protostar_cli` |
| `cmd/*` | `protostar_cli` 子命令 |

## 七、索引

| 主题 | 位置 |
|---|---|
| 项目介绍 / 架构 / 机制 / 命名寓意 | `README.md` |
| 治理规范（Core Principles、工作流约束、验收标准） | `.specify/memory/constitution.md` |
| spec / plan / tasks / checklist 模板 | `.specify/templates/` |
| 当前任务产物 | `<域>/specs/<NNN>-<slug>/` |
| 项目 skills | `protostar_skills/<skill-name>/SKILL.md` |
