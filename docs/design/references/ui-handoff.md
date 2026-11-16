# Protostar GUI — 设计 Handoff 文档

**项目**：Protostar 研发管线平台  
**版本**：0.3.0  
**框架**：Next.js 14 App Router，TypeScript，纯 CSS（无 Tailwind）  
**路径**：`C:/Users/miao/Projects/LingKoiTech/protostar/protostar_gui/`  
**后端**：FastAPI `http://127.0.0.1:8000/api/v1`，session cookie `ps_session`

---

## 一、设计语言

### 风格
新拟态（Neumorphism）浅色系。背景为冰蓝色 `#EEF8FF`，白色卡片从背景中浮起，双侧光影（左上浅高光 + 右下蓝调阴影）创造层次感。

### 主题色
| 变量 | 值 | 用途 |
|---|---|---|
| `--canvas` | `#EEF8FF` | 页面背景 |
| `--surface` | `#FFFFFF` | 卡片/侧栏背景 |
| `--accent` | `#66CCFF` | 强调色（边框/渐变/焦点环，**不用于文字**） |
| `--accent-text` | `#1070A8` | 强调色文字（AA 对比度 5.1:1） |
| `--accent-gradient` | `135deg, #2D9ED4 → #7C5FBF` | 按钮/logo 渐变（星云蓝→紫，呼应"将明"含义） |
| `--text` | `#1A3A4A` | 主文字 |
| `--text-muted` | `#5A7A8A` | 次要文字 |
| `--success` | `#166534` | 正常/成功（PRD §14.4，7.8:1） |
| `--warning` | `#854D0E` | 警告（7.1:1） |
| `--error` | `#B42318` | 错误/离线（7.5:1） |

**深色主题**：在 `<html data-theme="dark">` 时 `--canvas: #0F172A`，`--surface: #1E293B`，状态色改为 `#4ADE80 / #FBBF24 / #F87171`（亮色系保持对比度）。切换由 `ThemeToggle` 组件写 `localStorage + data-theme`。

### 新拟态卡片
```css
background: #FFFFFF;
border-radius: 16px;
box-shadow: 6px 6px 16px rgba(102,180,220,0.18), -4px -4px 12px rgba(255,255,255,0.90);
padding: 20px 24px;
```
CSS class `.nm-card`（大）、`.nm-card-sm`（小）已定义在 `globals.css`。

### 间距与字号
```
--space-1: 4px  --space-2: 8px  --space-3: 12px  --space-4: 16px  --space-5: 20px  --space-6: 24px
--fs-title: 24px   --fs-body: 15px   --fs-secondary: 13px   --fs-label: 12px
```
圆角：`--radius-sm: 8px`、`--radius: 12px`、`--radius-lg: 16px`

---

## 二、当前布局结构

```
┌─────────────────────────────────────────────────────────────┐
│  Topbar 56px: 面包屑 | 搜索框(⌘K) | 连接状态 | 主题切换 | 头像  │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  Sidebar     │  Main content (canvas 背景)                  │
│  220px       │  padding: 28px 32px                         │
│              │                                              │
│  ✦ Protostar │                                              │
│  将明        │                                              │
│              │                                              │
│  主要功能    │                                              │
│  · 仪表盘   │                                              │
│  · 需求     │                                              │
│  · 批准     │                                              │
│  · 流程图   │                                              │
│  · 运行     │                                              │
│              │                                              │
│  操作        │                                              │
│  · 新建需求 │                                              │
│  · 登录     │                                              │
│              │                                              │
│  ──────────  │                                              │
│  M 用户      │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

**侧栏细节**：
- 分组标题：10px，`--text-faint`，大写字母间距
- 每个导航项：圆角矩形图标（28×28px，`border-radius: 8px`，每项独立颜色）+ 标签文字
- 激活态：行背景 `{color}10`（6% opacity），图标背景加深，文字加粗
- 触摸目标：内距 9px，实际高度 ≥44px
- 底部：头像圆圈 + 用户名 + 版本徽章

---

## 三、流程图页现状与目标差距

### 现状（`/pipeline`）

当前实现是自制 SVG 组件（`PipelineGraph.tsx`），使用列式网格布局，双 lane（审批/流程），三个阶段背景色块。

**视觉问题**：
1. 节点是简单圆角矩形 + 细边框，缺乏立体感
2. 颜色硬编码（`#e5e7eb`、`#94a3b8` 等），不跟随主题
3. 阶段背景色是固定 hex（`#eff6ff`、`#f0fdf4`、`#fefce8`）
4. 箭头箭头（`#94a3b8`）不够清晰
5. 整体太"图表"，不够"可交互产品"

