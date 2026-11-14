import { SERVER_URL } from '../../../lib/api';

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

export default async function RequirementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${SERVER_URL}/requirements/${id}`, { cache: 'no-store' });
  if (!res.ok) return <p>需求未找到 ({res.status})</p>;
  const req = await res.json();
  return (
    <div className="nm-card" style={{ maxWidth: 640 }}>
      <h1 style={{ marginBottom: 20, color: 'var(--text)', fontSize: 20, fontWeight: 700 }}>需求详情</h1>
      <table>
        <tbody>
          <tr>
            <td style={{ color: 'var(--text-muted)', fontSize: 13, width: 100 }}>ID</td>
            <td style={{ color: 'var(--text)', fontWeight: 500 }}>{req.id}</td>
          </tr>
          <tr>
            <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>编号</td>
            <td style={{ color: 'var(--accent-dark)', fontWeight: 500 }}>
              <span className="mono">{req.display_number}</span>
            </td>
          </tr>
          <tr>
            <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>标题</td>
            <td style={{ color: 'var(--text)', fontWeight: 500 }}>{req.title}</td>
          </tr>
          <tr>
            <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>范围</td>
            <td style={{ color: 'var(--text)', fontWeight: 500 }}>{req.scope}</td>
          </tr>
          <tr>
            <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>类型</td>
            <td>
              <span className="badge badge-accent">{TYPE_LABELS[req.type as string] ?? req.type}</span>
            </td>
          </tr>
          <tr>
            <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>优先级</td>
            <td>
              <span className={PRIORITY_CLASS[req.priority as string] ?? 'badge'}>
                {req.priority}
              </span>
            </td>
          </tr>
          <tr>
            <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>状态</td>
            <td style={{ color: 'var(--text)', fontWeight: 500 }}>{req.status}</td>
          </tr>
          <tr>
            <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>创建时间</td>
            <td style={{ color: 'var(--text)', fontWeight: 500 }}>{req.created_at}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
