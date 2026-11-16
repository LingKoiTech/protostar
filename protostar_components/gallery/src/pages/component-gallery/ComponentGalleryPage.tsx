import { useState } from 'react';
import { Check, Search } from 'lucide-react';
import './component-gallery.css';
import { GalleryHeader } from '../../components/GalleryHeader';
import { NeoButton, NeoCard, NeoCheckbox, NeoInput, NeoRadioGroup, NeoRadio, NeoSwatch, NeoSwitch } from '@protostar/components';

const colors = [
  ['品牌冰蓝', '#66CCFF', '品牌图形与暗色焦点，不用于浅色小字'],
  ['文字蓝', '#1070A8', '强调文字与浅色选中'],
  ['星云蓝', '#2D9ED4', '品牌渐变起点'],
  ['星云紫', '#7C5FBF', '品牌渐变终点'],
];
const neutrals = [
  ['统一基底', '#EEF1F4', '#252A31'],
  ['正文', '#1A3A4A', '#EEF8FF'], ['辅助文字', '#526876', '#B6CBD8'],
  ['成功', '#166534', '#4ADE80'], ['警告', '#854D0E', '#FBBF24'], ['错误', '#B42318', '#F87171'],
];

export function ComponentGalleryPage() {
  const [dark, setDark] = useState(false);
  return (
    <main className="system-page" data-theme={dark ? 'dark' : 'light'}>
      <GalleryHeader page="gallery" dark={dark} onThemeChange={setDark} />

      <section className="system-section" aria-labelledby="color-heading">
        <h2 id="color-heading">01 · 色彩与角色</h2>
        <div className="color-grid">{colors.map(([name, color, role]) => <article className="color-item" key={name}><NeoSwatch color={color} className="system-swatch" /><div className="color-copy"><strong>{name}</strong><code>{color}</code><span>{role}</span></div></article>)}</div>
        <div className="neutral-grid">{neutrals.map(([name, light, night]) => <article className="neutral-item" key={name}><NeoSwatch color={dark ? night : light} className="system-neutral-swatch" /><span>{name}</span><code>{dark ? night : light}</code></article>)}</div>
        <p className="reference-control-note">成功、警告、错误色（含暗色主题）来自 UI handoff 迁移：<code>docs/design/references/ui-handoff.md</code>。</p>
        <div className="gradient-presets"><div><NeoSwatch gradient="var(--neo-gradient-brand)" /><strong>星云蓝 → 紫 · 主渐变</strong></div><div><NeoSwatch gradient="var(--neo-gradient-blue-cyan)" /><strong>星云蓝 → 冰蓝</strong></div><div><NeoSwatch gradient="var(--neo-gradient-cyan-purple)" /><strong>冰蓝 → 紫</strong></div></div>
      </section>

      <section className="system-section" aria-labelledby="surfaces-heading">
        <h2 id="surfaces-heading">02 · 表面形态</h2>
        <div className="material-physics">
          <h3>光照与材质模型</h3>
          <p>以统一左上光源模拟液态硅胶的柔润触感。这是视觉近似，不是严格的物理渲染；曲率、相对背景的高度与交互状态分别控制。</p>
          <div className="material-physics-table"><table><thead><tr><th scope="col">组成</th><th scope="col">物理含义</th><th scope="col">CSS 角色</th></tr></thead><tbody>{[
            ['同色基底', '背景与控件共用唯一基底色，明暗变化表达受光，不另设高低浮面颜色。', '--neo-surface'],
            ['表面曲率', '组件底面统一使用同一表面色；曲率对照由 Gallery 受光渐变呈现，不代表更换基底色。', '--neo-surface'],
            ['外部暗影', '凸起部分遮挡光线，向右下投影，表达相对背景的高度。', '--neo-shadow-color / --neo-raised / --neo-raised-sm / --neo-raised-xs'],
            ['外部反光', '左上侧微弱的环境受光；暗色降低强度，避免外围白雾。', '--neo-outer-light（暗色白色 2%）'],
            ['边缘受光', '圆润边缘朝向光源，形成窄而柔和的亮部。', '--neo-rim-highlight / --neo-highlight-edge / --neo-raised-control-edge'],
            ['内侧遮挡与反光', '凹入表面左上受遮挡，右下保留微弱反光；与外部亮影独立。', '--neo-rim-inner-shadow / --neo-shadow-color / --neo-light / --neo-inset-tight / --neo-inset-soft'],
            ['受压反馈', '按钮下沉 1px，外投影收紧，并保留边缘受光和内侧遮挡。', '.neo-button:active:not(:disabled) / --neo-button-active-shadow'],
          ].map(([part, meaning, css]) => <tr key={part}><th scope="row">{part}</th><td>{meaning}</td><td><code>{css}</code></td></tr>)}</tbody></table></div>
          <ul><li>统一左上光源；曲率与高度分开，凹曲面也可以浮在背景之上。</li><li>暗色沿用同一光源，单独降低外围反光，保留可辨的边缘与内凹细节。</li><li>交互标识独立于材质：焦点轮廓、Checkbox 填色白钩、Radio 外环、Switch 开启填色与 Primary 渐变保留各自规则。</li></ul>
        </div>
        <h3 className="material-subheading">曲率对照</h3>
        <p className="material-intro">固定尺寸、底色和中浮面投影，只比较表面曲率。明暗渐变模拟受光，不代表更换基底色。</p>
        <div className="material-grid curvature-grid">
          <article className="material-specimen"><div className="material-sample curvature-flat"><strong>Flat · 平面</strong></div><p>Gallery：<code>.curvature-flat</code><br />底色：<code>--neo-surface</code><br />投影：<code>--neo-raised-sm</code></p><p>均匀底色；表面保持平整，常用于内容区与输入字段。</p></article>
          <article className="material-specimen"><div className="material-sample curvature-convex"><strong>Convex · 凸曲面</strong></div><p>Gallery：<code>.curvature-convex</code><br />底色：<code>--neo-surface</code><br />投影：<code>--neo-raised-sm</code></p><p>左上亮、右下暗，模拟向外鼓起的曲率。</p></article>
          <article className="material-specimen"><div className="material-sample curvature-concave"><strong>Concave · 凹曲面</strong></div><p>Gallery：<code>.curvature-concave</code><br />底色：<code>--neo-surface</code><br />投影：<code>--neo-raised-sm</code></p><p>左上暗、右下亮，模拟向内弯曲；保留同档外投影。</p></article>
        </div>
        <div className="shadow-study">
          <h3>阴影层级</h3>
          <p>相同底色与尺寸，只比较阴影；外投影表达高度，内阴影表达凹入深度。</p>
          <div className="shadow-grid">{[
            ['raised', '大浮面', 'NeoCard 默认容器；按钮悬停时的外投影。Gallery 的组件面板会覆盖为中浮面。'],
            ['raised-sm', '中浮面', '按钮默认态、输入字段、图标底座、色板与 Convex；选择控件外壳的外投影。'],
            ['raised-xs', '小浮面', '未选 Checkbox、Radio、Switch 的紧凑外投影，与集中内影组合。'],
            ['inset-tight', '集中内影', 'Concave 材质；未选 Checkbox、Radio、Switch 的内侧遮挡。'],
            ['inset-soft', '柔和内影', 'Pressed 静态压入形态与选择控件外壳的内影；按钮交互使用独立的 active 阴影。'],
            ['button-active-shadow', '按钮受压', '按钮 :active：收紧外投影 + 内侧遮挡 + 高光边缘；属于交互组合，不是额外高度档位。'],
          ].map(([token, name, usage]) => <article className="shadow-specimen" key={token}><div className={`shadow-sample shadow-sample--${token}`} aria-hidden="true" /><h4>{name}</h4><code>{`--neo-${token}`}</code><p>Gallery：<code>{`.shadow-sample--${token}`}</code></p><p>{usage}</p></article>)}</div>
        </div>
        <div className="shadow-study">
          <h3>组合预设</h3>
          <p><a href="https://neumorphism.io/">neumorphism.io</a> 的四种 Shape 是曲率与阴影的组合预设。以下是相同尺寸的组合对照，不改写组件默认材质。</p>
          <div className="material-grid preset-grid">{[
            ['Flat', 'curvature-flat', '平面 + 中浮面外投影'],
            ['Convex', 'curvature-convex', '凸曲面 + 中浮面外投影'],
            ['Concave', 'curvature-concave', '凹曲面 + 中浮面外投影'],
            ['Pressed', 'preset-pressed', '平面 + 柔和内影'],
          ].map(([name, material, description]) => <article className="material-specimen" key={name}><div className={`material-sample ${material}`}><strong>{name}</strong></div><p>Gallery：<code>{`.${material}`}</code><br />底色：<code>--neo-surface</code><br />阴影：<code>{name === 'Pressed' ? '--neo-inset-soft' : '--neo-raised-sm'}</code></p><p>{description}</p></article>)}</div>
        </div>
        <div className="surface-composition">
          <div className="surface-composition-copy"><h3>按钮交互</h3><p>按住鼠标或聚焦后按住空格，观察真实 NeoButton；松开恢复。</p><dl><dt>默认</dt><dd><code>.neo-button</code>：<code>--neo-surface</code> + <code>--neo-raised-sm</code> + <code>--neo-highlight-edge</code>。</dd><dt>悬停</dt><dd><code>.neo-button:hover:not(:disabled)</code>：<code>--neo-raised</code> + <code>--neo-highlight-edge</code>。</dd><dt>按住</dt><dd><code>.neo-button:active:not(:disabled)</code>：下移 1px，使用 <code>--neo-button-active-shadow</code>。</dd><dt>焦点</dt><dd><code>.neo-button:focus-visible</code>：<code>--neo-focus</code> 轮廓。</dd></dl></div>
          <div className="button-study__actions"><NeoButton>按住查看受压效果</NeoButton></div>
        </div>
        <div className="surface-composition">
          <div className="surface-composition-copy"><h3>字段组合</h3><p>外层承托、字段浮面和键盘焦点分别表达不同信息。</p><dl><dt>承托容器</dt><dd><code>.neo-card.field-demo-host</code>：Gallery 使用 <code>--neo-surface</code> + <code>--neo-raised-sm</code> + <code>--neo-highlight-edge</code>。</dd><dt>输入字段</dt><dd><code>.neo-input-wrap</code>：<code>--neo-surface</code> + <code>--neo-raised-sm</code> + <code>--neo-raised-control-edge</code>；<code>.neo-input</code> 不另加阴影。</dd><dt>聚焦反馈</dt><dd><code>.neo-input-wrap:focus-within</code>：<code>--neo-focus</code> 轮廓环绕完整字段，保持 Flat。</dd></dl></div>
          <NeoCard className="field-demo-host"><label className="field-label">搜索需求<NeoInput aria-label="输入字段表面示例" placeholder="输入编号或标题" icon={<Search aria-hidden="true" />} /></label><p>点击字段或使用 Tab 查看完整焦点轮廓。</p></NeoCard>
        </div>
      </section>
      

      <section className="system-section type-section" aria-labelledby="type-heading">
        <h2 id="type-heading">03 · 字体</h2>
        <p className="type-intro">中文使用 Noto Sans SC，英文使用 Inter；代码使用 JetBrains Mono，中文注释回退 Noto Sans SC。标题标签表达文档结构，以下展示对应的视觉预设。</p>
        <div className="type-catalog">{[
          ['h1', 'H1 · 页面标题', '32px / 500 / 1.2', '审阅需求，清晰决策', 'Review requirements with clarity.'],
          ['h2', 'H2 · 区块标题', '24px / 600 / 1.35', '需求与审批', 'Requirements and approvals'],
          ['h3', 'H3 · 分组标题', '18px / 500 / 1.4', '待审阅的产物', 'Artifacts awaiting review'],
          ['h4', 'H4 · 内容标题', '15px / 600 / 1.4', '构建执行记录', 'Build execution records'],
          ['h5', 'H5 · 紧凑标题', '13px / 600 / 1.5', '当前任务详情', 'Current task details'],
          ['h6', 'H6 · 小标题', '12px / 600 / 1.4', '关联资料', 'Related resources'],
          ['body', 'Body · 正文', '15px / 400 / 1.6', '查看需求、审批与运行证据，确认下一步操作。', 'Review requirements, approvals, and run evidence to decide what comes next.'],
          ['secondary', 'Secondary · 辅助文字', '13px / 400 / 1.5', '显示产物版本与最近更新时间。', 'Shows the artifact version and last updated time.'],
          ['caption', 'Caption · 图注', '12px / 400 / 1.4', '图示为组件材质对照。', 'Component material comparison.'],
          ['label', 'Label · 字段标签', '12px / 500 / 1.4', '需求标题', 'Requirement title'],
          ['code', 'Code · 代码与标识', '14px / 400 / 1.8', '// 审批通过后执行', 'PRO-128 · const approved = true;'],
        ].map(([preset, name, metrics, chinese, english]) => <article className="type-row" key={preset}><div className="type-meta"><strong>{name}</strong><code>{`.type-preset--${preset}`}</code><span>字号 / 字重 / 行高</span><code>{metrics}</code><span>{preset === 'code' ? 'JetBrains Mono · 中文回退 Noto Sans SC' : 'Noto Sans SC / Inter'}</span></div><p className={`type-preset type-preset--${preset}`} lang="zh-CN">{chinese}</p><p className={`type-preset type-preset--${preset}`} lang="en">{english}</p></article>)}</div>
        <div className="type-links"><a href="https://fonts.google.com/noto/specimen/Noto+Sans+SC">Noto Sans SC</a><a href="https://rsms.me/inter/">Inter</a><a href="https://www.jetbrains.com/lp/mono/">JetBrains Mono</a></div>
      </section>

      <section className="system-section" aria-labelledby="components-heading">
        <h2 id="components-heading">04 · 真实组件</h2>
        <NeoCard className="component-panel system-buttons"><h3>按钮</h3><div className="button-stack"><NeoButton variant="primary">Primary</NeoButton><NeoButton>Secondary</NeoButton><NeoButton variant="tertiary">Tertiary</NeoButton><NeoButton variant="primary" disabled>Primary</NeoButton><NeoButton disabled>Secondary</NeoButton><NeoButton variant="tertiary" disabled>Tertiary</NeoButton></div></NeoCard>
        <div className="component-grid">
          <NeoCard className="component-panel"><h3>字段</h3><label className="field-label">搜索需求<NeoInput aria-label="搜索需求示例" placeholder="编号或标题" icon={<Search aria-hidden="true" />} /></label><label className="field-label">负责人<NeoInput defaultValue="项目审批人" trailing={<Check aria-hidden="true" />} /></label></NeoCard>
          <NeoCard className="component-panel"><h3>Checkbox</h3><label className="choice-row"><NeoCheckbox defaultChecked />已选</label><label className="choice-row"><NeoCheckbox />未选</label><label className="choice-row"><NeoCheckbox disabled />不可用</label></NeoCard>
          <NeoCard className="component-panel"><h3>Switch</h3><label className="choice-row"><NeoSwitch defaultChecked />启用通知</label><label className="choice-row"><NeoSwitch />自动摘要</label><label className="choice-row"><NeoSwitch disabled />不可用</label></NeoCard>
          <NeoCard className="component-panel"><h3>Radio</h3><NeoRadioGroup defaultValue="comfortable" aria-label="显示密度" className="radio-list"><label className="choice-row"><NeoRadio value="comfortable" />舒适</label><label className="choice-row"><NeoRadio value="compact" />紧凑</label><label className="choice-row"><NeoRadio value="disabled" disabled />不可用</label></NeoRadioGroup></NeoCard>
        </div>
      </section>
    </main>
  );
}
