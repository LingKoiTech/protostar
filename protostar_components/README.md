# @protostar/components

基于参考 JPEG 的新拟态组件包，以同色系画布、左上高光和右下柔影建立层级。Input 使用整体 Flat 浮面；未选 Switch、Checkbox、Radio 以窄高光边缘和内影表达层次。Switch Thumb 单独凸起，并以相同布局边距定位于轨道两端。

色板依据 [UI handoff](../docs/design/references/ui-handoff.md) 迁移：冰蓝画布、白色浮面、蓝灰文字与蓝色强调。主渐变为 `135deg, #2D9ED4 → #7C5FBF`，文字采用独立深蓝紫渐变；暗色文字使用较亮色阶。JPEG 继续作为布局与材质参考，不再作为色值来源。

Checkbox/Radio 激活态不使用轻凹材质；未选 Switch 轨道保留轻凹材质，Thumb 的左右可见边距在轨道内等宽。色板 swatch 使用凸起双影和连续上缘白光，不做凹陷；控件材质只在本包 CSS 维护。

Switch Thumb 的定位依据布局尺寸：`translateX(track width - thumb width - 2 × track padding)`，确保两态布局边距相等；Thumb 阴影采用左右对称的柔和外扩，不再把单侧阴影偏移压向轨道边缘。

