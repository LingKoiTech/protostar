import { useState } from 'react';
import { Activity, BarChart3, Bell, CalendarDays, Check, Eye, FolderKanban, Home, Layers, LayoutGrid, Mail, Palette, Search, Settings, ShieldCheck, Star, Sun, Timer, User, Users } from 'lucide-react';
import { NeoButton, NeoCard, NeoCheckbox, NeoIconTile, NeoInput, NeoRadio, NeoRadioGroup, NeoSwatch, NeoSwitch } from '@protostar/components';
import './demo-style-guide.css';
import { GalleryHeader } from '../../components/GalleryHeader';

const traits = [[Layers, '柔和层次'], [Sun, '自然光影'], [Timer, '轻盈通透'], [LayoutGrid, '简洁直观'], [Palette, '低饱和色彩'], [Star, '未来感']] as const;
const navigation = [[Home, 'Dashboard'], [BarChart3, 'Analytics'], [FolderKanban, 'Projects'], [CalendarDays, 'Calendar'], [Mail, 'Messages'], [Check, 'Tasks'], [Users, 'Team'], [Settings, 'Settings']] as const;
const palette = ['#66CCFF', '#1070A8', '#2D9ED4', '#7C5FBF'];
const neutrals = ['#0F172A', '#1E293B', '#334155', '#DCEEF7', '#A8D8F0', '#1070A8', '#5A7A8A', '#1A3A4A'];
const initialTasks = [{ name: 'Neomorphic UI Exploration', done: true }, { name: 'Design System Update', done: true }, { name: 'User Research', done: false }, { name: 'Prototype Testing', done: false }, { name: 'Usability Review', done: false }];

function Unimplemented({ name }: { name: string }) {
  return <div className="guide-empty" aria-label={`${name} 未实现`}><span>{name} · 未实现</span></div>;
}

