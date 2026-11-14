'use client';
import type { PipelineNode, NodeStatus } from '../lib/pipeline';

interface Props {
  node: PipelineNode;
  status?: NodeStatus;
  workerLastSeen: string | null;
  onClose: () => void;
}

const TYPE_DESC: Record<string, string> = {
  intake:   '需求登记节点，记录标题、目标范围与类型',
  artifact: '产物节点，对应 spec.md / plan.md / tasks.md 文件',
  gate:     '人工审批门禁，HumanMiao 批准后流程继续',
  run:      '运行派发节点，worker 领取并执行',
  output:   '运行输出，记录 stdout / stderr / exit_code',
};

const NODE_LINKS: Record<string, { label: string; path: string }[]> = {
  requirement:  [{ label: '需求列表', path: '/requirements' }, { label: '新建需求', path: '/requirements/new' }],
  spec:         [{ label: '批准中心', path: '/approvals' }],
  spec_gate:    [{ label: '批准中心', path: '/approvals' }],
  plan:         [{ label: '批准中心', path: '/approvals' }],
  plan_gate:    [{ label: '/approvals', path: '/approvals' }],
  tasks:        [{ label: '批准中心', path: '/approvals' }],
  tasks_gate:   [{ label: '批准中心', path: '/approvals' }],
  run_dispatch: [{ label: '运行列表', path: '/runs' }],
  run_output:   [{ label: '运行列表', path: '/runs' }],
};

export default function NodeDetail({ node, status, workerLastSeen, onClose }: Props) {
  const workerText =
    node.type === 'run' || node.type === 'output'
      ? (workerLastSeen ? `Worker 最近心跳：${workerLastSeen}` : 'Worker 离线')
      : null;

  const links = NODE_LINKS[node.id] ?? [];

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{node.label}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{node.sublabel}</div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#94a3b8', padding: 0 }}
        >
          ×
        </button>
      </div>

      <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6, marginBottom: 16 }}>
        {TYPE_DESC[node.type] ?? ''}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>
          阶段 / Lane
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={tagStyle('#eff6ff', '#1d4ed8')}>{node.phase}</span>
          <span style={tagStyle('#f0fdf4', '#15803d')}>{node.lane}</span>
          <span style={tagStyle('#faf5ff', '#6d28d9')}>{node.type}</span>
          {node.type === 'gate' && (
            <span style={tagStyle('#fef3c7', '#b45309')}>待审批</span>
          )}
        </div>
      </div>

      {status && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>
            状态
          </div>
          <span style={tagStyle(statusBg(status), statusFg(status))}>{status}</span>
        </div>
      )}

      {workerText && (
        <div style={{
          background: '#f1f5f9', borderRadius: 6, padding: '8px 12px',
          fontSize: 12, color: '#475569', marginBottom: 16,
        }}>
          {workerText}
        </div>
      )}

      {links.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>
            相关页面
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {links.map(l => (
              <a
                key={l.path}
                href={l.path}
                style={{
                  display: 'block', padding: '8px 12px',
                  background: 'white', border: '1px solid #e2e8f0',
                  borderRadius: 6, fontSize: 13, color: '#2563eb',
                  textDecoration: 'none',
                }}
              >
                → {l.label}
              </a>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 20, padding: '12px', background: '#f8fafc', borderRadius: 6, fontSize: 11, color: '#94a3b8' }}>
        col {node.col} · 节点 ID: <code>{node.id}</code>
      </div>
    </div>
  );
}

function tagStyle(bg: string, color: string): React.CSSProperties {
  return { background: bg, color, fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 500 };
}

function statusBg(s: NodeStatus): string {
  switch (s) {
    case 'done': case 'approved': return '#f0fdf4';
    case 'active': return '#eff6ff';
    case 'blocked': return '#fef2f2';
    default: return '#f8fafc';
  }
}
function statusFg(s: NodeStatus): string {
  switch (s) {
    case 'done': case 'approved': return '#15803d';
    case 'active': return '#1d4ed8';
    case 'blocked': return '#dc2626';
    default: return '#64748b';
  }
}
