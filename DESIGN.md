---
name: 将明 · Protostar 设计系统（候选）
description: 冷灰蓝同色表面、柔和光影与冰蓝品牌强调。
revision: "2026-11-15T15:15:54Z"
colors:
  surface: "#EEF1F4"
  # 页面背景与全部基础控件共用 surface；高度与深度由独立材质、光影表达。

  text: "#1A3A4A"
  text-muted: "#526876"
  primary: "#2D9ED4"
  action-primary: "#1070A8"
  cyan: "#66CCFF"
  accent-violet: "#7C5FBF"
  accent-sky: "#66CCFF"
  accent-purple: "#7C5FBF"
  divider: "#A8D8F0"
darkTheme:
  surface: "#252A31"
  text: "#EEF8FF"
  text-muted: "#B6CBD8"
  divider: "#383D4D"
  action-primary: "#66CCFF"
  action-primary-dark: "#66CCFF"
  focus: "#66CCFF"
typography:
  remBase: "16px"
  display:
    fontFamily: "Inter, Noto Sans SC, PingFang SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 500
    lineHeight: 1.2
  title:
    fontFamily: "Inter, Noto Sans SC, PingFang SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "Inter, Noto Sans SC, PingFang SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  secondary:
    fontFamily: "Inter, Noto Sans SC, PingFang SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, Noto Sans SC, PingFang SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
  h3:
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: 1.4
  h4:
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.4
  h5:
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.5
  h6:
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
  caption:
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
  code:
    fontFamily: "JetBrains Mono, SFMono-Regular, Consolas, Noto Sans SC, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.8
rounded:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "18px"
  xl: "26px"
  pill: "999px"
spacing:
  1: "0.25rem"
  2: "0.5rem"
  3: "0.75rem"
  4: "1rem"
  5: "1.25rem"
  6: "1.5rem"
  8: "2rem"
  12: "3rem"
components:
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
  button-primary:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    height: "44px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
    height: "44px"
  navigation:
    textColor: "{colors.text-muted}"
    height: "44px"
  status-chip:
    typography: "{typography.label}"
---

# 将明 · Protostar 设计系统（候选）

设计修订：2026-11-15 23:15:54 UTC+8。此标记表示规范修订，不表示已批准或已完成视觉验收。

## Overview

**Creative North Star: “Neomorphism 新拟态风格”**

本系统以研发工作台为对象：让密集、可追溯的信息在柔和表面上保持清楚、可操作。新拟态是表面材质语言，不是信息架构；页面仍需通过标题、对齐、留白、文字和状态建立层级。

指定 JPEG 是重要风格参考，但不要求逐像素复刻。当前 `protostar_components` 是组件与 token 的实现基线；当局部实现与整体新拟态习惯不协调时，允许按一致的表面、光照和可访问性原则修整。DESIGN.md 定义持久系统，单页布局和内容由具体页面 brief 决定。

本文件为候选规范，等待审阅确认。浅色和暗色各使用一个背景与控件基底；暗色使用柔和环境阴影和微弱漫反射。

### Dark Theme Palette
- **暗色画布及所有基础表面**：`#252A31`；凸起与凹陷由光影表达。
- **暗色正文（text-dark / text-muted-dark）**：`#EEF8FF` / `#B6CBD8`；普通文字与实际底色对比至少 4.5:1。
- **暗色行动与焦点**：冰蓝 `#66CCFF` 用于文字、标记和焦点。

**Key Characteristics:**
- 冷灰蓝同色系画布与浮面，依靠柔和双向阴影表达层次。
- 冰蓝 `#66CCFF` 为品牌色，蓝紫与状态色用于有限的语义和图形强调。
- 4px 基阶、8px 常用节奏；卡片圆角明显大于表单控件。
- 光影补充材质，不承担可读性、交互状态或信息分组的唯一责任。

### 参考图中的新拟态特征

新拟态通过柔和光影，让组件看似从连续的背景表面浮起，或轻微压入表面；它强调简洁的数字材质和触感，而非复刻真实物体的复杂纹理。

