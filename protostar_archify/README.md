# Protostar Archify：版本锁定与样式定制研究

## 范围与状态

本目录记录固定上游基线与 Protostar 新拟态适配。独立原型按根目录 [DESIGN.md](../DESIGN.md) 的参考图主导规范更新；只改原型适配层和独立生成产物，不改 GUI、旧工作流 HTML 或 Archify 上游源码。

设计权威为根目录 [PRODUCT.md](../PRODUCT.md)、[DESIGN.md](../DESIGN.md) 及 [设计参考](../docs/design/references/)。研究记录位于集成目录；后续具体设计方案仍放在 `docs/design/`。

## 固定上游版本

2026-11-14 查询官方 GitHub `releases/latest`：最新非草稿、非预发布版本为 **v3.2.0**，发布于 2026-10-19。机器可读记录见 [upstream.lock.json](upstream.lock.json)。

| 身份 | 固定值 |
|---|---|
| 官方仓库 | https://github.com/tt-a1i/archify |
| Release | https://github.com/tt-a1i/archify/releases/tag/v3.2.0 |
| 附注标签对象 | `e62275b6373fa63436e195635835c313ce028b21` |
| 解引用后的源码 commit | `208acba8d412335185b2056fedf54b3405df43fb` |
| 上游许可证 | MIT；另需保留字体与第三方声明 |
| CLI 运行环境 | Node.js ≥18 |

锁定的是完整 commit，不是移动的 `main`，也不把 tag 对象当作源码 commit。`upstream.lock.json` 是研究／集成约定，不是现成包管理器会自动执行的依赖锁。发行 ZIP 的 SHA-256 来自 GitHub 元数据，本轮未下载 ZIP 独立复算，不声称已经校验发行包。

获取同一源码的可复现方式：

```bash
git clone --depth 1 --branch v3.2.0 --single-branch https://github.com/tt-a1i/archify.git /tmp/protostar-archify-v3.2.0
git -C /tmp/protostar-archify-v3.2.0 rev-parse HEAD
# 必须为 208acba8d412335185b2056fedf54b3405df43fb；不一致则停止使用。
```

本次临时研究副本位于上述 `/tmp` 路径，不是项目交付的一部分，也不作为后续操作的隐式依赖。

### 如何取得并运行 Archify

Archify 是上游 GitHub 仓库中的 CLI，不是本项目已安装依赖。原型脚本默认使用 `/tmp/protostar-archify-v3.2.0`；脚本每次运行都会读取锁文件并核对检出 commit。临时目录不存在时，可按上方命令克隆固定标签；也可通过 `ARCHIFY_ROOT` 指定同一 commit 的本地源码目录。无需安装 Archify skill 或复制其源码进仓库。

```bash
node protostar_archify/prototype.mjs
```

脚本从 `docs/protostar-pipeline.workflow.json` 生成独立的 `prototype.html`，通过 `@protostar/components/theme-tokens.css` 和 `@protostar/components/material-tokens.css` 两个公开 CSS 入口读取共享令牌，再内嵌本目录手写的 `neumorphism.css`。组件包是同仓源码依赖，无需安装 React 或启动 Gallery。基础颜色和材质在组件包维护；适配层负责 Archify 的变量、SVG 结构和页面映射。为兼容 SVG 导出筛选，生成器只转换三个明确约定的 `:where()` 根选择器；缺少预期选择器或出现其他 `:where()` 时停止并报错，避免静默产出错误主题。输出无需外部 CSS；脚本核对上游版本、SVG 和重复注入，重新运行从输入 JSON 和上游模板重建。

## 原型实测（2026-11-16）

