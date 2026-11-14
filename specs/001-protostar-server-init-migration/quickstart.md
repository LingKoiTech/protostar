# Quickstart: 001 文档级验收

**Status**: 随 [plan.md](plan.md) 一并待 HumanMiao 审批。

**用途**: 验证 001 的规划产物是否完整、可追溯、链接有效，并且没有把规划写成实现。本指南只做文档核对，不是产品安装、启动或运行指南；产品验收属于 002 起的实施 spec。

## 1. 前置条件

| 条件 | 说明 |
|---|---|
| 工作位置 | 仓库根目录；所有路径为仓内相对路径 |
| 工具 | PowerShell 5 及以上；Python 3 与 `markdown-it-py`（公开文档检查所需）；Markdown 阅读器或编辑器 |
| 产品依赖 | 无需产品依赖；验证环境须已有 Python 与 `markdown-it-py`。本机校验脚本、原件与授权摘录只在有权限环境使用；公开仓读者可按文档字段人工核对 |
| 权限 | 输入只读；仅将命令 stdout 保存为指定本机证据；不修改 spec、constitution、保护基线、公开副本或原件 |
| 执行者 | 常规 task agent 按本指南执行；主线程审核结果并决定是否接受；不得自行修改基线或证据输入 |

## 2. 检查项与预期结果

| 编号 | 检查 | 方法 | 预期结果 |
|---|---|---|---|
| Q1 | 输入版本一致 | 对 001 spec 与 constitution 计算 SHA-256，与 [plan.md](plan.md) §13 及 [input-decision.md](checklists/input-decision.md) 比较 | spec 为 `ab8b0db5263f7e84a2c00f78997877f01233051167d644b6dda2c8e34fd098f4`；constitution 为 `eba9bce739c500c9129328a11e562479a7e5ca84afbae07b3b9632e8e7d79ac4`；两项均一致 |
| Q2 | 产物存在与状态 | 核对本目录文件清单；打开 plan 的状态与批准栏 | 存在 `plan.md`、`research.md`、`data-model.md`、`quickstart.md`、`contracts/migration-plan.md`；`tasks.md` 不存在；plan 状态为待 HumanMiao 审批；批准人、日期、范围、依据为空 |
| Q3 | 六模块矩阵完整 | 在 [contracts/migration-plan.md](contracts/migration-plan.md) 中核对 §2–§7 的六个模块表 | 6 个模块；每模块 11 行；合计 66 行；空白单元格 0；每行含来源链接或“无本仓代码”说明，并含版本引用 |
| Q4 | FR／SC 覆盖 | 核对 [plan.md](plan.md) §10 的两张表 | FR-001–FR-014 共 14 行；SC-001–SC-007 共 7 行；每行有对应章节或文件；缺项 0 |
| Q5 | 链接完整 | 运行公开文档检查，或逐条核对 Markdown 链接 | 无 `BrokenNavigation`、`CrossRepositoryNavigation`、`IgnoredNavigation`、`AbsoluteNavigation`；未来 spec 路径与未创建模块路径只以纯文本出现 |
| Q6 | 公开边界 | 公开文档检查的术语、地址与标识项；人工复核措辞 | 无旧主体术语、私有主机、个人绝对路径、真实会话或任务标识、凭据值；无指向本机忽略目录的链接 |
| Q7 | 计划阶段状态 | 运行公开文档检查的 planning 阶段；读取 JSON 的 `status`、`phase`、`issues` | `phase` 为 `planning`；`issues` 必须恰为一项 `{"kind":"ProtectedFileChanged","file":"constitution.md"}`；`status` 为 `FAIL`、退出码为 1，按预期待批记录；不得出现其他 issue |
| Q8 | 无实现性断言 | 人工检索 plan 与扩展产物中的“已实现”“已运行”“已发布”等措辞 | 仅出现在“不得这样写”或未来条件中；001 没有任何产品能力完成声明 |
| Q9 | 证据记录 | 按 §4 字段记录本地证据 | 每项有命令或核对方式、日期、结果、范围、审核人；证据保存到指定本机位置，不进入公开导航 |