export function DemoStyleGuidePage() {
  const [dark, setDark] = useState(false);
  const [query, setQuery] = useState('');
  const [tasks, setTasks] = useState(initialTasks);
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const visibleTasks = tasks.filter(task => task.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <main className="guide" data-theme={dark ? 'dark' : 'light'} aria-label="新拟态参考布局组件展示">
      <GalleryHeader page="example" dark={dark} onThemeChange={setDark} />
      <section className="guide-top" aria-label="介绍与 Dashboard">
        <div className="guide-intro"><p>通过柔和的光影、浅色层次和圆角设计，在视觉上营造轻盈、舒适且富有未来感的界面体验。</p><div className="guide-traits">{traits.map(([Icon, label]) => <div key={label}><NeoIconTile><Icon aria-hidden="true" /></NeoIconTile><span>{label}</span></div>)}</div></div>
        <NeoCard className="guide-sidebar"><NeoIconTile><Layers aria-hidden="true" /></NeoIconTile><nav aria-label="参考导航布局">{navigation.map(([Icon, label], index) => <div key={label} className="guide-nav-item">{index === 0 ? <NeoButton onClick={() => document.getElementById('dashboard-title')?.scrollIntoView()}><Icon aria-hidden="true" />{label}</NeoButton> : <><Icon aria-hidden="true" /><span>{label}</span><small>未实现</small></>}</div>)}</nav><Unimplemented name="用户头像" /></NeoCard>
        <div className="guide-dashboard"><header className="guide-dashboard-head"><div><h2 id="dashboard-title">Dashboard</h2><p>共享组件布局示例</p></div><NeoInput aria-label="搜索示例任务" placeholder="Search tasks…" value={query} onChange={event => setQuery(event.target.value)} icon={<Search aria-hidden="true" />} /><NeoButton variant="tertiary" aria-label="通知未实现" disabled><Bell aria-hidden="true" /></NeoButton></header><div className="guide-kpis">{['Total Revenue', 'Users', 'Sessions', 'Bounce Rate'].map(name => <NeoCard className="guide-kpi" key={name}><h3>{name}</h3><Unimplemented name="统计与图表" /></NeoCard>)}</div><div className="guide-dashboard-bottom"><NeoCard className="guide-chart"><h3>Revenue Overview</h3><Unimplemented name="折线图" /></NeoCard><NeoCard className="guide-activity"><h3>Recent Activity</h3><Unimplemented name="活动列表" /></NeoCard></div></div>
      </section>

      <NeoCard className="guide-spec">
        <section><h2>Color Palette</h2><h3>Primary</h3><div className="guide-swatches">{palette.map(color => <div key={color}><NeoSwatch color={color} /><code>{color}</code></div>)}</div><h3>Neutral</h3><div className="guide-swatches">{neutrals.map(color => <div key={color}><NeoSwatch color={color} /><code>{color}</code></div>)}</div><h3>Gradient</h3><div className="guide-gradients">{['brand', 'blue-cyan', 'cyan-purple'].map(token => <NeoSwatch key={token} gradient={`var(--neo-gradient-${token})`} />)}</div></section>
        <section className="guide-type"><h2>Typography</h2><div className="guide-aa">Aa</div><h3>Inter / Noto Sans SC</h3><p>Regular / Medium / SemiBold</p><p>柔和表面，清晰阅读。<br />Aa Bb Cc Dd Ee Ff Gg<br />0123456789</p></section>
        <section className="guide-controls"><h2>UI Components</h2><div className="guide-control-columns"><div><h3>Buttons</h3><div className="guide-actions"><NeoButton variant="primary" onClick={() => setSaved(true)}>Primary</NeoButton><NeoButton onClick={() => setSaved(false)}>Secondary</NeoButton><NeoButton variant="tertiary" onClick={() => document.getElementById('examples-title')?.scrollIntoView()}>Tertiary</NeoButton></div><p role="status">{saved ? '示例已保存' : '\u00a0'}</p><h3>Input Field</h3><div className="guide-fields">
          <NeoInput aria-label="输入搜索示例" placeholder="Search or type…" icon={<Search aria-hidden="true" />} />
          <NeoInput aria-label="示例邮箱" defaultValue="name@example.com" type="email" trailing={<Check aria-hidden="true" />} />
          <NeoInput aria-label="示例密码" defaultValue="password" type={showPassword ? 'text' : 'password'} trailing={<button className="guide-eye" aria-label={showPassword ? '隐藏密码' : '显示密码'} type="button" onClick={() => setShowPassword(value => !value)}><Eye aria-hidden="true" /></button>} />
        </div></div><div><h3>Switch &amp; Checkbox &amp; Radio</h3><div className="guide-switches"><NeoSwitch defaultChecked aria-label="开关一" /><NeoSwitch aria-label="开关二" /></div><label className="guide-choice"><NeoCheckbox defaultChecked />Checkbox Selected</label><label className="guide-choice"><NeoCheckbox />Checkbox Unselected</label><NeoRadioGroup defaultValue="selected" aria-label="单选示例" className="guide-radios"><label className="guide-choice"><NeoRadio value="selected" />Radio Selected</label><label className="guide-choice"><NeoRadio value="unselected" />Radio Unselected</label></NeoRadioGroup></div></div></section>
      </NeoCard>

      <section className="guide-examples" aria-labelledby="examples-title"><h2 id="examples-title">UI Examples</h2><div className="guide-example-grid">{['Sales Overview', 'Calendar', 'Messages'].map(name => <NeoCard className="guide-example" key={name}><h3>{name}</h3><Unimplemented name={name} /></NeoCard>)}<NeoCard className="guide-example"><h3>Tasks</h3><ul className="guide-tasks">{visibleTasks.map(task => <li key={task.name}><label className="guide-choice"><NeoCheckbox checked={task.done} onCheckedChange={done => setTasks(current => current.map(item => item.name === task.name ? { ...item, done } : item))} />{task.name}</label></li>)}</ul>{visibleTasks.length === 0 && <p role="status">没有匹配的示例任务</p>}</NeoCard><NeoCard className="guide-example"><h3>Profile</h3><Unimplemented name="头像与用户资料" /></NeoCard></div></section>
      <div className="guide-bottom"><NeoCard className="guide-bottom-panel"><section><h2>Iconography</h2><div className="guide-icons">{[Home, LayoutGrid, BarChart3, CalendarDays, Mail, User, Bell, Settings, Eye, Layers, ShieldCheck, Star].map((Icon, index) => <NeoIconTile key={index}><Icon aria-hidden="true" /></NeoIconTile>)}</div></section></NeoCard><NeoCard className="guide-bottom-panel"><section><h2>When to Use</h2><div className="guide-usecases">{[[Settings, '系统 / 工具类应用'], [BarChart3, '数据 / 信息展示'], [Users, '效率 / 协作平台'], [Activity, '消费 / 轻量应用']].map(([Icon, label]) => { const UseIcon = Icon as typeof Settings; return <div key={String(label)}><NeoIconTile><UseIcon aria-hidden="true" /></NeoIconTile><h3>{String(label)}</h3></div>; })}</div></section></NeoCard></div>
      <footer className="guide-footer">参考布局 · 已实现区域复用 @protostar/components；空白区域标注未实现。内容仅为组件示例。<a href="/">完整组件 Gallery</a></footer>
    </main>
  );
}
