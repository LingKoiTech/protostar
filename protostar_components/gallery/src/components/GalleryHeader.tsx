import { NeoSwitch } from '@protostar/components';
import { formatRevision } from '../format-revision.mjs';
import './gallery-header.css';

declare const __COMPONENT_SOURCE__: { commit: string | null; committedAt: string | null; dirty: boolean | null };


export function GalleryHeader({ page, dark, onThemeChange }: { page: 'gallery' | 'example'; dark: boolean; onThemeChange: (dark: boolean) => void }) {
  return <header className="gallery-header">
    <div className="gallery-header-title">
      <h1>Neomorphism<span>{page === 'gallery' ? '组件 Gallery' : '新拟态风格指南'}</span></h1>
      {page === 'gallery' && <p className="gallery-revision">{__COMPONENT_SOURCE__.commit && __COMPONENT_SOURCE__.committedAt ? <>组件最近提交：<code>{__COMPONENT_SOURCE__.commit}</code> · <time dateTime={__COMPONENT_SOURCE__.committedAt}>{formatRevision(__COMPONENT_SOURCE__.committedAt)}</time></> : '提交信息不可用'}{__COMPONENT_SOURCE__.dirty && <span> · 含未提交修改</span>}</p>}
    </div>
    <nav aria-label="展示页面导航">
      <a href="/" aria-current={page === 'gallery' ? 'page' : undefined}>组件 Gallery</a>
      <a href="/example" aria-current={page === 'example' ? 'page' : undefined}>风格指南</a>
      <label><NeoSwitch checked={dark} onCheckedChange={onThemeChange} />暗色主题</label>
    </nav>
  </header>;
}
