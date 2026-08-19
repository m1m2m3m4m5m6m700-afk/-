import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { detectV1 } from '../v1/index.mjs';
import { detectV2 } from '../v2/index.mjs';
import { diagnoseAll } from '../v3/core/diagnose.mjs';
import { buildStrategicPlan } from '../v3/planning/strategic-planner.mjs';
import { verify } from '../v3/core/verifier.mjs';
import { assertDevelopmentBranch } from './github-development-runner.mjs';

const exec = promisify(execFile);
const OWNER = process.env.GITHUB_REPOSITORY?.split('/')[0] ?? 'm1m2m3m4m5m6m700-afk';
const REPO = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'FLIXO-AI-TOOLS';
const BRANCH = 'feat/certification-foundation-pdf-merge';
const TOKEN = process.env.GITHUB_TOKEN;
const API = `https://api.github.com/repos/${OWNER}/${REPO}`;
const STATE_FILE = process.env.FLIXO_STATE_FILE ?? '/tmp/flixo-v4-hourly-state.json';

function headers() {
  return { accept: 'application/vnd.github+json', authorization: `Bearer ${TOKEN}`, 'x-github-api-version': '2022-11-28' };
}

async function gh(path, options = {}) {
  const res = await fetch(`${API}${path}`, { ...options, headers: { ...headers(), ...(options.headers ?? {}) } });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${path}`);
  return res.json();
}

async function getState() {
  try { return JSON.parse(await fs.readFile(STATE_FILE, 'utf8')); } catch { return { attempts: {} }; }
}
async function saveState(state) { await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2)); }

async function latestFailedCertification() {
  const data = await gh(`/actions/runs?branch=${encodeURIComponent(BRANCH)}&status=failure&per_page=30`);
  return (data.workflow_runs ?? [])
    .filter(r => !/FLIXO Agent Role Pipeline|Security Advisory|Vercel/i.test(r.name ?? ''))
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0] ?? null;
}

async function collectLogs(runId) {
  const jobs = await gh(`/actions/runs/${runId}/jobs?per_page=100`);
  const failed = (jobs.jobs ?? []).filter(j => j.conclusion === 'failure');
  const chunks = [];
  for (const job of failed.slice(0, 10)) {
    const res = await fetch(`${API}/actions/jobs/${job.id}/logs`, { headers: headers(), redirect: 'follow' });
    if (res.ok) chunks.push(`\n===== ${job.name} =====\n${await res.text()}`);
  }
  return chunks.join('\n');
}

function replaceOnce(file, anchor, content) {
  const before = requireText(file);
  if (before.split(anchor).length - 1 !== 1) throw new Error(`anchor mismatch: ${file}`);
  const after = before.replace(anchor, `${anchor}\n${content}`);
  return { before, after };
}
function requireText(file) {
  return requireTextCache.get(file) ?? '';
}
const requireTextCache = new Map();
async function load(file) { const text = await fs.readFile(file, 'utf8'); requireTextCache.set(file, text); return text; }
async function writeIfChanged(file, content) {
  const before = await load(file);
  if (before !== content) await fs.writeFile(file, content);
}

async function applyKnownRoot(root) {
  if (root.pattern === 'playwright') {
    const file = '.github/workflows/qr-independent-certification.yml';
    const text = await load(file);
    if (text.includes('npx playwright install chromium')) return false;
    const anchor = 'npm ci --include=dev';
    if (text.split(anchor).length - 1 !== 1) throw new Error(`unsafe playwright anchor: ${file}`);
    await writeIfChanged(file, text.replace(anchor, `${anchor}\n    - name: Install Playwright Chromium\n      run: npx playwright install chromium`));
    return true;
  }
  if (root.pattern === 'jsqr') {
    const pkgPath = 'package.json';
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
    if (pkg.devDependencies?.jsqr) return false;
    await exec('npm', ['install', '--save-dev', 'jsqr@1.4.0'], { maxBuffer: 1024 * 1024 * 8 });
    return true;
  }
  return false;
}

async function commitAndPush(message) {
  assertDevelopmentBranch(process.env.GITHUB_REF_NAME ?? BRANCH);
  const { stdout } = await exec('git', ['status', '--porcelain']);
  if (!stdout.trim()) return { pushed: false, sha: null };
  await exec('git', ['config', 'user.name', 'flixo-ci-repair-agent']);
  await exec('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
  await exec('git', ['add', 'package.json', 'package-lock.json', '.github/workflows/qr-independent-certification.yml']);
  await exec('git', ['commit', '-m', message]);
  const { stdout: sha } = await exec('git', ['rev-parse', 'HEAD']);
  await exec('git', ['push', 'origin', `HEAD:${BRANCH}`]);
  return { pushed: true, sha: sha.trim() };
}

async function main() {
  if (!TOKEN) throw new Error('GITHUB_TOKEN is required');
  assertDevelopmentBranch(process.env.GITHUB_REF_NAME ?? BRANCH);
  const state = await getState();
  const run = await latestFailedCertification();
  if (!run) return console.log(JSON.stringify({ status: 'idle', reason: 'no failed certification run' }));
  if (state.attempts[run.head_sha] >= 1) return console.log(JSON.stringify({ status: 'skipped', reason: 'already attempted this SHA', sha: run.head_sha }));

  const logs = await collectLogs(run.id);
  const v1 = detectV1(logs);
  const v2 = await detectV2(logs);
  const roots = diagnoseAll(logs);
  const plan = buildStrategicPlan(roots);
  const verification = verify(plan);
  const unknown = roots.filter(r => !['playwright', 'jsqr'].includes(r.pattern));
  state.attempts[run.head_sha] = 1;
  await saveState(state);

  if (unknown.length || !verification.valid || !plan.steps.length) {
    return console.log(JSON.stringify({ status: 'manual-review', run: run.name, sha: run.head_sha, v1, v2, roots, plan, verification, unknown: unknown.map(x => x.pattern) }, null, 2));
  }

  for (const file of ['package.json', 'package-lock.json', '.github/workflows/qr-independent-certification.yml']) {
    if (existsSync(file)) await load(file);
  }
  let changed = false;
  for (const root of roots) changed = (await applyKnownRoot(root)) || changed;
  if (!changed) return console.log(JSON.stringify({ status: 'no-op', run: run.name, sha: run.head_sha, roots: roots.map(r => r.pattern) }));

  const commit = await commitAndPush(`fix(agent): hourly v4 repair for ${roots.map(r => r.pattern).join(', ')}`);
  console.log(JSON.stringify({ status: 'pushed', sourceRun: run.id, sourceSha: run.head_sha, commit, roots: roots.map(r => r.pattern), role: 'v4-execute-development-only' }, null, 2));
}

await main();