- 使用锁定 Archify v3.2.0 重新生成 `prototype.html`，未改变图的内容或几何。
- Chromium 1440×1000 实际查看浅色和暗色：画布、节点、卡片与工具栏采用共享基底 `#EEF1F4`／`#252A31`；正文、辅助文字和行动色来自组件包。节点使用左上柔光与右下投影，暗色外部亮影为 `.02`，不再保留白色节点与靛紫主路径。
- 页面标题使用 24px 层级；Viewer 帮助、搜索等辅助文案使用 12px。SVG 沿用上游 authored 字号，避免仅放大文字造成节点和边标签碰撞；图内小字及缩放阅读仍是原型限制，不声明完整符合可访问性验收。
- 390×844 页面宽度为 390px，无整页横向溢出；画布保留内部滚动。底部工具栏 clientWidth 与 scrollWidth 均为 340px，全部控件可见；紧凑按钮宽度为 32px、高度至少 44px，未宣称全部达到增强的 44×44 命中标准。
- 通过键盘聚焦主题按钮，计算焦点轮廓为 2px 深蓝；Enter 成功切换暗色。浏览器运行时错误列表为空。
- 实际下载浅色、暗色 SVG；打开暗色 SVG 确认节点基底为 `#252A31`，字体栈及主题令牌保留。实际下载 PNG（544410 bytes）；未逐像素验收 PNG 或执行跨浏览器／读屏验收。
- `archify check prototype.html --json` 返回 `ok: true`，composition 0 errors／0 warnings；最低投影节点文字仍为 8px，不代表通过中文可读性验收。
- Impeccable detector 已执行，报告上游模板字号／圆角、其他预设样式、标题层级以及紫色对比度等告警；未将检测结果描述为全绿。Inter 与新拟态材质按指定基准保留；本轮不改组件包的候选令牌或上游模板结构。
- 生成入口：`node protostar_archify/prototype.mjs`。历史章节保留研究背景；本节为当前适配的验证记录。

### Classic 图例与边标签

- 2026-11-16：classic 的四种图例色块与对应节点轮廓使用同一语义颜色：Agent 逻辑为行动蓝、策略为正文色、工具操作为紫色、上下文／追踪为辅助文字色；暗色紫色与正文色混合，提高暗色下的区分度。图例与节点的计算描边已在两主题逐项核对。
- 强调边文字改用正文色和 600 字重，保留其同色遮罩及强调蓝路径；浅／暗主题均已查看。图内仍沿用上游字号和几何，可使用画布右下角“放大”逐级放大；125% 已实测，放大后画布会裁切，需平移查看。
- 暗色 SVG 实际导出后，节点、图例颜色和边文字颜色与页面一致；其他视觉预设保留上游行为，不纳入本次适配。
- 边标签此前从带 `data-edge-from` 的分组继承了 1px 描边，导致文字发粗；现在仅对路径设置描边。浏览器浅／暗主题及暗色 SVG 导出中确认边标签 `stroke: none`，强调路径仍为主题行动色。

### 文字描边观感复核

- 根因核对：SVG 文本计算样式为 `stroke: none`、`text-shadow: none`、`filter: none`；原有观感主要来自 Archify 将整张 SVG 固定设为 JetBrains Mono 等宽字体，中文由 fallback 字体混排，加上标签仅 7–11px，在缩小截图中显得像字边发毛。不是原型添加了文字描边。
- 适配层现在将 workflow SVG 及独立 SVG 导出统一覆盖为系统无衬线字体，保留文字 fill 与语义图标/节点轮廓样式，不使用 text stroke 或 text-shadow。页面与浅色 SVG 的计算字体均为同一无衬线字体栈，文字 stroke 仍为 none；PNG 导出沿用已验证的页面渲染器路径，但本次未重新逐像素比较 PNG。
- 浏览器计算样式确认阶段标签 8px、gate 组标题 7px（均为 `stroke:none`）；仍需单独处理上游小字号和过密边文字。字体修正不代表中文字号已达标，也未改 workflow 布局或文案。

## 现有文件的关系

[现有工作流源](../docs/protostar-pipeline.workflow.json) 是 schema v2 的静态图定义；[现有 HTML](../docs/protostar-pipeline.workflow.html) 标注生成器为 Archify 2.16.0。它与 `protostar_gui` 的 React 手写 SVG 为独立实现，没有自动共享渲染器或主题。

