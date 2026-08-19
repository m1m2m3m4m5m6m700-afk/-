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
  return JSON.parse(execFileSync('curl', [
    '-fsSL',
    '-H', `Authorization: Bearer ${token}`,
    '-H', 'Accept: application/vnd.github+json',
    url,
  ], { encoding: 'utf8' }));
}

function safeApi(url, fallback) {
  try {
    return api(url);
  } catch {
    return fallback;
  }
}

function samples(text, regex, limit = 3) {
  return [...text.matchAll(regex)].slice(0, limit).map((match) => match[0].trim()).filter(Boolean);
}

const run = api(`https://api.github.com/repos/${repo}/actions/runs/${runId}`);
const jobs = api(`https://api.github.com/repos/${repo}/actions/runs/${runId}/jobs?per_page=100`).jobs ?? [];
const logs = [];

for (const job of jobs) {
  try {
    const text = execFileSync('curl', [
      '-fsSL',
      '-H', `Authorization: Bearer ${process.env.GH_TOKEN}`,
      '-H', 'Accept: application/vnd.github+json',
      `https://api.github.com/repos/${repo}/actions/jobs/${job.id}/logs`,
    ], { encoding: 'utf8' });
    logs.push({ job: job.name, jobId: job.id, conclusion: job.conclusion, steps: job.steps ?? [], text });
    fs.writeFileSync(path.join(outDir, `${job.id}.log`), text);
  } catch (error) {
    logs.push({ job: job.name, jobId: job.id, conclusion: job.conclusion, steps: job.steps ?? [], text: '', error: String(error) });
  }
}

const failedJobs = logs.filter((entry) => entry.conclusion === 'failure');
const corpus = logs.map((entry) => entry.text).join('\n');
const failedCorpus = failedJobs.map((entry) => entry.text).join('\n');
const setupNodeCorpus = logs
  .filter((entry) => entry.steps.some((step) => /setup node/i.test(step.name)) || /Run actions\/setup-node@/i.test(entry.text))
  .map((entry) => entry.text)
  .join('\n');
const installCorpus = logs
  .filter((entry) => entry.steps.some((step) => /install dependencies|npm ci|npm install/i.test(step.name)) || /npm ci|npm install/i.test(entry.text))
  .map((entry) => entry.text)
  .join('\n');

const packageLockExists = fs.existsSync('package-lock.json');
const packageJsonExists = fs.existsSync('package.json');

const patterns = {
  missingLockfile: /(ENOENT[^\n]*(package-lock\.json|npm-shrinkwrap\.json)|(?:no such file or directory|not found|missing)[^\n]*package-lock\.json|package-lock\.json[^\n]*(?:not found|missing|does not exist)|could not load package-lock\.json)/i,
  npmInstallError: /(?:npm ERR!|npm error|ERESOLVE|EAI_AGAIN|ENOTFOUND|ERR_PNPM|EACCES|EPERM)/i,
  setupNodeError: /(?:actions\/setup-node|setup-node@[^\s]+)[^\n]*(?:error|failed|unable|could not)/i,
  playwrightErrors: /(?:playwright.*(?:TimeoutError|error)|Timeout .*exceeded|waiting for.*(?:download|selector|event))/i,
  permissionErrors: /(?:permission denied|EACCES|EPERM)(?![^\n]*GITHUB_TOKEN permissions)/i,
  securityErrors: /(?:vulnerability|content-security-policy|security check failed|secret leak)/i,
};

function makeEvidence(category, text, regex, source, minConfidence) {
  const lines = samples(text, new RegExp(`.*${regex.source}.*`, regex.flags.includes('i') ? 'gim' : 'gm'), 3);
  if (!lines.length) return null;
  return { category, source, samples: lines, count: lines.length, minConfidence };
}

const evidence = [];
const missingLockEvidence =
  makeEvidence('missingLockfile', setupNodeCorpus || failedCorpus || corpus, patterns.missingLockfile, 'setup-node/job-log', 0.9)
  || (!packageLockExists && packageJsonExists && failedJobs.some((job) => job.steps.some((step) => /setup node|install dependencies|npm ci/i.test(step.name)))
    ? {
        category: 'missingLockfile',
        source: 'checkout-filesystem + failed-job-step',
        samples: ['package-lock.json is absent from the failed SHA checkout', 'A dependency/setup step is present in the failed job'],
        count: 2,
        minConfidence: 0.95,
      }
    : null);
if (missingLockEvidence) evidence.push(missingLockEvidence);

const npmInstallEvidence = makeEvidence('npmInstallError', installCorpus || failedCorpus, patterns.npmInstallError, 'install-step/job-log', 0.85);
if (npmInstallEvidence) evidence.push(npmInstallEvidence);

const setupNodeEvidence = makeEvidence('setupNodeError', setupNodeCorpus || failedCorpus, patterns.setupNodeError, 'setup-node/job-log', 0.8);
if (setupNodeEvidence) evidence.push(setupNodeEvidence);

const playwrightEvidence = makeEvidence('playwrightErrors', failedCorpus || corpus, patterns.playwrightErrors, 'failed-job-log', 0.8);
if (playwrightEvidence) evidence.push(playwrightEvidence);

