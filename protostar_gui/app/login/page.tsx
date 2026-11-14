'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SERVER_URL } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${SERVER_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        const body = await res.json().catch(() => ({})) as { detail?: string };
        setError(body.detail ?? `${res.status}`);
      }
    } catch {
      setError('无法连接到服务器');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--canvas)',
    }}>
      <div className="nm-card" style={{ width: 340 }}>
        {/* Logo / title */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            fontSize: 32,
            fontWeight: 800,
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.1,
            marginBottom: 4,
          }}>将明</div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Protostar 研发管线</p>
        </div>

        <form onSubmit={submit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
              用户名
            </label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              style={{ width: '100%' }}
            />
          </div>

          {error && (
            <p style={{ color: 'var(--error)', fontSize: 13, margin: '0 0 14px', padding: '8px 12px', background: 'var(--error-bg)', borderRadius: 'var(--radius-sm)' }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%' }}>
            {loading ? '登录中…' : '登录'}
          </button>
        </form>
      </div>
    </div>
  );
}