本轮使用固定 v3.2.0 CLI 对现有 JSON 执行 `validate workflow --json`：返回 `ok: true`、showcase composition 为 `pass`，0 errors／0 warnings。这只证明该输入通过当前验证器；没有重新发布旧 HTML，也没有证明升级后视觉完全相同。验证输出包含最低投影节点字号 8px，验证器通过不替代项目自己的中文可读性验收。

## 可用的样式入口

| 层级 | 上游支持与入口 | 能做什么／边界 |
|---|---|---|
| 预设 | `meta.visual_preset` | 固定枚举：`classic`、`signal-flow`、`blueprint`、`editorial` |
| 明暗主题 | Viewer 的 `data-theme`、`?theme=light`／`dark` 与主题控件 | 切换明暗，不能表达完整新拟态设计 |
| 语义类型 | 节点 type 及对应 fill／stroke 变量 | 保持节点类型、图标与语义，不应用改 type 的方式单纯换颜色 |
| CSS 变量 | `viewer/viewer.css` | 调整画布、文字、面板、节点、边、工具栏等颜色 |
| 轮廓与层次 | Viewer CSS、共享 node-card 样式、workflow SVG 输出 | 圆角、凹凸光影、线宽、类型图标与阶段表达，部分涉及 SVG 几何或过滤器 |
| 生成模板 | `viewer/template.source.html` → 生成 `archify/assets/template.html` | 改动 shell／样式后重新生成，十种图渲染器共同使用 |

### 不能直接假定存在的接口

workflow schema 的 `meta.additionalProperties` 为 false，预设又是固定枚举，不能直接写 `visual_preset: "protostar"`、`meta.css` 或 `meta.theme`。CLI 帮助没有 `--css`、`--template` 或 `--preset` 扩展参数。共享加载器直接读取 skill 内的 `assets/template.html`，没有在该调用路径提供外部模板参数。

因此，“自定义 Archify 样式”不等于给 JSON 多加几个 CSS 字段。正式新增预设需要同时检查 schema、生成的验证器、Viewer 预设名单与菜单、HTML 和 SVG 的 `data-preset`、导出路径；不应只修改一个枚举。

## 新拟态适配的推荐路径

**先保留合法 `classic` 预设，研究范围受控的 Protostar 样式层；不要第一步就扩充上游预设协议。** 这是研究建议，尚未实现或批准为最终集成方案。

1. 保留原始 JSON 为图语义权威，使用锁定渲染器产生图及可访问交互。
2. 将 DESIGN.md 的语义色映射到 Archify 的画布、文字、panel、mask、节点类型和边变量，分别限定浅色与深色选择器。
3. 区分 HTML 容器和 SVG 节点：容器可用 `box-shadow`；SVG 节点需要适用的滤镜／描边规则，不能认为给 SVG rect 写普通卡片投影就等价。阴影不得改变点击语义、遮挡箭头或被 viewBox 裁剪。
4. 检查 workflow 注入 SVG 的 `node-card-style.mjs`。它使用带 `data-node-ui`、`data-preset` 和主题条件的选择器；仅覆盖 `.c-backend` 可能被更高优先级规则覆盖，深色规则还会用 `color-mix()` 重算填充。
5. 保留节点 ID、`data-node-*`、`data-edge-*`、ARIA 与键盘交互，样式调整不能破坏聚焦、路径追踪和导出快照。
6. 将定制作为可重复生成的一步或固定源码补丁管理，避免每次生成后人工修改 HTML。若需修改上游，遵循 Viewer 源文件 → 生成模板的单一维护路径，并保留 MIT／第三方声明。

### 两种实际落点的取舍

| 方案 | 优点 | 风险 |
|---|---|---|
| 生成后确定性写入内嵌样式 | 不改上游协议；补丁较小、适合先验证视觉映射 | 需管理选择器优先级和模板变化；必须在导出前纳入样式收集，并重新检查最终产物；本轮未实现该流程 |
| 固定上游源码并维护 Viewer 样式补丁 | 对 shell、节点及导出路径控制更完整 | 需要获取完整源码，因为发行包不含仓库根 Viewer 维护源；维护升级补丁及生成物新鲜度 |

