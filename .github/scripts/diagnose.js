import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const runId = process.env.RUN_ID || 'unknown';
const repo = process.env.REPOSITORY || process.env.GITHUB_REPOSITORY || '';
const outDir = path.resolve('.github/self-healing/logs');
fs.mkdirSync(outDir, { recursive: true });

function api(url) {
  const token = process.env.GH_TOKEN;
  if (!token) throw new Error('GH_TOKEN is required');
  return JSON.parse(execFileSync('curl', ['-fsSL', '-H', `Authorization: Bearer ${token}`, '-H', 'Accept: application/vnd.github+json', url], { encoding: 'utf8' }));
}

const run = api(`https://api.github.com/repos/${repo}/actions/runs/${runId}`);
const jobs = api(`https://api.github.com/repos/${repo}/actions/runs/${runId}/jobs?per_page=100`).jobs ?? [];
const logs = [];
for (const job of jobs) {
  try {
    const text = execFileSync('curl', ['-fsSL', '-H', `Authorization: Bearer ${process.env.GH_TOKEN}`, '-H', 'Accept: application/vnd.github+json', `https://api.github.com/repos/${repo}/actions/jobs/${job.id}/logs`], { encoding: 'utf8' });
    logs.push({ job: job.name, jobId: job.id, text });
    fs.writeFileSync(path.join(outDir, `${job.id}.log`), text);
  } catch (error) {
    logs.push({ job: job.name, jobId: job.id, text: '', error: String(error) });
  }
}

const corpus = logs.map((entry) => entry.text).join('\n');
const rules = [
  { id: 'R001', strategy: 'lockfile-fixer', regex: /(npm ERR!|ERESOLVE|package\.json.*lockfile|lockfile.*package\.json)/i, confidence: 0.97, allowed: true, severity: 'high' },
  { id: 'R002', strategy: 'lint-fixer', regex: /(npm run lint|eslint|no-control-regex|no-unused-vars|prettier)/i, confidence: 0.86, allowed: true, severity: 'medium' },
  { id: 'R003', strategy: 'test-retry-fixer', regex: /(playwright|Timeout .*exceeded|waiting for|download event)/i, confidence: 0.82, allowed: false, severity: 'medium' },
  { id: 'R004', strategy: 'typecheck', regex: /(TS\d{3,5}|tsc --noEmit|TypeScript)/i, confidence: 0.99, allowed: false, severity: 'high' },
  { id: 'R005', strategy: 'human-review', regex: /(security|permission|vulnerability|content-security-policy|src\/)/i, confidence: 0.99, allowed: false, severity: 'critical' },
];

const issues = rules.filter((rule) => rule.regex.test(corpus)).map((rule) => ({
  id: rule.id,
  severity: rule.severity,
  recommendedStrategy: rule.strategy,
  confidence: rule.confidence,
  autoApplyAllowed: rule.allowed && rule.confidence >= 0.8,
  evidence: corpus.match(rule.regex)?.[0] ?? 'pattern matched',
}));

const baseRef = run.pull_requests?.[0]?.base?.ref ?? 'main';
const report = {
  version: 1,
  runId,
  repository: repo,
  headSha: run.head_sha ?? null,
  headBranch: run.head_branch ?? null,
  baseRef,
  event: run.event ?? null,
  generatedAt: new Date().toISOString(),
  failedJobs: jobs.filter((job) => job.conclusion === 'failure').map((job) => ({ id: job.id, name: job.name })),
  issues,
  decision: issues.some((issue) => issue.autoApplyAllowed) ? 'candidate-for-safe-auto-heal' : 'human-review-required',
  policy: { minConfidence: 0.8, srcAutoMutation: false, majorDependencyAutoMutation: false },
};

fs.writeFileSync('.github/diagnosis-report.json', JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(outDir, `${runId}.json`), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
