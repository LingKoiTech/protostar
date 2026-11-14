# 公开来源清单

本文件是 Protostar 公开文档的来源索引。真实原始路径、旧名称与改名映射只保存在本机 `docs/temp/`；本页登记公开路径、原文基线与副本 SHA-256。公开正文使用泠鱼科技（LingKoiTech）与中性旧端代号，不保留旧主体术语。

## 一、编号与处置规则

| 分类 | 含义 | 公开处置 |
|---|---|---|
| 现行 | 当前项目需求、决定与公开资料 | 引用本仓文件，不表示能力已实现 |
| 公开整理 | 历史需求、计划、审批或执行记录的改名副本 | 按本机映射表改名并替换私有地址，其余正文逐行一致；历史审批不授权当前执行 |
| 授权摘录 | 来源已批准的有限行段 | 保留授权范围，使用公开主体与内部标识占位符，私人全文不发布 |
| 现行外部 | 外部开源项目的官方资料 | 保留项目名与官网／GitHub 引用 |

- 四份原文只保存在本机 `docs/temp/archive/`，文件名与原始字节保持。
- 四份公开整理副本在 `docs/archive/`，头部逐份注明“整理副本，改名映射见 docs/temp/mapping-<slug>.md，原文哈希 <sha256>”。本机映射路径是出处说明，不构成公开导航。
- 每份副本都有本机映射表与逐行差异清单。正文行数保持，除映射命中行外逐字一致；API 路由、字段名、状态码与需求编号逐项计数改前等于改后。
- 原文与公开 SHA-256 仅证明字节完整性；语义等价依据映射回放、逐行差异与受保护内容计数，不以哈希替代。
- 独立整理记录以整理时 PRD 版本作为依据，不冒充逐字会话或源码原件。所有资料均不构成 001 plan、001 tasks、002 spec 或后续实施批准。

## 二、S01–S07 引用编号

当前 `docs/PRD.md` 的 SHA-256 为 `4b988d339f8454a8f59054f381af174ef9d7818a4f8fad3dd5bf3109ea70bacc`。S02–S05 的原文基线对应各整理记录明确声明的“整理时 PRD 版本 SHA-256”，该依据版本在本机保存；当前正文与历史整理依据分别登记。

| 编号 | 来源 | 公开相对路径 | 原文基线 SHA-256 | 公开 SHA-256 | 分类 | 处置 |
|---|---|---|---|---|---|---|
| S01 | 001 需求总览 | [`../../specs/001-protostar-server-init-migration/spec.md`](../../specs/001-protostar-server-init-migration/spec.md) | `ab8b0db5263f7e84a2c00f78997877f01233051167d644b6dda2c8e34fd098f4` | `ab8b0db5263f7e84a2c00f78997877f01233051167d644b6dda2c8e34fd098f4` | 现行 | 本仓原生文档，两列为同一版本；Draft，等待维护者审批 |
| S02 | 产品目标与用户工作方式 | [`product-decisions.md`](product-decisions.md) | `dfa21317a5f4e91be86b19d216aa509921a4eb998bf6786c5e287e00e4b68bae` | `16e5f7ae3a9b55327c21a6ac0345e50bb88ce531bb24f0443e5a6a2ea171faaa` | 现行 | 独立整理；基线为整理时 PRD 版本 |
| S03 | 集中产品确认 | [`product-decisions.md`](product-decisions.md) | `dfa21317a5f4e91be86b19d216aa509921a4eb998bf6786c5e287e00e4b68bae` | `16e5f7ae3a9b55327c21a6ac0345e50bb88ce531bb24f0443e5a6a2ea171faaa` | 现行 | 与 S02 共用决定记录，不表示实现完成 |
| S04 | 历史实现行为摘要 | [`behavior-notes.md`](behavior-notes.md) | `dfa21317a5f4e91be86b19d216aa509921a4eb998bf6786c5e287e00e4b68bae` | `831728bd95ec81e766b657386b665ffc2a073f6a2a5f04159eabcca320aa0d70` | 公开整理 | 历史研究转述；基线为整理时 PRD，未重新运行旧系统 |
| S05 | 历史界面与会话行为摘要 | [`behavior-notes.md`](behavior-notes.md) | `dfa21317a5f4e91be86b19d216aa509921a4eb998bf6786c5e287e00e4b68bae` | `831728bd95ec81e766b657386b665ffc2a073f6a2a5f04159eabcca320aa0d70` | 公开整理 | 与 S04 共用行为记录，不冒充源码原件 |
| S06 | 四份资料整理副本 | [`../archive/`](../archive/) | 不适用（分项见下表） | 不适用（分项见下表） | 公开整理 | 每篇有独立映射、逐行差异与计数证据 |
| S07 | Hindsight、Jev、Next.js、React Flow、ECharts、MCP 官方材料 | [`../PRD.md`](../PRD.md) 第 17 节 | 不适用（外部资料） | 不适用 | 现行外部 | 保留官方引用，不表示已集成或验证 |

