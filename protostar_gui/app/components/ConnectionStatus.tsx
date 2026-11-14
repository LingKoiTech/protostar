'use client';
import { useEffect, useState } from 'react';
import { SERVER_URL } from '../../lib/api';

type Status = 'ok' | 'error' | 'checking';

export default function ConnectionStatus() {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    async function check() {
      try {
        const r = await fetch(`${SERVER_URL}/health`, { cache: 'no-store' });
        setStatus(r.ok ? 'ok' : 'error');
      } catch {
        setStatus('error');
      }
    }
    check();
    const id = setInterval(check, 10_000);
    return () => clearInterval(id);
  }, []);

  const color = status === 'ok' ? 'var(--success)' : status === 'error' ? 'var(--error)' : 'var(--text-faint)';
  const label = status === 'ok' ? '已连接' : status === 'error' ? '连接中断' : '检查中';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color, fontWeight: 500, whiteSpace: 'nowrap' }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
      {label}
    </div>
  );
}
