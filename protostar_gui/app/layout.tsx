import type { Metadata } from 'next';
import './globals.css';
import SidebarNav from './components/SidebarNav';
import ThemeToggle from './components/ThemeToggle';
import ConnectionStatus from './components/ConnectionStatus';

export const metadata: Metadata = { title: 'Protostar' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" suppressHydrationWarning>
      {/* 防闪白：首屏前从 localStorage 读取主题 */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var t = localStorage.getItem('ps-theme');
            if (t) document.documentElement.setAttribute('data-theme', t);
          } catch(e) {}
        `}} />
      </head>
      <body style={{ display: 'flex', minHeight: '100vh', background: 'var(--canvas)' }}>
        {/* Sidebar */}
        <aside style={{
          width: 'var(--sidebar-w)',
          minWidth: 'var(--sidebar-w)',
          background: 'var(--surface)',
          boxShadow: '4px 0 20px rgba(102,180,220,0.12)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 0 20px',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px 20px' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(102,204,255,0.4)',
              fontSize: 18,
              flexShrink: 0,
            }}>✦</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', letterSpacing: '-0.01em' }}>
              Protostar
            </div>
          </div>

          {/* Nav groups */}
          <SidebarNav />

          {/* User info */}
          <div style={{
            padding: '12px 16px 0',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              color: '#fff',
              fontWeight: 700,
              flexShrink: 0,
            }}>M</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              用户
            </div>
          </div>
        </aside>

        {/* Main wrapper — topbar + content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

          {/* Topbar — PRD §14.1 */}
          <header style={{
            height: 'var(--topbar-h)',
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            gap: 16,
            flexShrink: 0,
            boxShadow: '0 1px 8px rgba(102,180,220,0.08)',
          }}>
            {/* Left: breadcrumb placeholder */}
            <div style={{ flex: 1, fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>
              Protostar
            </div>

            {/* Center: search hint */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--surface-inset)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '6px 14px',
              fontSize: 13,
              color: 'var(--text-faint)',
              cursor: 'pointer',
              minWidth: 200,
              boxShadow: 'var(--shadow-nm-inset)',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              搜索…
              <kbd style={{ marginLeft: 'auto', fontSize: 10, background: 'var(--border)', borderRadius: 4, padding: '1px 5px', color: 'var(--text-muted)' }}>⌘K</kbd>
            </div>

            {/* Right: connection status + theme toggle + account */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
              <ConnectionStatus />
              <ThemeToggle />
              {/* Account */}
              <div style={{
                width: 32, height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2D9ED4 0%, #7C5FBF 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, color: '#fff', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(45,158,212,0.3)',
              }}>M</div>
            </div>
          </header>

          {/* Main content */}
          <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', minWidth: 0, background: 'var(--canvas)' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