## 三、S06 四份资料明细

| 子编号 | 来源标记 | 公开相对路径 | 原文基线 SHA-256 | 副本新 SHA-256 | 内容与处置 |
|---|---|---|---|---|---|
| S06-A | A-LTP-02 / MB-10 | [`../archive/pipeline-prd-202605.md`](../archive/pipeline-prd-202605.md) | `ad5eb53301745b99c547cefa8f4d6696b9d0a6599fea90b51059c195d7b13f82` | `398704cadb2c65ca9f0e4861f37e11529d33213c3667ab7885b4792416a6e582` | Pipeline 需求整理副本；按映射改名，保留 API 与数据说明 |
| S06-B | A-0516-01 | [`../archive/ci-plan-20260516.md`](../archive/ci-plan-20260516.md) | `34e5256ce3affcd7c33483178b447083a229bc0d88f031a9f24b3b1615d1fc16` | `c9070116e4eadce470502fd10ab5271be61cdd08dae296d20284fbfa2f43decd` | CI 计划整理副本；公开官网引用原样保留 |
| S06-C | A-0605-06 | [`../archive/approval-20260605.md`](../archive/approval-20260605.md) | `0db1e3ecf68a51fe456ecaeadc406124db7dcc9be59593302353c8d90f268f46` | `ec652344497074f5b34fc0f0bdd6932d3ca573c5d837a8603ff5da3602e7711f` | 审批整理副本；五个内部资料地址映射为本页的历史来源占位标识，事项与原链接标签保留 |
| S06-D | B-0828-06 | [`../archive/scheduling-20260828.md`](../archive/scheduling-20260828.md) | `fa57ff01ccd39cec1bb64862dc8f03b36e8b5fcc9a55c33fc29fd3a3c73de596` | `d71d8895438f3d989ef4cc365c7f98603538f55c61de2b24dfb3569b1c0c7b37` | 调度整理副本；旧端名与内部标识按映射处理，编号与状态含义保留 |

对应本机映射和差异分别为 `mapping-<slug>.md`、`mapping-<slug>.json` 与 `diff-<slug>.md`，位于本机 `docs/temp/`。公开副本不依赖这些文件完成阅读；它们供有权访问原件的人员核对。

## 四、补充授权摘录

| 编号 | 来源 | 公开相对路径 | 原文范围 SHA-256 | 公开 SHA-256 | 分类 | 处置 |
|---|---|---|---|---|---|---|
| S08 | 总览授权条目 | [`overview-excerpt.md`](overview-excerpt.md) | `4a97191676f91a3fdf42cc6290179220d2aec0f68a9f9c04c34ac2abe75bf653` | `a55241795d539d646f863fc8e94c42e8607bfd0d04abbef2d96f6d4647af76b0` | 授权摘录 | 只含第 454–491 行与第 536–544 行，内部关联标识公开为占位符 |
| S09 | L00 授权条目 | [`planning-excerpt.md`](planning-excerpt.md) | `4aec81c26abcd0183790d6b18e1aa8cf69324f4fb56ad5271a1fef74fc13ef54` | `59297e728f977b896b74e79e1992fcf75e31c53f4c5cc63094295ca9894547b0` | 授权摘录 | 只含第 163–190 行，个人目录不公开 |

原文范围哈希按授权行段的原始字节计算，多个行段按原顺序拼接；不读取或哈希私人全文。原始文件保持原位。

## 五、历史相邻计划来源标识

以下条目只保存 S06-C 所引用的历史事项身份，原有计划正文不在本项目发布；原始地址由本机映射保存。这些来源记录不构成 Protostar 的实现需求或执行批准。

### historical-plan-1

Flutter CI 镜像构建计划。来源：A-0605-06 第 20 行的第一项计划引用。

### historical-plan-2

LoginView 开发计划。来源：A-0605-06 第 31 行的第二项计划引用。

### historical-plan-3

Logto OAuth 配置计划。来源：A-0605-06 第 42 行的第三项计划引用。

### historical-plan-4

月报生成 skill 计划。来源：A-0605-06 第 53 行的第四项计划引用。

### historical-plan-5

CHIMA 会议资料整理计划。来源：A-0605-06 第 60 行的暂缓计划引用。

## 六、许可

[`LICENSE`](LICENSE) 是来源知识库 LICENSE 的完整副本，保留 MIT 条款与原始版权声明，SHA-256 为 `c510ef344b7024118ff3294535b2cbbff1efe0921683a4dfc6b0e27023b50592`。本项目根 [`LICENSE`](../../LICENSE) 使用当前主体署名，第三方许可与来源署名不因主体规范化而删除。