- **近色表面**：画布、导航、卡片和控件使用相同或相近的低饱和底色，主要以明暗差异而非强边框区分层次。
- **柔和光影**：浅色主题以左上高光和右下阴影模拟统一光源，形成轻微浮雕感；阴影边缘保持模糊克制。
- **凸起与凹陷**：卡片和操作按钮可呈现浮起；输入框及按下反馈可采用轻凹效果。不同状态仍需辅以可辨的轮廓、图标或文字。
- **圆角与留白**：圆角矩形、柔和边缘和适当间距减轻视觉负担，同时保持内容分组和信息密度。
- **有限强调色**：参考图以蓝、青、紫突出操作和数据，局部渐变增加轻盈、科技化的感觉；渐变并非新拟态的必要条件。
- **简洁图标与排版**：线性图标、无衬线字体、深色正文及清晰字号层级，帮助用户在柔和表面上快速扫描信息。
- **可访问性优先**：近色表面不能削弱文字、组件边界或交互状态的辨识度；检查实际对比度、键盘焦点、选中、禁用及错误状态，并在暗色、强光和窄屏环境中验证。

色板参考 [UI handoff](docs/design/references/ui-handoff.md) 的品牌和状态色，浅色画布与控件基底统一为 `#EEF1F4`，正文 `#1A3A4A`，辅助文字 `#526876`。品牌冰蓝 `#66CCFF` 保留用于品牌图形和暗色焦点；浅色小字与选中标记使用深蓝 `#1070A8`。

Checkbox 选中使用填色与白钩；Switch 开启使用填色轨道；Radio 选中保留外环与中心点。未选表面沿用基底，焦点独立可见。Primary 按钮保留渐变文字与渐变外缘，中间表面与背景同色。

成功、警告、错误分别为 `#166534 / #854D0E / #B42318`；暗色为 `#4ADE80 / #FBBF24 / #F87171`。状态同时使用文字或图标。

暗色画布和控件基底统一为 `#252A31`；浅色阴影采用中性蓝灰 `rgba(88,105,120,.22)`。

### Named Rules
**The One Accent Rule.** 单个操作区域只突出一个主行动；蓝紫渐变和状态色不同时争夺主行动权重。

暗色字体沿用相同字族与层级，使用 rem 字号；提高正文与辅助文字在暗色底上的实际对比，不以发光或投影补足可读性。

**Display Font:** Inter 配合 Noto Sans SC（中文），回退苹方、微软雅黑及系统无衬线。
**Body Font:** 同一字族组合，正文使用 400，按钮使用 500，不靠过重中文笔画建立主次。
**Label/Mono Font:** 标签沿用无衬线；代码、ID 与日志采用 JetBrains Mono，中文回退 Noto Sans SC。不保证中英混排严格等宽。Gallery 按需加载 400/500/600 字重并使用 font-display: swap；组件包仅定义字体栈，消费方负责字体资源。

**Character:** 清楚、紧凑、适合持续审阅技术资料。页面标题不过度放大，层级以字号、字重和间距共同建立。

### Hierarchy
- **Display**（500，32px/1.2）：仅用于少量页面级焦点。
- **Title**（600，24px/1.35）：页面标题和主要区块标题。
- **Body**（400，15px/1.6）：需求、审批说明和主要阅读内容。
- **Secondary**（400，13px/1.5）：时间、辅助说明和元数据。
- **Label**（500，12px/1.4）：字段、徽章和紧凑控件标签；不得缩小到难以触读。

**The Readability Rule.** 技术标识可保持原样，但正文和状态不为模仿展示图而压缩至不可读。

## Layout

以 4px 为间距基阶、8px 为常用组织节奏；优先使用定义的 spacing scale，不在每个页面引入独立的任意间距。桌面研发工作台允许较高信息密度，但用分组、标题、列对齐与统一节奏维持扫描性。卡片不应层层嵌套；同一信息组优先用留白和分隔，而非重复加阴影。

