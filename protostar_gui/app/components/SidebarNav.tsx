'use client';
import { usePathname } from 'next/navigation';
import type { CSSProperties } from 'react';

// 内联 SVG 图标（统一 20×20，stroke 颜色继承 currentColor）
const ICONS: Record<string, JSX.Element> = {
  home: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  requirements: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  approve: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  pipeline: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/>
    </svg>
  ),
  run: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
  add: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  login: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
};

const GROUPS = [
  {
    label: '主要功能',
    items: [
      { href: '/',                 icon: 'home',         label: '仪表盘', color: '#1070A8' },
      { href: '/requirements',     icon: 'requirements', label: '需求',   color: '#7C5FBF' },
      { href: '/approvals',        icon: 'approve',      label: '批准',   color: '#166534' },
      { href: '/pipeline',         icon: 'pipeline',     label: '流程图', color: '#1070A8' },
      { href: '/runs',             icon: 'run',          label: '运行',   color: '#B45309' },
    ],
  },
  {
    label: '操作',
    items: [
      { href: '/requirements/new', icon: 'add',   label: '新建需求', color: '#7C5FBF' },
      { href: '/login',            icon: 'login', label: '登录',     color: '#1070A8' },
    ],
  },
];

function isActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/';
  if (href === '/requirements') {
    return pathname === '/requirements' ||
      (pathname.startsWith('/requirements/') && pathname !== '/requirements/new');
  }
  return pathname === href || pathname.startsWith(href + '/');
}

export default function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav style={{ flex: 1, padding: '0 10px', display: 'flex', flexDirection: 'column' }}>
      {GROUPS.map(group => (
        <div key={group.label} style={{ marginBottom: 4 }}>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--text-faint)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '10px 10px 4px',
          }}>
            {group.label}
          </div>
          {group.items.map(({ href, icon, label, color }) => {
            const active = isActive(href, pathname);
            const iconBg: CSSProperties = {
              width: 28,
              height: 28,
              borderRadius: 8,
              background: active ? color + '22' : color + '12',
              border: `1px solid ${color}${active ? '44' : '22'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: active ? color : color + 'BB',
              transition: 'all 0.15s',
            };
            return (
              <a
                key={href}
                href={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 10px',
                  borderRadius: 'var(--radius-sm)',
                  color: active ? 'var(--text)' : 'var(--text-muted)',
                  fontWeight: active ? 600 : 500,
                  fontSize: 13.5,
                  background: active ? `${color}10` : 'transparent',
                  transition: 'background 0.12s, color 0.12s',
                  textDecoration: 'none',
                  marginBottom: 1,
                }}
              >
                <span style={iconBg}>{ICONS[icon]}</span>
                {label}
              </a>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