- 行为层使用 [Base UI](https://base-ui.com/)，线性图标使用 [lucide-react](https://lucide.dev/)。
- API 采用 open-code / 可组合源码组织，不运行 shadcn CLI，也不加载 shadcn 默认主题或 registry。
- 色彩、光影与组件样式由本包 `src/styles/` 维护，统一从 `src/styles.css` 引入；Gallery 负责布局、示例交互和局部曲率对照。字体栈为 Inter、Noto Sans SC 及系统回退，代码使用 JetBrains Mono 栈；消费方负责加载字体资源。
- `protostar_components/` 独立管理 pnpm workspace，仅包含组件包自身与 Gallery；Python 模块及现有使用 npm/Next 14 的 `protostar_gui` 不纳入此工作区。GUI 接入时需配置 Next `transpilePackages`，并在根布局只导入一次 package CSS。

## 视觉来源与组件 Gallery

视觉方向参考 [新拟态参考图](../docs/design/references/Neomorphism%20新拟态风格.jpg)与 [硅胶材质参考](../docs/design/references/liquid-silicone/)。本包的 `gallery/` 包含共享组件组合的风格指南和设计系统展示页，不追求像素级复刻。卡片、按钮、输入、交互控件、色板高光和图标底座的通用材质在本包 `styles.css` 中维护；根页面只组织布局与示例交互。

组件 Gallery（`/`）按 DESIGN.md 使用 Display `32px/500/1.2`、Title `24px/600/1.35` 与 H3 `18px/500/1.4`；该页按钮圆角为 8px，输入字段为 pill。映射限定在 component-gallery，示例页与组件包默认值保持独立。

本包 API 采用 shadcn 式的可读、可改源码交付思想，但未运行 shadcn CLI / generator；本包和目标 GUI 页面共同消费同一 primitives。Base UI 管开关、复选与单选行为，Lucide React 提供线性图标；具体视觉由 `styles.css` 决定。

## 安装与接入

作为 workspace 包引用：

```json
{
  "dependencies": {
    "@protostar/components": "workspace:*"
  }
}
```

安装一次样式，然后在任意页面组件里使用：

```tsx
import { NeoButton, NeoCard } from '@protostar/components';
import '@protostar/components/styles.css';

export function Example() {
  return (
    <NeoCard>
      <NeoButton variant="primary">保存</NeoButton>
    </NeoCard>
  );
}
```

对等依赖（peer）：`react` 与 `react-dom` 均支持 `^18.0.0 || ^19.0.0`。

只需要主题和材质令牌的消费者可以分别使用 `@protostar/components/theme-tokens.css` 和 `@protostar/components/material-tokens.css`，无需引入 React 组件或组件样式。两者定义 `--neo-*` 令牌；主题使用 `:where(:root)` 和 `:where([data-theme='dark'])`，材质使用 `:where(:root, [data-theme])`，保持低选择器优先级。`protostar_archify` 在生成独立 HTML 和 SVG 导出时读取这两个公开入口，并对这三个根选择器做受控转换；新增或更改选择器时需同步检查该导出适配。

## 组件

| 组件 | 渲染元素 | 说明 |
| --- | --- | --- |
| `NeoCard` | `div` | 浮起面板，无内边距，间距由使用方决定 |
| `NeoButton` | `button` | `variant`: `primary` / `secondary`（默认）/ `tertiary` / `ghost`；默认 `type="button"` |
| `NeoInput` | `div` + `input` | Flat 浮面输入框，`icon` / `trailing` 插槽，`ref` 指向原生 `input` |
| `NeoSwitch` | Base UI `Switch.Root` | 明确不接受 `children`（滑块是组件的一部分） |
| `NeoCheckbox` | Base UI `Checkbox.Root` | 选中显示渐变勾选图标 |
| `NeoRadioGroup` / `NeoRadio` | Base UI `RadioGroup` / `Radio.Root` | 单选组，选中显示渐变圆点 |
| `NeoSwatch` | `i` | 色板，`color` 写入 `--neo-swatch-color` |
| `NeoIconTile` | `div` | 图标底座 |

### NeoCard / NeoIconTile / NeoSwatch

```tsx
import { Layers } from 'lucide-react';

<NeoCard className="my-card">
  <NeoIconTile>
    <Layers aria-hidden="true" />
  </NeoIconTile>
  <NeoSwatch color="#2D9ED4" />
</NeoCard>
```

`className` 为普通字符串（这三个组件没有可选状态），内边距、间距由使用方样式决定。`NeoSwatch` 的 `style` 会与 `--neo-swatch-color` 合并。图标示例使用 `lucide-react`，请在你的应用中按需引入该依赖。

### NeoButton

```tsx
<NeoButton variant="primary" onClick={save}>保存</NeoButton>
<NeoButton variant="tertiary" aria-label="更多选项">…</NeoButton>
```

`ref` 指向原生 `<button>`。

### NeoInput

`className` 作用于外层浮面（`.neo-input-wrap`），原生属性透传给 `<input>`；`ref` 也指向 `<input>`。`icon` / `trailing` 是内容插槽，需要额外控制包装层属性时使用 `slots`：

```tsx
import { useRef } from 'react';
import { Search } from 'lucide-react';

const inputRef = useRef<HTMLInputElement>(null);

<NeoInput
  ref={inputRef}
  type="search"
  placeholder="搜索"
  aria-label="搜索"
  icon={<Search aria-hidden="true" />}
  trailing={<span className="search-hint">⌘K</span>}
  slots={{
    root: { 'data-testid': 'search-field' },
    icon: { className: 'search-icon' },
    trailing: { className: 'search-hint' },
  }}
/>
```

### 开关 / 复选 / 单选

```tsx
<NeoSwitch aria-label="通知" defaultChecked />

<NeoCheckbox aria-label="订阅邮件" defaultChecked />

<NeoRadioGroup defaultValue="compact" aria-label="密度">
  <NeoRadio value="compact" aria-label="紧凑" />
  <NeoRadio value="comfortable" aria-label="宽松" />
</NeoRadioGroup>
```

这些组件的根节点是 Base UI root，`className` 同时支持字符串与**状态函数**：

```tsx
<NeoSwitch
  aria-label="无线"
  className={(state) => (state.checked ? 'is-on' : 'is-off')}
/>
```

包装层在传入函数时会返回一个新的函数（把 `neo-*` 基类与函数返回值合并），不会把函数转成字符串；`style`、`render`、`inputRef` 等其他 Base UI 属性同样原样透传。`ref` 指向根元素。

`NeoCheckbox` 与 `NeoRadio` 的 `children` 会渲染在根节点内部，不会被静默丢弃；`NeoSwitch` 在类型层面省略了 `children`，因为滑块是固定结构。

## 工具函数

包入口同时导出两个小工具，方便自定义组件保持同样的行为：

```ts
import { cx, mergeClassName } from '@protostar/components';

cx('a', undefined, 'b'); // => 'a b'
mergeClassName('my-root', className); // className 为函数时返回新的状态函数
```

`mergeClassName` 用于自己的 Base UI 根节点，避免把状态函数字符串化。

## 设计变量

引入 `@protostar/components/styles.css` 即可使用默认浅色主题；在组件的祖先上设置 `data-theme="dark"` 可使用包内暗色主题。主题作用域也可使用 `data-theme="light"` 并覆盖语义变量。覆盖主色时同时设置对应前景色和焦点色，确保实际组合满足对比度要求：

```css
[data-theme="custom"] {
  --neo-surface: #fff;
  --neo-ink: #1a3a4a;
  --neo-muted: #1070a8;
  --neo-action-primary: #1070a8;
  --neo-action-foreground: #fff;
  --neo-focus: #1070a8;
}
```

组件背景直接使用 `--neo-surface`，不再提供值相同但名称暗示不同曲率的 `--neo-material-flat`、`--neo-material-convex`、`--neo-material-concave`、`--neo-material-inset`。已有自定义样式应改为覆盖 `--neo-surface`；曲率对照只属于 Gallery 展示。

背景和控件共用唯一基底 `--neo-surface`：浅色 `#EEF1F4`、暗色 `#252A31`，不另设 canvas、surface-high、surface-low 色阶。曲率、边缘受光与阴影分别表达形态和高度。正文与辅助文字浅色为 `#1A3A4A / #526876`，暗色为 `#EEF8FF / #B6CBD8`。品牌和状态色参考 handoff，按钮保留渐变外缘与文字。
浅色焦点使用深蓝 `#1070A8`，暗色使用冰蓝 `#66CCFF`；自定义主题按实际周围表面核验对比度。

## 在 Next.js 中使用

包内导出 TS/TSX 源码，需要让 Next 转译本包，并在根布局里引入样式：

```js
// next.config.js
/** @type {import('next').NextConfig} */
module.exports = {
  transpilePackages: ['@protostar/components'],
};
```

```tsx
// app/layout.tsx
import '@protostar/components/styles.css';
```

交互组件（`NeoButton`、`NeoInput`、`NeoSwitch`、`NeoCheckbox`、`NeoRadioGroup`、`NeoRadio`）所在模块已声明 `'use client'`，可以直接从 Server Component 导入；`NeoCard`、`NeoSwatch`、`NeoIconTile` 没有客户端指令，可以留在服务端渲染。

## 组件 Gallery

`gallery/` 是独立的 Vite 工作区，通过 `@protostar/components` 公开入口消费组件。根 `/` 展示色板、中英文字体预设、真实组件、曲率、阴影层级及组合与交互；`/example` 按参考图排列介绍、Dashboard、规范、示例与图标区域。两页共用 `GalleryHeader` 的指南标题、页面导航与主题开关。Pressed 是静态压入组合预设，按钮 `:active` 单独展示；示例注明 CSS 类、变量及用途。未实现区域留白并标注“未实现”。

```bash
# 先进入组件工作区（以下安装、开发、构建和测试命令均在此运行）
cd protostar_components
pnpm install
pnpm dev:components-gallery

# 等价写法
pnpm --filter @protostar/components-gallery dev
```

构建 Gallery：

```bash
pnpm build:components-gallery
```

### Gallery 源码提交

组件 Gallery 显示最近一次涉及 `protostar_components/` 的提交短 hash 与 committer 时间（UTC+8）。仅该目录存在已暂存、未暂存或未跟踪修改时，显示“含未提交修改”；组件 workspace 配置和锁文件也包含在此范围，其他模块不计入。

Vite 启动或构建时只读获取 Git 信息，固定于该次开发服务或构建产物；开发期间提交或修改文件后，重启服务更新标识。不使用 commit hook，不维护时间文件或手动更新命令，不关联 DESIGN.md。Git 不可用或目录没有提交记录时显示“提交信息不可用”。`/example` 不显示此信息。

## 测试

```bash
pnpm test:components
# 等价于
pnpm --filter @protostar/components test
```

测试只从包入口（`src/index.ts`，即 `@protostar/components`）导入，覆盖公开导出、可访问性与交互行为。

## 目录

```
package.json                   组件包声明与开发命令
pnpm-workspace.yaml            仅声明 gallery 工作区成员
pnpm-lock.yaml                 组件包与 Gallery 的依赖锁定
src/
  components/                  每个 primitive 一个文件
  lib/cx.ts                    className 合并（保留 Base UI 状态函数）
  index.ts                     包入口
  styles.css                   唯一样式入口，按顺序导入以下三层
  styles/themes.css            默认主题与暗色覆盖
  styles/materials.css         共享光影与材质组合
  styles/components.css        组件规则
gallery/                       独立 Vite 展示工作区
  src/main.tsx                 路由入口（/ 与 /example）
  src/components/              GalleryHeader 与其样式
  src/pages/component-gallery/ ComponentGalleryPage 与页面样式
  src/pages/demo-style-guide/  DemoStyleGuidePage 与页面样式
test/                          公开导出的行为测试
```
