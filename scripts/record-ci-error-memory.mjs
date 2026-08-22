import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const memoryPath = 'docs/ERROR_MEMORY.md';
const summaryPath = process.env.GITHUB_STEP_SUMMARY;
const context = {
  sha: process.env.GITHUB_SHA || 'unknown',
  runId: process.env.GITHUB_RUN_ID || 'unknown',
  runNumber: process.env.GITHUB_RUN_NUMBER || 'unknown',
  job: process.env.GITHUB_JOB || 'unknown',
  ref: process.env.GITHUB_REF_NAME || 'unknown',
  repo: process.env.GITHUB_REPOSITORY || '',
};

function normalizeDiagnostic(value) {
  return value.toLowerCase().replace(/https?:\/\/\S+/g, '<url>').replace(/\b[0-9a-f]{8,}\b/gi, '<id>').replace(/\d+/g, '<n>').replace(/\s+/g, ' ').trim().slice(0, 240);
}

function fingerprint(text) {
  const value = normalizeDiagnostic(text);
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `flx-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function extractDiagnostics() {
  const text = readFileSync(0, 'utf8');
  const lines = text.split(/\r?\n/).filter(Boolean);
  const errors = lines.filter((line) => /(?:error|failed|failure|exception|fatal|TS\d{4})/i.test(line)).slice(-20);
  return errors.length ? errors : ['No structured error lines were captured.'];
}

function localUpdate(entry) {
  mkdirSync('docs', { recursive: true });
  if (!existsSync(memoryPath)) writeFileSync(memoryPath, '# FLIXO Error Memory\n\n');
  appendFileSync(memoryPath, entry);
}

async function persistToGitHub(entry) {
  const token = process.env.GITHUB_TOKEN;
  if (!token || !context.repo) return false;
  const eventPath = process.env.GITHUB_EVENT_PATH;
  let event = {};
  if (eventPath && existsSync(eventPath)) event = JSON.parse(readFileSync(eventPath, 'utf8'));
  const headRepo = event?.pull_request?.head?.repo?.full_name;
  const targetRepo = headRepo && headRepo === context.repo ? headRepo : context.repo;
  if (headRepo && headRepo !== context.repo) return false;
  const branch = event?.pull_request?.head?.ref || process.env.GITHUB_REF_NAME;
  if (!branch || branch.startsWith('pull/')) return false;
  const url = `https://api.github.com/repos/${targetRepo}/contents/${memoryPath}?ref=${encodeURIComponent(branch)}`;
  const headers = { accept: 'application/vnd.github+json', authorization: `Bearer ${token}`, 'x-github-api-version': '2022-11-28' };
  const currentResponse = await fetch(url, { headers });
  let currentSha;
  let currentContent = '# FLIXO Error Memory\n\n';
  if (currentResponse.ok) {
    const current = await currentResponse.json();
    currentSha = current.sha;
    currentContent = Buffer.from(current.content.replace(/\n/g, ''), 'base64').toString('utf8');
  } else if (currentResponse.status !== 404) throw new Error(`Error memory read failed: ${currentResponse.status}`);
  const nextContent = `${currentContent.replace(/\s*$/, '')}\n\n${entry.trim()}\n`;
  const payload = { message: 'ci(diagnostics): record verified failure [skip ci]', content: Buffer.from(nextContent, 'utf8').toString('base64'), branch, ...(currentSha ? { sha: currentSha } : {}) };
  const writeResponse = await fetch(url, { method: 'PUT', headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  if (!writeResponse.ok) throw new Error(`Error memory write failed: ${writeResponse.status}`);
  return true;
}

const errors = extractDiagnostics();
const dominant = errors.join(' | ');
const entry = [
  `## CI failure ${new Date().toISOString()}`,
  `- Fingerprint: \`${fingerprint(dominant)}\``,
  `- SHA: \`${context.sha}\``,
  `- Run: [#${context.runNumber}](https://github.com/${context.repo}/actions/runs/${context.runId})`,
  `- Job: \`${context.job}\``,
  `- Ref: \`${context.ref}\``,
  '',
  '### Extracted diagnostics',
  ...errors.map((line) => `- ${line.replace(/\|/g, '\\|')}`),
  '',
  '### Correlation',
  '- Client trace IDs use `x-flixo-trace-id` and W3C `traceparent`; runtime/API diagnostics also emit stable fingerprints.',
  '',
  '---',
].join('\n');

let persisted = false;
try {
  persisted = await persistToGitHub(entry);
} catch (error) {
  console.error(`GitHub Error Memory update failed: ${error instanceof Error ? error.message : String(error)}`);
}
if (!persisted) localUpdate(`\n${entry}\n`);
if (summaryPath) appendFileSync(summaryPath, `\n### Error Memory\n\nRecorded CI failure for \`${context.sha}\` in \`${context.job}\`. Persistent update: ${persisted ? 'yes' : 'no'}. Fingerprint: \`${fingerprint(dominant)}\`.\n`);
process.stdout.write(entry);
