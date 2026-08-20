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
const allowedStrategies = new Set(['lockfile-fixer', 'test-retry-fixer', 'environment-review', 'human-review', 'none']);
const clampConfidence = (value) => Math.max(0, Math.min(1, Number(value) || 0));

function providerConfig() {
  const read = (name) => process.env[name]?.trim() || undefined;
  const openai = { id: 'openai', apiKey: read('OPENAI_API_KEY'), model: read('OPENAI_MODEL') || 'gpt-4o-mini', baseUrl: read('OPENAI_BASE_URL') || 'https://api.openai.com/v1' };
  const gemini = { id: 'gemini', apiKey: read('GEMINI_API_KEY'), model: read('GEMINI_MODEL') || 'gemini-2.5-flash-lite', baseUrl: read('GEMINI_BASE_URL') || 'https://generativelanguage.googleapis.com' };
  const openrouter = { id: 'openrouter', apiKey: read('OPENROUTER_API_KEY'), model: read('OPENROUTER_FREE_MODEL') || 'openrouter/free', baseUrl: read('OPENROUTER_BASE_URL') || 'https://openrouter.ai/api/v1' };
  const active = ['openai', 'gemini', 'openrouter'].includes(read('FLIXO_AI_PROVIDER') || '') ? read('FLIXO_AI_PROVIDER') : 'openai';
  const fallback = ['openai', 'gemini', 'openrouter'].includes(read('FLIXO_AI_FALLBACK_PROVIDER') || '') ? read('FLIXO_AI_FALLBACK_PROVIDER') : undefined;
  const ordered = [...new Set([active, fallback].filter(Boolean))];
  return { providers: { openai, gemini, openrouter }, ordered, timeoutMs: Number.parseInt(read('FLIXO_AI_TIMEOUT_MS') || '20000', 10) || 20000 };
}

function extractJson(text) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] || text.match(/\{[\s\S]*\}/)?.[0];
  if (!candidate) return null;
  try { return JSON.parse(candidate); } catch { return null; }
}

function redactSecrets(text) {
  return text
    .replace(/(Authorization:\s*Bearer\s+)[^\s\r\n]+/gi, '$1[REDACTED]')
    .replace(/(Bearer\s+)[A-Za-z0-9._-]{12,}/gi, '$1[REDACTED]')
    .replace(/\b(?:sk|sk-proj)-[A-Za-z0-9_-]{12,}\b/g, '[REDACTED_OPENAI_KEY]')
    .replace(/\bAIza[A-Za-z0-9_-]{20,}\b/g, '[REDACTED_GEMINI_KEY]')
    .replace(/\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g, '[REDACTED_GITHUB_TOKEN]')
    .replace(/(OPENAI_API_KEY|GEMINI_API_KEY|OPENROUTER_API_KEY)\s*[:=]\s*[^\s\r\n]+/gi, '$1=[REDACTED]');
}