页面使用响应式容器和 CSS Grid/Flex，而非固定画布宽度。窄屏将多列内容折为单列，隐藏或折叠非关键辅助导航，保留页面标题、当前状态、主要内容和核心操作；数据表与流程画布需采用局部滚动、折叠或专用查看方式，不能把整页缩小来塞入视口。具体断点、容器最大宽度和页面网格由实际页面验证后进入 sidecar/页面 brief，不把 Tailwind 默认断点视为已批准的 Protostar 值。

触控目标和键盘焦点必须清晰可用。布局密度不得让状态徽章、菜单标签或辅助文字相互覆盖；长标识允许断行或局部滚动。

### 可访问性验收

以下是设计与验收要求，不代表现有组件已经通过；按实际主题、背景、渐变和控件状态逐项测量，并记录结果。

- **文字对比**：普通文字相对实际背景至少 4.5:1；大号文字按适用的 WCAG 标准检查。渐变背景须检查文字所在区域最不利的颜色组合。
- **控件与状态**：识别控件及其状态所必需的视觉信息，与相邻颜色的对比至少 3:1；按 WCAG 适用例外处理禁用控件等情况。装饰性阴影不必单独达到该值，但不得是识别控件的唯一线索。边缘可辅以描边，是否达标取决于实际颜色和相邻背景，不能仅凭描边宽度判断。
- **键盘焦点**：所有可键盘操作控件须有清晰、持续且不被裁切或遮挡的焦点提示；完整字段只显示一组焦点轮廓。焦点、选中、错误等状态须有可辨信号，不能仅靠阴影方向或色相。
- **命中区域**：项目以 44×44 CSS px 作为触控目标；视觉尺寸较小的控件可通过标签或命中区域扩大实际目标。WCAG 2.2 AA 的最低目标尺寸为 24×24 CSS px，含间距等例外；44×44 属于增强标准，亦有例外。检查实际命中区域而非仅测绘制尺寸。
- **多主题检查**：分别检查浅色、暗色及实际使用的自定义主题，覆盖默认、悬停、按下、焦点、选中、禁用与错误等适用状态。灰度与轻微模糊可用于发现对颜色或弱阴影的依赖，但不能代替对比度测量和键盘操作验证。

