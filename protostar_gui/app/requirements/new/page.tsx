'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SERVER_URL } from '../../../lib/api';

export default function NewRequirementPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [scope, setScope] = useState('');
  const [type, setType] = useState('feature');
  const [priority, setPriority] = useState('P2');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setSuccess(null);
    const res = await fetch(`${SERVER_URL}/requirements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ title, scope, type, priority }),
    });
    if (res.status === 201) {
      const data = await res.json();
      setSuccess(`已创建 ${data.display_number}`);
      setTimeout(() => router.push(`/requirements/${data.id}`), 1000);
    } else {
      const body = await res.text();
      setError(`${res.status}: ${body}`);
    }
  }

  return (
    <div>
      <h1 style={{ color: 'var(--text)', fontSize: 20, fontWeight: 700, marginBottom: 20 }}>新建需求</h1>
      <div className="nm-card" style={{ maxWidth: 480 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-muted)', fontSize: 13 }}>标题</label>
          <input value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-muted)', fontSize: 13 }}>范围</label>
          <input value={scope} onChange={e => setScope(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-muted)', fontSize: 13 }}>类型</label>
          <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%' }}>
            <option value="feature">需求</option>
            <option value="bug">漏洞</option>
            <option value="improvement">改进</option>
            <option value="research">调研</option>
          </select>
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 6, color: 'var(--text-muted)', fontSize: 13 }}>优先级</label>
          <select value={priority} onChange={e => setPriority(e.target.value)} style={{ width: '100%' }}>
            <option value="P0">P0</option>
            <option value="P1">P1</option>
            <option value="P2">P2</option>
          </select>
        </div>
        <button className="btn-primary" onClick={submit}>创建</button>
        {success && <p style={{ color: 'var(--accent-dark)', marginTop: 12 }}>{success}</p>}
        {error && <p style={{ color: 'var(--error)', marginTop: 12 }}>{error}</p>}
      </div>
    </div>
  );
}