async function callAiProvider(provider, prompt, signal) {
  if (!provider.apiKey) return { ok: false, retryable: false };
  if (provider.id === 'gemini') {
    const response = await fetch(`${provider.baseUrl}/v1beta/models/${encodeURIComponent(provider.model)}:generateContent?key=${encodeURIComponent(provider.apiKey)}`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, signal,
      body: JSON.stringify({ systemInstruction: { parts: [{ text: 'You are Flixo CI Error Diagnosis. Analyze evidence only. Never authorize code changes. Return JSON only.' }] }, contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1, maxOutputTokens: 700 } }),
    });
    if (!response.ok) return { ok: false, retryable: response.status === 408 || response.status === 429 || response.status >= 500 };
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '';
    return { ok: Boolean(text), text, retryable: !text };
  }
  const response = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${provider.apiKey}`, ...(provider.id === 'openrouter' ? { 'http-referer': 'https://flixoai.vercel.app', 'x-title': 'Flixo' } : {}) },
    signal,
    body: JSON.stringify({ model: provider.model, messages: [{ role: 'system', content: 'You are Flixo CI Error Diagnosis. Analyze evidence only. Never authorize code changes. Return JSON only.' }, { role: 'user', content: prompt }], temperature: 0.1, max_tokens: 700 }),
  });
  if (!response.ok) return { ok: false, retryable: response.status === 408 || response.status === 429 || response.status >= 500 };
  const data = await response.json();
  const text = typeof data.choices?.[0]?.message?.content === 'string' ? data.choices[0].message.content : '';
  return { ok: Boolean(text), text, retryable: !text };
}

async function aiDiagnose({ failedJobs, issues, corpus, baseRef }) {
  const enabled = process.env.FLIXO_AI_ERROR_DIAGNOSIS !== 'false';
  const config = providerConfig();
  const configured = config.ordered.map((id) => config.providers[id]).filter((provider) => provider.apiKey);
  if (!enabled) return { status: 'disabled', reason: 'FLIXO_AI_ERROR_DIAGNOSIS=false' };
  if (!configured.length) return { status: 'unavailable', reason: 'No supported AI provider credentials are available to the workflow.' };

  const prompt = [
    'Analyze this failed CI run and return exactly one JSON object with keys:',
    'rootCause, explanation, confidence, recommendedStrategy, evidence, needsHumanReview.',
    'recommendedStrategy must be one of: lockfile-fixer, test-retry-fixer, environment-review, human-review, none.',
    'confidence must be a number from 0 to 1. Never claim certainty from weak evidence.',
    'Do not invent missing log details. Do not suggest modifying main. Auto-repair is only separately authorized by deterministic policy.',
    `Base branch: ${baseRef}`,
    `Failed jobs: ${JSON.stringify(failedJobs.map((job) => ({ name: job.job, failedSteps: job.steps.filter((step) => step.conclusion === 'failure').map((step) => step.name) })))}`,
    `Deterministic findings: ${JSON.stringify(issues)}`,
    `CI logs (redacted and truncated):\n${redactSecrets(corpus).slice(-30000)}`,
  ].join('\n\n');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    let lastError = 'AI provider unavailable';
    for (const provider of configured) {
      try {
        const result = await callAiProvider(provider, prompt, controller.signal);
        if (!result.ok) { lastError = `${provider.id} unavailable`; continue; }
        const parsed = extractJson(result.text);
        if (!parsed || typeof parsed !== 'object') { lastError = `${provider.id} returned invalid JSON`; continue; }
        const recommendation = allowedStrategies.has(parsed.recommendedStrategy) ? parsed.recommendedStrategy : 'human-review';
        const confidence = clampConfidence(parsed.confidence);
        return {
          status: 'success', provider: provider.id, model: provider.model,
          rootCause: typeof parsed.rootCause === 'string' ? parsed.rootCause.slice(0, 1000) : 'Unknown',
          explanation: typeof parsed.explanation === 'string' ? parsed.explanation.slice(0, 2000) : '',
          confidence,
          recommendedStrategy: recommendation,
          evidence: Array.isArray(parsed.evidence) ? parsed.evidence.slice(0, 8) : [],
          needsHumanReview: parsed.needsHumanReview !== false || confidence < 0.85 || recommendation === 'human-review',
        };
      } catch (error) {
        lastError = `${provider.id}: ${error instanceof Error ? error.message : String(error)}`;
      }
      if (controller.signal.aborted) break;
    }
    return { status: 'failed', reason: lastError };
  } finally {
    clearTimeout(timeout);
  }
}

const aiDiagnosis = await aiDiagnose({ failedJobs, issues, corpus: failedCorpus || corpus, baseRef });

const conflictingHighRisk = issues.some((issue) => issue.severity === 'critical');
const lockfileCandidate = issues.find((issue) => issue.recommendedStrategy === 'lockfile-fixer' && issue.autoApplyAllowed === true);
const aiAgreesWithSafeRepair = aiDiagnosis.status === 'success'
  && aiDiagnosis.recommendedStrategy === 'lockfile-fixer'
  && aiDiagnosis.confidence >= 0.85;

const report = {
  version: 3,
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
  aiDiagnosis,
  decision: lockfileCandidate && !conflictingHighRisk && (aiDiagnosis.status !== 'success' || aiAgreesWithSafeRepair)
    ? 'candidate-for-safe-dry-run'
    : 'human-review-required',
  recommendedStrategy: lockfileCandidate && !conflictingHighRisk && (aiDiagnosis.status !== 'success' || aiAgreesWithSafeRepair) ? 'lockfile-fixer' : 'human-review',
  confidence: Math.max(lockfileCandidate?.confidence ?? 0, aiDiagnosis.status === 'success' ? aiDiagnosis.confidence : 0),
  policy: {
    minimumConfidence: 0.85,
    srcAutoMutation: false,
    majorDependencyAutoMutation: false,
    productionAutoMerge: false,
    defaultMode: 'dry-run',
    automaticStrategies: ['lockfile-fixer'],
    automaticStrategyRequirement: 'deterministic allow-list + confidence >= 0.85; AI recommendation can only confirm, never grant, repair permission',
  },
};

fs.writeFileSync('.github/diagnosis-report.json', JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(outDir, `${runId}.json`), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
