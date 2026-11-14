'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { SERVER_URL } from '../../lib/api';
import PipelineGraph from '../../components/PipelineGraph';
import NodeDetail from '../../components/NodeDetail';
import type { PipelineNode, PipelineEdge, NodeStatus } from '../../lib/pipeline';

interface HealthData {
  status: string;
  db: string;
  worker_last_seen: string | null;
}

interface ArtifactItem {
  id: string;
  type: string;
  file_path: string;
}

interface ApprovalItem {
  id: string;
  decision: string;
}

interface RequirementApprovalState {
  requirement_id: string;
  spec: ApprovalItem | null;
  plan: ApprovalItem | null;
  tasks: ApprovalItem | null;
}

const NODES: PipelineNode[] = [
  { id: 'requirement',  label: 'Requirement',  sublabel: '需求登记',       type: 'intake',    col: 0, lane: 'pipeline', phase: 'intake' },
  { id: 'spec',         label: 'spec.md',       sublabel: 'PM-MorollMiao',  type: 'artifact',  col: 1, lane: 'pipeline', phase: 'artifacts' },
  { id: 'spec_gate',    label: '批准 spec',     sublabel: 'HumanMiao',      type: 'gate',      col: 2, lane: 'approver',  phase: 'artifacts' },
  { id: 'plan',         label: 'plan.md',       sublabel: 'CocoaMiao',      type: 'artifact',  col: 2, lane: 'pipeline', phase: 'artifacts' },
  { id: 'plan_gate',    label: '批准 plan',     sublabel: 'HumanMiao',      type: 'gate',      col: 3, lane: 'approver',  phase: 'artifacts' },
  { id: 'tasks',        label: 'tasks.md',      sublabel: 'VanillaMiao',    type: 'artifact',  col: 3, lane: 'pipeline', phase: 'artifacts' },
  { id: 'tasks_gate',   label: '批准 tasks',    sublabel: 'HumanMiao',      type: 'gate',      col: 4, lane: 'approver',  phase: 'artifacts' },
  { id: 'run_dispatch', label: 'Run',           sublabel: 'POST /runs',     type: 'run',       col: 4, lane: 'pipeline', phase: 'execution' },
  { id: 'run_output',   label: 'RunOutput',     sublabel: 'stdout/exit',    type: 'output',    col: 5, lane: 'pipeline', phase: 'execution' },
];

const EDGES: PipelineEdge[] = [
  { from: 'requirement',  to: 'spec' },
  { from: 'spec',         to: 'spec_gate' },
  { from: 'spec_gate',    to: 'plan' },
  { from: 'plan',         to: 'plan_gate' },
  { from: 'plan_gate',    to: 'tasks' },
  { from: 'tasks',        to: 'tasks_gate' },
  { from: 'tasks_gate',   to: 'run_dispatch' },
  { from: 'run_dispatch', to: 'run_output' },
];

function buildStatuses(
  artifacts: ArtifactItem[],
  approvalState: RequirementApprovalState | null,
  runs: { status: string }[],
): Record<string, NodeStatus> {
  const s: Record<string, NodeStatus> = {};
  s['requirement'] = 'done';
  const hasSpec  = artifacts.some(a => a.type === 'spec');
  const hasPlan  = artifacts.some(a => a.type === 'plan');
  const hasTasks = artifacts.some(a => a.type === 'tasks');
  s['spec']     = hasSpec  ? 'done' : 'pending';
  s['plan']     = hasPlan  ? 'done' : hasSpec ? 'pending' : 'blocked';
  s['tasks']    = hasTasks ? 'done' : hasPlan ? 'pending' : 'blocked';
  s['spec_gate']  = approvalState?.spec?.decision  === 'approved' ? 'approved' : hasSpec  ? 'pending' : 'blocked';
  s['plan_gate']  = approvalState?.plan?.decision  === 'approved' ? 'approved' : hasPlan  ? 'pending' : 'blocked';
  s['tasks_gate'] = approvalState?.tasks?.decision === 'approved' ? 'approved' : hasTasks ? 'pending' : 'blocked';
  const latestRun = runs[0];
  if (latestRun) {
    s['run_dispatch'] = latestRun.status === 'running' ? 'active' : latestRun.status === 'completed' ? 'done' : 'blocked';
    s['run_output'] = latestRun.status === 'completed' ? 'done' : 'pending';
  } else {
    s['run_dispatch'] = approvalState?.tasks?.decision === 'approved' ? 'pending' : 'blocked';
    s['run_output'] = 'blocked';
  }
  return s;
}