const permissionEvidence = makeEvidence('permissionErrors', failedCorpus || corpus, patterns.permissionErrors, 'failed-job-log', 0.85);
if (permissionEvidence) evidence.push(permissionEvidence);

const securityEvidence = makeEvidence('securityErrors', failedCorpus || corpus, patterns.securityErrors, 'failed-job-log', 0.95);
if (securityEvidence) evidence.push(securityEvidence);

const recentRuns = safeApi(
  `https://api.github.com/repos/${repo}/actions/runs?per_page=10&event=pull_request&branch=${encodeURIComponent(run.head_branch ?? '')}`,
  { workflow_runs: [] },
).workflow_runs ?? [];
const recentRelevantRuns = recentRuns.filter((item) => item.id !== run.id).slice(0, 3);
const runHistoryMatches = recentRelevantRuns.filter((item) => item.conclusion === 'failure').length;

function confidenceFor(category) {
  const direct = evidence.find((item) => item.category === category);
  if (!direct) return 0;
  const repeatBoost = Math.min(0.1, runHistoryMatches * 0.05);
  return Math.min(1, direct.minConfidence + repeatBoost);
}

const issues = [];

if (evidence.some((item) => item.category === 'missingLockfile' || item.category === 'npmInstallError')) {
  const directLock = evidence.filter((item) => ['missingLockfile', 'npmInstallError', 'setupNodeError'].includes(item.category));
  const confidence = Math.min(1, Math.max(...directLock.map((item) => item.minConfidence), 0) + Math.min(0.1, runHistoryMatches * 0.05));
  issues.push({
    id: 'R010',
    severity: 'high',
    recommendedStrategy: 'lockfile-fixer',
    confidence,
    autoApplyAllowed: true,
    rule: 'R010',
    evidence: directLock,
    runHistoryMatches,
    reason: 'Dependency/setup evidence indicates a lockfile or npm installation problem, and this is the only allow-listed automatic repair strategy.',
  });
}

if (playwrightEvidence && !evidence.some((item) => item.category === 'missingLockfile' || item.category === 'npmInstallError')) {
  issues.push({
    id: 'R003',
    severity: 'medium',
    recommendedStrategy: 'test-retry-fixer',
    confidence: confidenceFor('playwrightErrors'),
    autoApplyAllowed: false,
    rule: 'R003',
    evidence: [playwrightEvidence],
    runHistoryMatches,
  });
}

if (setupNodeEvidence && !evidence.some((item) => item.category === 'missingLockfile' || item.category === 'npmInstallError')) {
  issues.push({
    id: 'R006',
    severity: 'medium',
    recommendedStrategy: 'environment-review',
    confidence: confidenceFor('setupNodeError'),
    autoApplyAllowed: false,
    rule: 'R006',
    evidence: [setupNodeEvidence],
    runHistoryMatches,
  });
}

if (permissionEvidence) {
  issues.push({
    id: 'R005',
    severity: 'critical',
    recommendedStrategy: 'human-review',
    confidence: confidenceFor('permissionErrors'),
    autoApplyAllowed: false,
    rule: 'R005',
    evidence: [permissionEvidence],
    runHistoryMatches,
  });
}

if (securityEvidence) {
  issues.push({
    id: 'R005-SEC',
    severity: 'critical',
    recommendedStrategy: 'human-review',
    confidence: confidenceFor('securityErrors'),
    autoApplyAllowed: false,
    rule: 'R005-SEC',
    evidence: [securityEvidence],
    runHistoryMatches,
  });
}

const baseRef = run.pull_requests?.[0]?.base?.ref ?? 'main';
const conflictingHighRisk = issues.some((issue) => issue.severity === 'critical');
const lockfileCandidate = issues.find((issue) => issue.recommendedStrategy === 'lockfile-fixer' && issue.autoApplyAllowed === true);

const report = {
  version: 2,
  runId,
  repository: repo,
  headSha: run.head_sha ?? null,
  headBranch: run.head_branch ?? null,
  baseRef,
  event: run.event ?? null,
  generatedAt: new Date().toISOString(),
  failedJobs: failedJobs.map((job) => ({
    id: job.jobId,
    name: job.job,
    failedSteps: job.steps.filter((step) => step.conclusion === 'failure').map((step) => step.name),
  })),
  workspace: { packageJsonExists, packageLockExists },
  runHistoryMatches,
  issues,
  decision: lockfileCandidate && !conflictingHighRisk
    ? 'candidate-for-safe-dry-run'
    : 'human-review-required',
  recommendedStrategy: lockfileCandidate && !conflictingHighRisk ? 'lockfile-fixer' : 'human-review',
  confidence: lockfileCandidate?.confidence ?? Math.max(0, ...issues.map((issue) => issue.confidence)),
  policy: {
    minimumConfidence: 0.85,
    srcAutoMutation: false,
    majorDependencyAutoMutation: false,
    productionAutoMerge: false,
    defaultMode: 'dry-run',
    automaticStrategies: ['lockfile-fixer'],
    automaticStrategyRequirement: 'autoApplyAllowed === true and confidence >= 0.85',
  },
};

fs.writeFileSync('.github/diagnosis-report.json', JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(outDir, `${runId}.json`), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
