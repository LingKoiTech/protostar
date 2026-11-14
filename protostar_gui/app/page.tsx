import { SERVER_URL } from '../lib/api';

interface HealthData {
  status: string;
  db: string;
  worker_last_seen: string | null;
}

export default async function HomePage() {
  let health: HealthData | null = null;
  let error: string | null = null;

  try {
    const res = await fetch(`${SERVER_URL}/health`, { cache: 'no-store' });
    if (res.ok) {
      health = await res.json();
    } else {
      error = `server error: ${res.status}`;
    }
  } catch {
    error = 'server 不可达';
  }

  if (error || !health) {
    return (
      <div style={{ padding: '40px 32px' }}>
        <h1 style={{
          fontSize: 36,
          fontWeight: 800,
          background: 'var(--accent-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          color: 'var(--accent-text)',   /* fallback if gradient-clip unsupported */
          marginBottom: 8,
        }}>将明</h1>
        <p style={{ color: 'var(--error)', fontSize: 14 }}>{error ?? 'server 不可达'}</p>
      </div>
    );
  }

  const dbOk = health.db === 'ok';
  const workerOnline = health.worker_last_seen !== null;

  return (
    <div style={{ padding: '40px 32px', maxWidth: 900 }}>
      {/* Title */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{
          fontSize: 56,
          fontWeight: 900,
          background: 'linear-gradient(135deg, #1070A8 0%, #6D4FC4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          color: '#1070A8',
          lineHeight: 1,
          marginBottom: 8,
          letterSpacing: '-0.02em',
        }}>将明</h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', fontWeight: 500 }}>
          Protostar 研发管线
        </p>
      </div>

      {/* Status cards row */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 32, flexWrap: 'wrap' }}>
        {/* DB 状态 */}
        <div className="nm-card" style={{ flex: '1 1 200px', minWidth: 180 }}>
          <div style={{ marginBottom: 10 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-text)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
            </svg>
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            DB 状态
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
            {health.db}
          </div>
          <span className={dbOk ? 'badge badge-ok' : 'badge badge-err'}>
            {dbOk ? '● 正常' : '● 异常'}
          </span>
        </div>

        {/* Worker 状态 */}
        <div className="nm-card" style={{ flex: '1 1 200px', minWidth: 180 }}>
          <div style={{ marginBottom: 10 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-text)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
            </svg>
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            Worker 状态
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 10, fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
            {health.worker_last_seen ?? '离线'}
          </div>
          <span className={workerOnline ? 'badge badge-ok' : 'badge badge-err'}>
            {workerOnline ? '● 在线' : '● 离线'}
          </span>
        </div>

        {/* 版本 */}
        <div className="nm-card" style={{ flex: '1 1 200px', minWidth: 180 }}>
          <div style={{ marginBottom: 10 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-text)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            版本
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
            v0.3.0
          </div>
          <span className="badge badge-accent">● Protostar</span>
        </div>
      </div>

      {/* Quick links */}
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          快速导航
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
          <a href="/requirements" className="nm-card-sm" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text)', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C5FBF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            需求管理
          </a>
          <a href="/pipeline" className="nm-card-sm" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text)', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1070A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>
            研发管线
          </a>
          <a href="/runs" className="nm-card-sm" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text)', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            执行记录
          </a>
        </div>
      </div>
    </div>
  );
}
