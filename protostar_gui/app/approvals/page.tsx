'use client';
import { useState } from 'react';
import { SERVER_URL } from '../../lib/api';

const TYPES = ['spec', 'plan', 'tasks'] as const;
type ArtifactType = typeof TYPES[number];

interface Artifact {
  id: string;
  file_path: string;
  type: string;
}

interface Approval {
  id: string;
  decision: string;
}

export default function ApprovalsPage() {
  const [reqId, setReqId] = useState('');
  const [artifacts, setArtifacts] = useState<Partial<Record<ArtifactType, Artifact>>>({});
  const [approvals, setApprovals] = useState<Partial<Record<ArtifactType, Approval[]>>>({});
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setMsg(null);
    const arts: Partial<Record<ArtifactType, Artifact>> = {};
    const apps: Partial<Record<ArtifactType, Approval[]>> = {};
    for (const t of TYPES) {
      const r = await fetch(`${SERVER_URL}/artifacts/${t}?requirement_id=${reqId}`, {
        credentials: 'include',
      });
      if (r.ok) {
        const a: Artifact = await r.json();
        arts[t] = a;
        const ar = await fetch(`${SERVER_URL}/approvals?artifact_id=${a.id}`, {
          credentials: 'include',
        });
        apps[t] = ar.ok ? await ar.json() : [];
      }
    }
    setArtifacts(arts);
    setApprovals(apps);
  }

  async function approve(artifactId: string, type: string) {
    setMsg(null);
    const res = await fetch(`${SERVER_URL}/approvals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ artifact_id: artifactId, decision: 'approved' }),
    });
    if (res.ok) {
      setMsg(`${type} approved`);
      load();
    } else {
      const body = await res.json().catch(() => ({})) as { detail?: string };
      setMsg(`${res.status}: ${body.detail ?? ''}`);
    }
  }

  const isFail = msg && (msg.startsWith('4') || msg.startsWith('5'));

  return (
    <div>
      <h1>批准产物</h1>
      <div>
        <input
          value={reqId}
          onChange={e => setReqId(e.target.value)}
          placeholder="Requirement ID"
        />
        <button onClick={load}>加载</button>
      </div>
      {msg && <p style={{ color: isFail ? 'red' : 'green' }}>{msg}</p>}
      {TYPES.map(t => {
        const art = artifacts[t];
        const approved = approvals[t]?.some(a => a.decision === 'approved');
        return (
          <div key={t} style={{ marginTop: 12 }}>
            <strong>{t}</strong>:{' '}
            {art ? (
              <span>
                {art.file_path}{' '}
                {approved ? '✓ approved' : (
                  <button onClick={() => approve(art.id, t)}>批准</button>
                )}
              </span>
            ) : '(未上传)'}
          </div>
        );
      })}
    </div>
  );
}
