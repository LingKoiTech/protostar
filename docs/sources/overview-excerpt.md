# 知识库总览授权摘录：Protostar 相关条目

> **授权摘录、公开整理。** 本文件只摘录来源 S08 中已授权的 Protostar 相关条目：第 454–491 行与第 536–544 行。其他正文没有读取、摘录或发布；真实来源路径由维护者保存在本机索引，私有 Gitea 链接已移除。
>
> **原始范围 SHA-256**：`4a97191676f91a3fdf42cc6290179220d2aec0f68a9f9c04c34ac2abe75bf653`（上述两个行段按行序拼接后的原始字节，不包含私人全文）。
>
> 本摘录按 Protostar 与泠鱼科技术语整理；分类为历史摘录，内容只作历史登记，不表示 Protostar 已实现对应能力，也不构成当前实施批准。
>
> 导航：[公开来源清单](README.md)。

## 一、历史 issue #8：Pipeline 模块

### [原服务端 issue #8] [Pipeline-dev] AI 驱动研发管线开发

#### Task id
TASK-REFERENCE-01

#### 外部记录
原服务端项目的 issue #8（历史记录；私有 Gitea 链接已移除）。

#### 描述
AI 驱动研发管线（P0 最优先，战略级基础设施）：Hermes 制定 PRD → Codex/autoPlan 开发 → `protostar_server` 管理管线状态 → Protostar 前端可视化。

核心设计：
- 图状 DAG 管线：pipeline_stages + stage_edges 承载阶段，task 经 pipeline_task_rel n:n 关联
- 仓库关联 B 方案（管线默认 repo/branch + 阶段覆盖，支持跨仓库）
- CI 即阶段（stage_type=ci + Gitea webhook，白名单 + X-Gitea-Signature 验签）
- PRD 审批流（0→1→2，用户/智能助手 approve）
- HMAC secret 统一认证（issue-secret 签发 + runner_secret 持久化 + 审计，复用 SignatureAuth）
- 失败重试（默认 3 次→超限暂停→人工决策）、调度分配（同机多 session + 多机）、发起方轮询 + manager 完成流转

11 张表：pipeline_main / pipeline_task_rel / pipeline_stages / pipeline_stage_edges / pipeline_history（pipeline id+stage type+stage ID 定位，JSONB）/ pipeline_schedule_log / dev_runner / dev_runner_jobs / hermes_session / runner_secret / runner_secret_audit

子任务：
| 阶段 | 内容 |
|:---:|------|
| P0-1 | 11 张表 DDL 与 DAL |
| P0-2 | pipeline API 与 CLI 扩展 |
| P0-3 | pipeline topology（拓扑排序 + 并行推断） |
| P0-4 | pipeline_task_rel n:n 关联 + 阶段 issue 关联 |
| P0-5 | 图状回滚扫描（change-check + change-decision） |
| P1-1 | `protostar_worker`（Go，runner/manager 双模式） |
| P1-2 | Dev Runner API + secret 签发/刷新/吊销 |
| P1-3 | Gitea CI 对接（CI 作为管线阶段） |
| P1-4 | `protostar_gui` 自研无限画布渲染库 |
| P1-5 | Protostar 前端管线界面 |
| P2-1 | Python 验证脚本模板 + 子需求分解流程 |

来源：历史 Pipeline PRD（约 1400 行定稿），公开副本见 [pipeline-prd-202605.md](../archive/pipeline-prd-202605.md)。

## 二、Protostar 研发平台登记

### Protostar — 未建 Issue

#### Protostar 研发平台（将明）

#### 状态
🔴 待规划（无 Gitea Issue；015 与独立仓 001 均为 Draft，待 HumanMiao 审批；知识库计划文件的「待规划」L00 为使能泳道）

#### 描述
独立项目「将明（Protostar）」为 AI 研发管线的执行端与通用调用层。正文与需求保存在独立仓 `protostar`（与知识库同级的单仓）（`README.md`、`AGENTS.md`、`specs/001-protostar-server-init-migration/spec.md`）；知识库只保留登记与索引：资料交接与 Spec Kit 初始化见知识库 015 初始化记录（已并入 main `49e6f01`），执行分工与依赖见知识库计划文件的 L00，管线历史需求见 [pipeline-prd-202605.md](../archive/pipeline-prd-202605.md)（历史 Pipeline PRD 的公开副本）。