只在宿主 GUI 外层套 CSS 不能保证 iframe 内的独立 HTML 跟随主题；父页面样式不会跨 iframe 自动继承。若采用嵌入，明暗同步、选中事件与业务状态需要独立设计，不能把 Archify 的静态 authored 图误认为已有运行状态绑定。

## 导出与重新生成的边界

- HTML 重新生成会重新套用模板，不保留手工后改的样式。
- SVG 下载会内嵌主题；栅格、分享卡与录制导出会在宿主 CSS 后锁定当前主题变量。
- 样式规则筛选、顺序和跨域样式表可读性影响导出。外部 CSS 在页面看起来正确，并不证明 PNG／SVG 会保真。

- 导出样式收集器按选择器前缀筛选：`svg`、`:root`、`[data-theme`、`[data-preset`、`.c-`、`.t-`、`.a-`、`.m-` 等。自定义类名若不匹配，可能页面生效但 SVG 导出丢失；定制应沿用这些前缀并实际验收导出。证据为固定版本 `archify/assets/template.html:6307`。
- 凹凸光影、CSS 变量、`color-mix()` 与 SVG filter 应分别核验页面和导出文件；页面截图通过不能替代导出验证。
- 后续正式实现至少应检查浅／深主题、窄屏、键盘、节点选中／路径高亮、SVG 和 PNG 导出。不要用关闭校验或省略导出来掩盖适配问题。

预设协议补充：workflow 的枚举在 `common.schema.json` 与 `workflow.schema.json` 有重复定义，并编译进入 `generated-validators.mjs`。explainer 使用单独的 `meta.style`（clean／editorial／product／swiss），不能与 diagram 的 `visual_preset` 混用。新增正式预设还需同步菜单、本地化及生成的验证器；维护源应修改 `viewer/`，不能直接把生成模板作为第二编辑源。

## 本轮实际验证

执行了固定版本 CLI 的 `--help`，以及对现有 JSON 的 `validate workflow --json`，均成功。未安装 npm 依赖，未修改上游，未生成定制主题，未进行浏览器或导出验收。没有运行上游测试／构建，因为本轮交付为版本锁定与源码研究。

## 固定提交证据

以下链接均固定到本次 commit，避免后续 main 变化造成研究漂移：

- [workflow schema：meta 与预设](https://github.com/tt-a1i/archify/blob/208acba8d412335185b2056fedf54b3405df43fb/archify/schemas/workflow.schema.json#L25-L73)
- [共享 CLI：模板读取与输出](https://github.com/tt-a1i/archify/blob/208acba8d412335185b2056fedf54b3405df43fb/archify/renderers/shared/cli.mjs#L86)
- [共享节点卡片样式](https://github.com/tt-a1i/archify/blob/208acba8d412335185b2056fedf54b3405df43fb/archify/renderers/shared/node-card-style.mjs)
- [workflow 编译器：节点输出](https://github.com/tt-a1i/archify/blob/208acba8d412335185b2056fedf54b3405df43fb/archify/renderers/workflow/workflow-compiler.mjs#L5424)
- [Viewer CSS](https://github.com/tt-a1i/archify/blob/208acba8d412335185b2056fedf54b3405df43fb/viewer/viewer.css)
- [Viewer shell：预设名单与主题](https://github.com/tt-a1i/archify/blob/208acba8d412335185b2056fedf54b3405df43fb/viewer/template.source.html#L764)
- [Viewer 维护与导出契约](https://github.com/tt-a1i/archify/blob/208acba8d412335185b2056fedf54b3405df43fb/viewer/README.md#L1-L98)
- [官方包的运行环境与许可证声明](https://github.com/tt-a1i/archify/blob/208acba8d412335185b2056fedf54b3405df43fb/archify/package.json)
