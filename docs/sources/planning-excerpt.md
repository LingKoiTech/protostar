# 知识库计划授权摘录：L00 Protostar 研发平台

> **授权摘录、公开整理。** 本文件只摘录来源 S09 中已授权的 L00 条目（第 163–190 行）；其他正文没有读取、摘录或发布。真实来源路径由维护者保存在本机索引；本文件分类为历史摘录。
>
> **原始范围 SHA-256**：`4aec81c26abcd0183790d6b18e1aa8cf69324f4fb56ad5271a1fef74fc13ef54`（第 163–190 行的原始字节，不包含私人全文）。
>
> 本摘录按 Protostar 与泠鱼科技术语整理，保留当时的状态与依赖关系。分类为历史摘录，内容不表示对应能力已经实现，也不构成当前实施批准。
>
> 导航：[公开来源清单](README.md)。

### L00 Protostar 研发平台（使能泳道）

权威材料在独立仓 `protostar`（本机路径已移除）：`README.md`（定位、架构、核心机制、接口约定）、`AGENTS.md`（自举迭代、spec-kit 命令链、spec 存放约定）、`specs/001-protostar-server-init-migration/spec.md`（Status：Draft，待 HumanMiao 审批）。该仓是 AI 研发管线的执行端与通用调用层，前身是原执行端，上游为原服务端的统一节点模型；五个模块目录（worker / cli / mcp / skills / gui）为空占位；仓库已初始化，当前分支 `dev`（2026-09-09 三次提交），`specs/001-…` 尚未提交；001 计划新增 `protostar_server` 承接从原服务端独立的 Pipeline 与 PM 后端。`README.md` 与 `AGENTS.md` 仍写「尚未 `git init`」，以仓库实际状态为准。

前置：014 先完成 skill 迁移，015 再用新的 skill 与流程做初始化；015 完成后才写 001 的 plan。001 明确本阶段不写技术方案、不迁移代码、不建可运行服务。

- 015 资料交接与 Spec Kit 初始化：知识库 015 初始化记录（已并入 main `49e6f01`）
- 001 初始化 `protostar_server` 与迁移计划制定：独立仓 001 spec（本机路径已移除）

子项复用「待整理（20260909）」的原有条目，不重复登记第二份：

- [ ] 看板服务与调度服务接入 Protostar 前端（状态：需求登记，待 015 初始化与 001 审批；下一步：在 Protostar 仓 `specs/002-...`（待建）建立 spec，定义看板数据源与字段、调度动作、与 031 的入口和权限边界；首个切片只做看板与调度，其余模块迁移后置，028 填报先用该切片投入；依赖：015 初始化完成、001 spec 批、Protostar 前端入口口径）
- [ ] 原宿主组件升级对齐上游（状态：暂停，原宿主研发全面停止，需求已归入本项目其它泳道；依赖：无）
- [ ] Pipeline 与 PM 后端从原服务端独立（状态：待放行；下一步：按 001 的权威切分写进 plan；依赖：001 审批、L13 的 Protostar 前端接入口径）
- [ ] Runner 改造为 `protostar_worker`（状态：待放行，目录占位；下一步：按迁移计划承接原 runner 的注册、轮询、图调度与回传；依赖：Pipeline 与 PM 后端独立）
- [ ] 命令行改为 `protostar_cli`（状态：待放行，目录占位；下一步：定命令面与现有 CLI 的对应关系；依赖：Pipeline 与 PM 后端独立）
- [ ] 前端基于原宿主与 CLI 改造为 `protostar_gui`（状态：待放行，目录占位；下一步：复用原宿主与 Protostar 管线界面；依赖：命令行改为 `protostar_cli`）
- [ ] 准备 skills 调用 CLI 执行（状态：待放行，目录占位；下一步：按 `protostar_skills/<skill-name>/SKILL.md` 约定补齐；依赖：命令行改为 `protostar_cli`）
- [ ] 给 Agents 准备 `protostar_mcp` 供调用（状态：待放行，目录占位；下一步：按 README 的 tools 与 resources 约定实现，调用边界与 L13 对齐；依赖：命令行改为 `protostar_cli`）

外部依赖：L13 Agent 平台与协议（调用面与 OMP 工具边界）、L06 Hermes 社区（多后端会话依赖的上游版本与本地化）、L05 内部结算（agent 会话的 Token 消耗走自家中转站）。

鉴权口径：独立仓 `README.md` 的配置域与 PRD 第十五次更新均为 HMAC secret 体系（`secret_id` + `secret_key`，`runner_secret` 与 `runner_secret_audit`）；PRD 第七、八次更新的 JWT Bearer 与 `runner_token` 已被第十五次更新取代，迁移前由 001 的 plan 逐条复核后确定。

支撑范围：执行端提供图优先调度、懒分解、多后端会话（OMP / Hermes / Codex 等）、离线队列与重连对账、重启恢复、CI 节点执行与 issue 回写，为 L01、L03 至 L06、L07、L09、L13 提供 PRD → 实现 → 验证 的自动化执行与并发调度。审批真源仍是各仓 `.specify/memory/constitution.md` 与 HumanMiao，Protostar 只驱动命令链；引导期允许沿用现有执行端与服务端，退出条件写进 001 的 plan。

不阻塞声明：015 与 001 的审批是 L00 自身的前置，不构成其它泳道的开工前置。除「Pipeline 与 PM 后端从原服务端独立」需与 L13 对齐接口外，其余泳道可与 L00 并行推进；L00 的收益体现在交付吞吐，不体现在解锁。