### 目标（参考 archify HTML 风格）

archify 渲染风格特点（`docs/protostar-002.architecture.html`）：
- **深色背景 + 半透明组件**：画布是深色（`#020617`），组件用 `rgba` 半透明填充 + 彩色描边，每种类型有独立颜色
  - frontend（蓝绿）：`fill: rgba(8,51,68,0.4)`，`stroke: #22d3ee`
  - backend（绿）：`fill: rgba(6,78,59,0.4)`，`stroke: #34d399`
  - database（紫）：`fill: rgba(76,29,149,0.4)`，`stroke: #a78bfa`
  - security/gate（玫红）：`fill: rgba(136,19,55,0.4)`，`stroke: #fb7185`
  - messagebus（橙）：`stroke: #fb923c`
- **语义图标**（左上角 sigil）：每种类型有对应的小型线段 SVG 图标
- **细描边 + 半透明填充 vs 当前的白底实心**
- **连接线**：`stroke: #64748b`，粗细 1.5，箭头干净

### 对于浅色主题的调整（Protostar 用浅色）

不能直接搬 archify 深色风格，需要适配浅色主题。建议方向：
- 节点背景：`rgba({accentColor}, 0.08)`（极浅彩色填充）
- 节点描边：各类型颜色值（`#0891B2` frontend，`#059669` backend，`#7C5FBF` database，`#B42318` gate）
- 阶段背景：`rgba({color}, 0.04)` 极淡，`border: 1px dashed rgba({color}, 0.3)`
- 连接箭头：`var(--border-strong)`（`#A8D8F0`）
- 节点内语义小图标（左上角，同 archify 的 sigil 位置）
- 鼠标悬停时：描边加深、box-shadow 出现

---

## 四、待完成的 UI 任务

### P0（流程图页）
重写 `PipelineGraph.tsx` 组件：
- 把 `PHASE_COLORS` 和所有 `fill/stroke` 硬编码换成 CSS 变量
- 参照 archify 的节点风格（彩色描边 + 极浅填充 + 左上角语义图标）
- gate（菱形）节点用玫红/紫色描边，增加视觉区分度
- 箭头改用 `var(--border-strong)` 或 `var(--accent-dark)`
- 阶段背景改为极淡彩色 + 虚线边框

### P1（主题切换）
- `app/components/ThemeToggle.tsx`（已创建）接入 `layout.tsx` 顶栏
- 防闪白：在 `<html>` 上加内联脚本提前读取 `localStorage`

### P1（连接状态）
- 把顶栏写死的"已连接"换成 `app/components/ConnectionStatus.tsx`（已创建，轮询 `/health`）

### P2（NodeDetail 颜色）
- `NodeDetail.tsx` 里的 `#1e293b`、`#f1f5f9`、`#2563eb` 等换成 CSS 变量

---

## 五、文件清单

| 文件 | 作用 |
|---|---|
| `app/globals.css` | 全局 CSS 变量（浅/深色主题、间距、字号、组件类） |
| `app/layout.tsx` | 外壳：侧栏 + 顶栏 + 主内容区 |
| `app/components/SidebarNav.tsx` | 分组导航（usePathname 激活态）|
| `app/components/ConnectionStatus.tsx` | 轮询后端健康状态（已创建，待接入） |
| `app/components/ThemeToggle.tsx` | 主题切换按钮（已创建，待接入） |
| `app/components/PipelineGraph.tsx` | 流程图 SVG（**待重写**） |
| `app/components/NodeDetail.tsx` | 节点详情侧栏（颜色待换 CSS 变量） |
| `lib/pipeline.ts` | 节点类型定义和布局常量 |
| `app/pipeline/page.tsx` | Suspense 包裹（已修） |
| `app/pipeline/PipelineInner.tsx` | 流程图页逻辑（useSearchParams 在此） |

---

## 六、API 接口摘要

| 端点 | 说明 |
|---|---|
| `GET /health` | `{"status":"ok","db":"ok","worker_last_seen":null\|ISO}` |
| `POST /auth/login` | `{"username","password"}` → 设置 `ps_session` cookie |
| `GET /requirements` | 列表，支持 `?type=&priority=`，limit 200 |
| `POST /requirements` | 创建，返回含 `display_number`（PRO-N） |
| `GET /requirements/{id_or_display}` | UUID 或 PRO-N 两种格式 |
| `PATCH /requirements/{id}` | 更新 type/priority/title/scope |
| `GET /approvals/by-requirement?requirement_id=` | 三层批准状态 |
| `GET /artifacts?requirement_id=` | spec/plan/tasks 文件列表 |
| `GET /runs` | 运行列表 |
