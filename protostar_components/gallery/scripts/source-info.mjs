import { execFileSync } from 'node:child_process';

export function readSourceInfo(cwd) {
  try {
    const options = { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] };
    const [commit, committedAt] = execFileSync('git', ['log', '-1', '--format=%h%n%cI', '--', 'protostar_components/'], options).trim().split('\n');
    const dirty = execFileSync('git', ['status', '--porcelain=v1', '-z', '--untracked-files=all', '--', 'protostar_components/'], options).length > 0;
    return { commit: commit || null, committedAt: committedAt || null, dirty };
  } catch {
    return { commit: null, committedAt: null, dirty: null };
  }
}
