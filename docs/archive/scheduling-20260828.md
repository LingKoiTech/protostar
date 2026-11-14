> 整理副本，改名映射见 docs/temp/mapping-scheduling-20260828.md，原文哈希 fa57ff01ccd39cec1bb64862dc8f03b36e8b5fcc9a55c33fc29fd3a3c73de596。正文除映射命中行外与原文逐行一致。
>
> 本文件是历史资料 B-0828-06 的公开副本；真实原始路径保存在本机索引，原始与公开 SHA-256 见公开来源清单。历史计划与执行记录不授权当前执行；文中“✅”“🔄”“⬜”等状态只记录当时情况，不构成 001 plan、001 tasks、002 spec 或任何后续工作的批准。
>
> 导航：[公开来源清单](../sources/README.md)。

# [历史维护者项管] dsh-lmtech-plugins / 旧端 Pipeline 服务 / pipeline 平台超长程调度计划

- **日期**：2026-08-28（UTC+8）
- **主调度**：历史维护者 项管版（GLM-5.3-Flash, low）
- **纪律**：codex 尽量不介入开发；执行 session 均为 GLM-5.3-Flash low；每里程碑向 codex 汇报（session 清单 / commit sha / 回测证据）；所有决策经各项目 docs 与 issue 留档。
- **记忆**：Hindsight 未接通，本文件即跨轮记忆载体。

## 一、目标

1. dsh-lmtech-plugins gitea issues 复核（误关闭识别 + 未完成项清单）并派工完成。
2. 旧端 Pipeline 服务 issue #4：SDK demo 内存 800M → ≤100M，三模式（嵌入/性能/下载）+ 基准测试 + 决策留档。
3. pipeline 自动研发平台迭代：自动回测环节（视觉/非视觉）、旧端执行端 调度与 issue-PR 合并闭环、并发面板。
4. 纳管 session-xxxxxxxx（goal-xxxxxxxx 净室渲染布局验证）结论核对与遗留修复。
5. 持续对齐 codex：B3（压缩后约束不丢）、D3/D4（宿主层事件驱动/预取/抢占）等。

## 二、分项与验收

| # | 分项 | 验收标准 | 状态 |
|---|------|---------|------|
| 0 | 上下文与留档 | 本文件建立；lmtech skill 加载；人格核对汇报完成 | ✅ |
| 1 | gitea issues 复核 | 已关闭工单误关闭清单（ reopen/确认 结论）；未关闭工单完成度表；未完成项派工 | 🔄 |
| 2 | 旧端 Pipeline 服务 #4 内存优化 | 三模式 CLI 启动；基准测试数据（内存对比表）；决策留档 docs | ⬜ |
| 3 | pipeline 平台迭代 | 回测环节可配置（视觉/单测/lint/build）；PR 合并自动关 issue；并发面板展示项目/项目并发/总并发 | ⬜ |
| 4 | 净室渲染验证纳管 | session-xxxxxxxx 结论核对；遗留项清零；此后前端改动均有视觉回测记录 | 🔄 |
| 5 | codex 对齐 | B3/D3/D4 偏差清单 + 逐步补齐记录 | ⬜ |

## 三、执行记录

| 时间(UTC+8) | 事项 | 结果 |
|------------|------|------|
| 2026-08-28 | 阶段0：lmtech skill 加载；人格 SOUL 核对通过；Hindsight 未接通确认 | ✅ |
| 2026-08-28 | 阶段0：定位知识库根=本机知识库路径；dsh-lmtech-plugins 本地存在；gitea 凭证未在 env（后续查 legacy_pipeline_api.py 配置） | ✅ |

## 四、session 清单（执行派工）

| session | 职责 | 状态 |
|---------|------|------|
| （待派） | 阶段1 issues 复核 | ⬜ |

## 五、里程碑回填

- [ ] M1：issues 复核报告产出
- [ ] M2：issue #4 三模式实现 + 基准数据
- [ ] M3：pipeline 三能力上线（回测/合并闭环/并发面板）
- [ ] M4：净室渲染遗留清零
- [ ] M5：codex 对齐补齐 B3
