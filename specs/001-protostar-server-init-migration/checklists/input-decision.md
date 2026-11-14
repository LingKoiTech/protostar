# 001 当前阶段输入的人工答复

本记录保留审批表单所展示的对象、问题与用户原始答复。对象正文与批准表继续保持原始字节；不向 constitution 批准栏或 bootstrap 文件写入批准人、日期、依据或范围。

## 表单对象与原始答复

| 对象 | 表单问题 | 用户原始答复 | 对象 SHA-256 |
|---|---|---|---|
| [001 spec](../spec.md) | 001 spec：是否批准当前版本作为 001 plan 的输入？ | 全部自动审批 | `ab8b0db5263f7e84a2c00f78997877f01233051167d644b6dda2c8e34fd098f4` |
| constitution 1.0.0，路径 `.specify/memory/constitution.md` | T029 constitution：是否批准当前正文？ | 全部自动审批 | `eba9bce739c500c9129328a11e562479a7e5ca84afbae07b3b9632e8e7d79ac4` |

## 表单展示的范围

> 剩余工作需要对具体版本作出人工决定。当前 001 spec 为 Draft，T029 constitution 为待批稿；现行 FR-002 要求两项分别获批后才能编写 001 plan。本次决定不批准尚未生成的 plan、tasks，也不授权合入、发布或关单。

> 批准栏继续留空，smoke 固定哈希保持原值，不写 bootstrap-approval.json。后续基线更新仍等待 T033/T034 的明确批准。

## 当前阶段使用

这两项固定版本的人工答复作为编写 001 plan 的输入依据。001 plan 的批准栏保持空白，注明待 HumanMiao 审批；plan 经审核后提交人类决定，再进入 tasks 阶段。源文件正文中的 Draft、T029 待批状态与空白批准栏保持；本记录保存此次独立答复，不改写既有文件。

smoke 的 constitution 固定基线仍为 `ce7549540fa45543cca797a150201d868e64495fdff39dc38246fb17bd4024b3`，`ProtectedFileChanged` 继续按预期差异原样记录；本记录不批准更新该基线或创建 bootstrap 批准文件。