## 3. 命令与结果读取

### 3.1 输入哈希

```powershell
Get-FileHash -Algorithm SHA256 -Path specs/001-protostar-server-init-migration/spec.md, .specify/memory/constitution.md
```

比较 `Hash` 字段与 §2 Q1 的值。哈希只证明当前字节与输入记录一致；它不证明治理批准、计划批准或产品能力。

### 3.2 公开文档检查（planning）

```powershell
python docs/temp/checks/stage1-public-documents-smoke.py <本机知识库根路径> --phase planning
```

说明：`<本机知识库根路径>` 是调用参数，公开文档不记录其实际值；该脚本位于本机忽略目录，不属于公开导航。脚本从仓库根解析文档并输出 JSON。

结果读取：

| 字段 | 说明 |
|---|---|
| `phase` | 必须为 `planning`；本阶段不使用 publication 阶段 |
| `status` | 有 issue 时为 `FAIL`、退出码 1；本阶段的唯一预期 issue 见下行 |
| `issues` | 必须恰为 `[{"kind":"ProtectedFileChanged","file":"constitution.md"}]`；`status` 为 `FAIL`、退出码 1。出现其他 issue 或对象不符时停止并报告，不修改基线、不删除证据 |
| `counts` | 核对文档数、本地导航数与外部导航数；不要求固定数值，但异常下降需说明 |
| `manifest` | 核对公开副本的公开哈希记录；本计划不新增、不改写副本 |

结果 JSON 的 canonical 位置（纯文本，不构成公开导航）：

- planning：`docs/temp/checks/automation-ready-publication.json`；终稿 planning 结果覆盖此文件。
- publication：`docs/temp/checks/strict-public-documents-result.json`；这是 T029 写入与 plan 创建前的 snapshot，本阶段不重跑默认 publication。
- 副本等价：`docs/temp/checks/strict-copy-equivalence-result.json`；本阶段不重算。

本阶段只按 planning 结果核对；不重跑 publication，不重算副本等价，不更新 constitution 保护基线。`ProtectedFileChanged` 是已知的预期待批项，记录为“待批准差异”，`status` 为 `FAIL`、退出码 1；不能记为通过，也不能通过改基线或重复检查消除。

### 3.3 矩阵与覆盖计数

在 [contracts/migration-plan.md](contracts/migration-plan.md) 的模块章节内，逐表核对 11 行；在 [plan.md](plan.md) §10 逐表核对 14 项 FR 与 7 项 SC。可按行阅读并记录缺项；不得以“其余类似”跳过。计数结果写入 §4 的证据记录。

### 3.4 链接核对

公开文档检查会解析相对链接并检查目标是否存在。人工复核补充三点：链接只指向已存在的仓内文件；未创建模块与 002–031 只写纯文本；外部链接只用于公开官方资料。发现失效目标时修正来源文件，不新建占位文件。

## 4. 证据记录

| 字段 | 内容 |
|---|---|
| 检查项 | Q1–Q9 的编号与名称 |
| 命令或核对方式 | 实际执行的命令，或人工核对的表与章节 |
| 日期 | 执行日期 |
| 结果 | 通过、失败或已知待批差异；附关键计数 |
| 范围 | 本次核对的产物版本与文件清单 |
| 审核人 | 主线程审核人 |
| 关联版本 | 001 plan 版本或 SHA；实施版本另记 |

输入保持只读；仅将命令 stdout 保存为指定本机证据，公开产物只保留结论与可核链接。证据不得包含私有主机、个人目录、凭据或真实会话标识。

## 5. 不适用范围

本指南不覆盖：产品安装与启动、数据库初始化、浏览器流程、OMP／Hermes／Codex 执行、OIDC 登录、知识或代码索引连接、性能测量、发布与关单。上述内容分别由 002–031 的 spec／plan／tasks 与真实运行证据验收；001 不发布功能版本，也不以本文档检查代替产品验收。