export default function PipelinePageInner() {
  const searchParams = useSearchParams();
  const requirementId = searchParams.get('requirement');

  const [selected, setSelected] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, NodeStatus>>({});
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [requirementInput, setRequirementInput] = useState(requirementId ?? '');

  const fetchStatuses = useCallback(async (reqId: string) => {
    if (!reqId) return;
    try {
      const [artRes, appRes, runRes] = await Promise.all([
        fetch(`${SERVER_URL}/artifacts?requirement_id=${reqId}`, { credentials: 'include' }),
        fetch(`${SERVER_URL}/approvals/by-requirement?requirement_id=${reqId}`, { credentials: 'include' }),
        fetch(`${SERVER_URL}/runs`, { credentials: 'include' }),
      ]);
      const artifacts: ArtifactItem[] = artRes.ok ? await artRes.json() : [];
      const approvalState: RequirementApprovalState | null = appRes.ok ? await appRes.json() : null;
      const runs: { status: string }[] = runRes.ok ? await runRes.json() : [];
      setStatuses(buildStatuses(artifacts, approvalState, runs));
    } catch { /* 接口不可用时保持空状态 */ }
  }, []);

  useEffect(() => {
    fetch(`${SERVER_URL}/health`, { credentials: 'include', cache: 'no-store' })
      .then(r => r.json())
      .then((d: HealthData) => setHealthData(d))
      .catch(() => setHealthData({ status: 'error', db: 'error', worker_last_seen: null }));
    const timer = setTimeout(() => setLoading(false), 300);
    if (requirementId) fetchStatuses(requirementId);
    return () => clearTimeout(timer);
  }, [requirementId, fetchStatuses]);

  const selectedNode = NODES.find(n => n.id === selected) ?? null;

  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 0, overflow: 'hidden' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Spec-Kit 研发流程</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              value={requirementInput}
              onChange={e => setRequirementInput(e.target.value)}
              placeholder="Requirement UUID（查看执行状态）"
              style={{ width: 280 }}
            />
            <button className="btn-ghost" onClick={() => fetchStatuses(requirementInput)}>加载</button>
          </div>
        </div>
        <StatusBar health={healthData} />
        {loading ? <Shimmer /> : (
          <>
            <div className="nm-card" style={{ padding: 20 }}>
              <PipelineGraph nodes={NODES} edges={EDGES} statuses={statuses} selectedId={selected} onSelect={setSelected} />
            </div>
            <p style={{ marginTop: 16, fontSize: 12, color: 'var(--text-faint)' }}>
              {requirementId ? `需求 ${requirementId.slice(0, 8)}… 的执行状态` : '流程模板视图 · 输入 Requirement UUID 查看真实执行状态'}
            </p>
          </>
        )}
      </div>
      {selectedNode && (
        <div style={{ width: 320, borderLeft: '1px solid var(--border)', background: 'var(--surface)', overflowY: 'auto' }}>
          <NodeDetail
            node={selectedNode}
            status={statuses[selectedNode.id]}
            workerLastSeen={healthData?.worker_last_seen ?? null}
            onClose={() => setSelected(null)}
          />
        </div>
      )}
    </div>
  );
}

function StatusBar({ health }: { health: HealthData | null }) {
  const dbOk = health?.db === 'ok';
  const workerOnline = health?.worker_last_seen != null;
  return (
    <div className="nm-card-sm" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', background: health == null ? 'var(--text-faint)' : dbOk ? 'var(--success)' : 'var(--error)' }} />
        DB {health == null ? '…' : dbOk ? 'ok' : 'error'}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', background: workerOnline ? 'var(--accent)' : 'var(--text-faint)' }} />
        Worker {health == null ? '…' : workerOnline ? health.worker_last_seen : '离线'}
      </span>
    </div>
  );
}

function Shimmer() {
  return (
    <>
      <style>{`@keyframes ps-pulse{0%,100%{opacity:1}50%{opacity:.4}}.ps-shimmer{animation:ps-pulse 1.5s ease-in-out infinite;background:var(--surface-inset);border-radius:var(--radius)}`}</style>
      <div className="ps-shimmer" style={{ height: 20, width: 220, marginBottom: 12 }} />
      <div className="ps-shimmer" style={{ height: 300 }} />
    </>
  );
}
