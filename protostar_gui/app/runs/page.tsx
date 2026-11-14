'use client';

import { useEffect, useState, useCallback } from 'react';
import { SERVER_URL } from '../../lib/api';

type RunStatus = 'running' | 'completed' | 'failed';

interface Run {
  id: string;
  task_ref: string;
  status: RunStatus;
  started_at: string;
}

const STATUS_COLOR: Record<RunStatus, string> = {
  running: 'var(--accent-dark)',
  completed: 'var(--success)',
  failed: 'var(--error)',
};

export default function RunsPage() {
  const [runs, setRuns] = useState<Run[] | null>(null);
  const [error, setError] = useState<'401' | '404' | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRuns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${SERVER_URL}/runs`, { credentials: 'include' });
      if (res.status === 401) {
        setError('401');
        setRuns(null);
        return;
      }
      if (res.status === 404 || res.status === 405) {
        setError('404');
        setRuns(null);
        return;
      }
      if (!res.ok) {
        setError('404');
        setRuns(null);
        return;
      }
      const data: Run[] = await res.json();
      setRuns(data);
    } catch {
      setError('404');
      setRuns(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRuns(); }, [fetchRuns]);

  if (error === '401') {
    return (
      <div>
        <p>请先登录</p>
        <a href="/login" style={{ color: 'var(--accent-dark)' }}>去登录</a>
      </div>
    );
  }

  if (error === '404') {
    return (
      <div>
        <p>暂无运行记录</p>
        <button onClick={fetchRuns} disabled={loading} style={{ cursor: 'pointer' }}>
          刷新
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>运行列表</h2>
        <button className="btn-ghost" onClick={fetchRuns} disabled={loading}>
          {loading ? '加载中...' : '刷新'}
        </button>
      </div>

      {runs === null || runs.length === 0 ? (
        <p>暂无运行记录</p>
      ) : (
        <div className="nm-card" style={{ padding: 0 }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                {['ID', 'Task', '状态', '开始时间', ''].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '6px 12px', borderBottom: '1px solid var(--border)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id}>
                  <td style={{ padding: '6px 12px', fontFamily: 'monospace' }}>
                    {run.id.slice(0, 8)}
                  </td>
                  <td className="mono" style={{ padding: '6px 12px', fontSize: 13 }}>
                    {run.task_ref}
                  </td>
                  <td style={{ padding: '6px 12px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 12,
                      color: 'var(--surface)',
                      backgroundColor: STATUS_COLOR[run.status] ?? 'var(--text-faint)',
                    }}>
                      {run.status}
                    </span>
                  </td>
                  <td style={{ padding: '6px 12px', color: 'var(--text-muted)' }}>
                    {new Date(run.started_at).toLocaleString('zh-CN')}
                  </td>
                  <td style={{ padding: '6px 12px' }}>
                    <a href={`/runs/${run.id}`} style={{ color: 'var(--accent-dark)' }}>详情</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
