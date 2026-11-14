'use client';
import { useState, useEffect, useCallback } from 'react';
import { SERVER_URL } from '../../lib/api';

interface Requirement {
  id: string;
  seq_number: number;
  display_number: string;
  title: string;
  scope: string;
  type: string;
  priority: string;
  status: 'active' | 'closed';
  created_at: string;
  updated_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  feature: '需求',
  bug: '漏洞',
  improvement: '改进',
  research: '调研',
};

const PRIORITY_CLASS: Record<string, string> = {
  P0: 'badge badge-err',
  P1: 'badge badge-warn',
  P2: 'badge',
};

export default function RequirementsPage() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const load = useCallback(async (type: string, priority: string) => {
    setLoading(true);
    setError(null);
    setUnauthorized(false);
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (priority) params.set('priority', priority);
    const qs = params.toString();
    const url = `${SERVER_URL}/requirements${qs ? `?${qs}` : ''}`;
    const res = await fetch(url, { credentials: 'include' });
    if (res.status === 401) {
      setUnauthorized(true);
    } else if (res.ok) {
      setRequirements(await res.json());
    } else {
      setError(`${res.status}: ${await res.text()}`);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(typeFilter, priorityFilter); }, [load, typeFilter, priorityFilter]);

  function handleTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setTypeFilter(e.target.value);
  }

  function handlePriorityChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setPriorityFilter(e.target.value);
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <h2 style={{ margin: 0, color: 'var(--text)', fontSize: 20, fontWeight: 700 }}>需求</h2>
        <a href="/requirements/new">新建需求</a>
        <button className="btn-ghost" onClick={() => load(typeFilter, priorityFilter)} disabled={loading}>刷新</button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          类型:
          <select value={typeFilter} onChange={handleTypeChange}>
            <option value="">全部</option>
            <option value="feature">需求</option>
            <option value="bug">漏洞</option>
            <option value="improvement">改进</option>
            <option value="research">调研</option>
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          优先级:
          <select value={priorityFilter} onChange={handlePriorityChange}>
            <option value="">全部</option>
            <option value="P0">P0</option>
            <option value="P1">P1</option>
            <option value="P2">P2</option>
          </select>
        </label>
      </div>

      {loading && <p>加载中…</p>}
      {unauthorized && <p style={{ color: 'var(--error)' }}>未登录，请先 <a href="/login" style={{ color: 'var(--accent-dark)' }}>登录</a></p>}
      {error && <p style={{ color: 'var(--error)' }}>{error}</p>}

      {!loading && !unauthorized && !error && (
        requirements.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>暂无需求</p>
        ) : (
          <div className="nm-card" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  {['编号', '标题', '类型', '优先级', '状态', '创建时间'].map(h => (
                    <th key={h} style={{ borderBottom: '2px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requirements.map(r => (
                  <tr key={r.id}>
                    <td>
                      <a href={`/requirements/${r.id}`}>{r.display_number}</a>
                    </td>
                    <td>{r.title}</td>
                    <td>
                      <span className="badge badge-accent">{TYPE_LABELS[r.type] ?? r.type}</span>
                    </td>
                    <td>
                      <span className={PRIORITY_CLASS[r.priority] ?? 'badge'}>
                        {r.priority}
                      </span>
                    </td>
                    <td>
                      <span className={r.status === 'active' ? 'badge badge-ok' : 'badge badge-warn'}>
                        {r.status === 'active' ? '活跃' : '已关闭'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      {new Date(r.created_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
