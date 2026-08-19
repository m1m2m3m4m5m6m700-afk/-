import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);
export const DEVELOPMENT_BRANCH = 'feat/certification-foundation-pdf-merge';
const PROTECTED = new Set(['main', 'master']);

export function assertDevelopmentBranch(branch = process.env.GITHUB_REF_NAME) {
  if (!branch) throw new Error('missing branch name');
  if (PROTECTED.has(branch) || branch !== DEVELOPMENT_BRANCH) {
    throw new Error(`v4 GitHub runner may write only to ${DEVELOPMENT_BRANCH}`);
  }
  return true;
}

export async function pushDevelopmentRepair({ message = 'fix(agent): apply verified v4 repair', allowPush = false } = {}) {
  const branch = process.env.GITHUB_REF_NAME;
  assertDevelopmentBranch(branch);
  if (!allowPush) return { status: 'dry-run', branch, pushed: false };
  await exec('git', ['config', 'user.name', 'flixo-ci-repair-agent']);
  await exec('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
  const { stdout } = await exec('git', ['status', '--porcelain']);
  if (!stdout.trim()) return { status: 'no-op', branch, pushed: false };
  await exec('git', ['add', '-A']);
  await exec('git', ['commit', '-m', message]);
  await exec('git', ['push', 'origin', `HEAD:${DEVELOPMENT_BRANCH}`]);
  return { status: 'pushed', branch, pushed: true };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await pushDevelopmentRepair({ allowPush: process.env.V4_ALLOW_PUSH === 'true' });
  console.log(JSON.stringify(result, null, 2));
}