依据：[WCAG 2.2](https://www.w3.org/TR/WCAG22/)、[非文本对比度](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)、[目标尺寸最低标准](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)和[增强标准](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html)。

## Elevation & Depth

采用同色系柔浮材质，统一左上光源：凸起表面以左上柔和受光和右下投影表达高度；凸起外缘包围的凹槽以左上内侧遮挡阴影和右下微弱反光表达深度。外缘、内影、投影和反射采用共享材质角色，按组件形状与尺寸组合，不机械复用完全相同的阴影。暗色使用低对比环境阴影与极弱漫反射，不绘制发光式白色边缘；状态轮廓与材质阴影分开表达。

布局间距与阴影分属不同规则：间距控制元素几何距离和可操作空间；阴影只表达表面高度，其模糊范围会向外扩散。相邻浮面应留出足够间隔以保持阴影可辨，但不得把阴影外扩计入布局间距，也不得用投影制造内容留白。精确 CSS 值仍需在目标视口渲染校准。

### 材质形态
- **Flat**：平整表面通过外部阴影浮起，作为卡片默认材质。
- **Convex**：左上略亮、右下略暗的曲面，当前用于 Gallery 曲率对照；次按钮保持同色基底，以外投影和边缘受光表达浮起。
- **Concave**：相反方向的柔和表面渐变表示曲率；与相对画布的凹陷深度分开，当前用于 Gallery 比较。
- **Pressed · 压入形态**：参考 [neumorphism.io](https://neumorphism.io/) 的第四种静态 Shape，同色背景叠加双向内影，与 Flat、Concave、Convex 并列。与按钮瞬时受压反馈分开：后者使用独立的紧凑外影、内侧遮挡及轻微下移。

静态组合与按钮交互反馈使用组件包主题变量。原站 Flat、Concave、Convex 均保留外投影，后两者以相反渐变表达曲率；当前 Gallery 在页面样式中绘制曲率对照，组件背景统一使用 `--neo-surface`，不提供值相同的曲率别名。字段聚焦保持 Flat。

外部亮影使用 `--neo-outer-light`，与内凹反光及边缘受光分开：浅色引用 `--neo-light` 保持原效果，暗色使用 `rgba(255,255,255,.02)`。三档 raised 阴影只降低外围反光强度，偏移、模糊、暗影及边缘高光保持不变，减少暗色白雾。

Gallery 按三个维度展示：表面形态固定同档外投影，只比较 Flat、Convex、Concave；阴影层级固定平面、尺寸与底色，只比较外投影和内影；组合与交互展示原站四种组合预设及真实控件反馈。Pressed 是平面与内影的组合预设，不作为独立曲率。Gallery 曲率对照使用局部受光渐变，不覆盖组件材质。

阴影偏移、模糊、扩散和亮度档位可参考 neumorphism.io 等工具作为探索起点；例如模糊约为偏移两倍只是经验比例，不是固定 token 或验收阈值。应按尺寸、背景和主题实际校准。材质色可与画布同色或近色，不能以完全同色作为可读性和状态辨识的前提。

### Shadow Vocabulary
- **raised**：大型工作区或主要内容容器，形成最外层浮起关系。
- **raised-sm**：KPI/内容卡片等内部承载面；层级低于外层容器。
- **raised-xs**：小型控件的紧凑外投影；未选选择控件与高光环及 inset-tight 组合，具体数值仍待主题与尺寸校准。
- **inset-tight**：集中、过渡较紧的内侧阴影，常与小型未选控件的窄高光外缘组合；名称描述视觉特征，不代表控件尺寸。
- **inset-soft**：柔和通用内影，用于静态压入组合与控件外壳；底色使用 `--neo-surface`，按钮 `:active` 使用 `--neo-button-active-shadow`。Pressed 仅保留为原站组合预设名称。
现有阴影数值仍为候选值；命名和文件结构整理不等于材质系统验收。后续视觉调整须在真实 Gallery 中校准数值，并验证不同主题、状态与视口；示例页的窄屏单列不能作为通用手机布局验收。

**The Light Source Rule.** 全界面统一左上方光源：上/左侧柔和高光，右/下侧低对比阴影。焦点、选中、错误和禁用状态仍须有独立可识别的轮廓、图标或文字。

### Dark Theme Material
暗色浮面以同色系明度差和低强度右下深影表达高度，左上漫反射保持极弱；凹槽的内侧遮挡和反光保持克制，避免黑洞与发光边缘。内凹面与容器的具体色差待渲染校准。边缘、选中、焦点和错误状态须有独立可见的结构提示；阴影不承担唯一状态信息。

## Shapes

圆角采用刻度而非按组件类别命名：组件按形状与语义选择合适的刻度，不要求所有“控件”共享同一半径。刻度和组件映射为候选规范；现有参考页实测按钮为 11px、搜索框约 17px、图标底座在窄屏为 14px，卡片为 16px/26px，说明复刻页存在断点和页面覆盖值。建议系统映射为按钮 `sm`、卡片 `lg`、大型工作区 `xl`、搜索 `pill`；Checkbox 与 Radio 分别采用小圆角和圆形。上述映射尚未作为共享组件样式实现，不能视为通过组件 gallery 的系统验证。

新拟态投影保持柔和，避免浓重描边、硬边浮雕或多重嵌套高光。流程节点、状态图形等由业务语义决定形状，不为统一外观牺牲含义。

## Components

共享组件采用可读、可修改的源码 API。Base UI 提供 Switch、Checkbox、Radio 的行为基础；Lucide React 提供通用线性图标；组件包 CSS 定义通用视觉。页面容器与业务布局仍由消费应用负责。

主题使用原始颜色及光影值构建语义变量，再由组件材质角色消费；Gallery 与应用共用同一语义来源。凸起或凹陷不单独决定交互语义：卡片可以凸起但不可点击，输入、按下和选中也须结合标签、图标、轮廓及上下文区分。

**主题与展示边界。** 组件包提供可直接引入的组件、共享材质及默认浅色和暗色主题；消费应用可覆盖语义颜色、对应前景色和材质变量。Gallery 是组件包的消费者，只负责展示、布局和主题切换，不维护第二套基础控件材质；展示值须与实际生效值一致。这是已确认的目标，现有实现尚未满足，具体 token 与光影参数须在实际渲染校准后同步本文件和 sidecar。

### Buttons
- Primary 使用同色表面、渐变文字与渐变外缘；Secondary 保留同色凸起表面；Tertiary 默认透明，悬停不加下划线。
- 文字与图标保留可访问名称，焦点使用独立轮廓；所有状态须逐项核验对比度。
- 按住时按钮和外缘一起轻微下沉，外投影收紧并适度加深边缘遮挡；松开恢复。保留独立的键盘焦点，选中态另有可辨信号，尊重 reduced-motion，不能只靠动画表达状态。

### Cards / Containers
- 同色系表面和单层柔影承载真正的内容分组。
- 内边距由页面内容密度决定；共享 card primitive 不隐式强加页面布局。

### Inputs / Fields
- 搜索可使用胶囊轮廓；较大尺寸字段默认采用整体 Flat 浮面、柔和高光边缘和外投影，图标、文字及尾部内容位于同一表面，不为原生输入元素绘制第二层独立轮廓。
- 标签、错误、禁用和焦点状态需清晰；焦点轮廓围绕完整字段，并保留原生输入行为与焦点。聚焦保持 Flat 浮起，不模拟按钮受压；输入值不能只靠颜色区分。

### Navigation
- 共享系统只定义导航项的形状、类型和激活态原则，不规定固定侧栏宽度或每页导航结构。
- 桌面可使用持久导航；窄屏导航可折叠或改为紧凑模式，但必须保留可访问名称及当前项标识。

### Switches, Checkboxes, and Radios
- 未选 checkbox、radio、switch 以窄凸起高光边缘紧接柔和内侧阴影，保持小尺寸下的材质层次和视觉情绪；可辨性仍须独立检查。
- 保留明确选中与未选中状态；Switch 以轨道/滑块位置表达状态，Checkbox/Radio 使用可辨图形标记。
- 凸起边缘及内侧遮挡遵循共享光照模型，按各控件几何形状调整，不以统一描边取代可辨状态。
- 不以投影、色差或动效作为唯一状态提示；尊重 reduced-motion。

### Swatches and Icon Tiles
- 色板可展示局部渐变；高光采用随表面渐弱的柔和反射，与共享光照方向一致，避免所有颜色叠加同一条强白亮带。不同明度和主题下的强度须实际校准。
- 图标保持一致线性风格；图标底座是可选承托，不应给所有图标机械加底板。

## Do's and Don'ts

### Do · 应当
- 使用共享语义令牌，并让页面通过令牌表达局部语义差异。
- 以 4px 基阶组织间距，优先采用 8px 节奏。
- 同时检查真实数据密度、窄屏重排、键盘焦点和控件状态。
- 保持表面光源一致，并让文字、图标和结构本身可读。
- 将示范 demo 与参考图复刻页明确区分；demo 是组件示例，不是产品模板。

### Don't · 避免
- 不把参考图中的头像、营收、用户量、活动或文案当作产品事实。
- 不把 Tailwind 默认断点、网格或颜色名未经验证地声明为 Protostar 规范。
- 不在组件、demo、GUI 中复制同一语义颜色或阴影的多份权威定义。
- 不用嵌套卡片、整面渐变或大面积投影代替信息层级。
- 不把本候选文档或静态 demo 视为 GUI 实现完成或视觉验收证明。

