import { SERVER_URL } from '../../../lib/api';

interface Run {
  task_ref: string;
  backend: string;
  model: string | null;
  session_id: string | null;
  work_dir: string | null;
  status: string;
  started_at: string;
  finished_at: string | null;
}

interface RunOutput {
  stdout: string | null;
  stderr: string | null;
  exit_code: number | null;
  failure_reason: string | null;
}

export default async function RunDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const runRes = await fetch(`${SERVER_URL}/runs/${id}`, { cache: 'no-store' });
  if (!runRes.ok) return <p>Run 未找到 ({runRes.status})</p>;
  const run: Run = await runRes.json();

  const outRes = await fetch(`${SERVER_URL}/runs/${id}/output`, { cache: 'no-store' });
  const output: RunOutput | null = outRes.ok ? await outRes.json() : null;

  const failed = run.status === 'failed' || (output !== null && output.exit_code !== null && output.exit_code !== 0);

  return (
    <div>
      <h1>运行结果</h1>
      <table>
        <tbody>
          <tr><td>task_ref</td><td>{run.task_ref}</td></tr>
          <tr><td>backend</td><td>{run.backend}</td></tr>
          <tr><td>model</td><td>{run.model ?? '-'}</td></tr>
          <tr><td>session_id</td><td>{run.session_id ?? '-'}</td></tr>
          <tr><td>work_dir</td><td>{run.work_dir ?? '-'}</td></tr>
          <tr>
            <td>status</td>
            <td style={{ color: failed ? 'red' : 'inherit' }}>{run.status}</td>
          </tr>
          <tr><td>started_at</td><td>{run.started_at}</td></tr>
          <tr><td>finished_at</td><td>{run.finished_at ?? '-'}</td></tr>
        </tbody>
      </table>
      {!output && <p>结果尚未产生</p>}
      {output && (
        <div>
          <p>
            exit_code:{' '}
            <strong style={{ color: failed ? 'red' : 'inherit' }}>
              {output.exit_code ?? 'null'}
            </strong>
          </p>
          {output.failure_reason && (
            <p style={{ color: 'red' }}>failure_reason: {output.failure_reason}</p>
          )}
          <h3>stdout</h3>
          <pre style={{ background: '#f5f5f5', padding: 8 }}>{output.stdout || '(empty)'}</pre>
          <h3>stderr</h3>
          <pre style={{ background: '#f5f5f5', padding: 8 }}>{output.stderr || '(empty)'}</pre>
        </div>
      )}
    </div>
  );
}
