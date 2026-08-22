import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';

const memoryPath = 'ERROR-MEMORY.md';
const summaryPath = process.env.GITHUB_STEP_SUMMARY;
const context = {
  sha: process.env.GITHUB_SHA || 'unknown',
  runId: process.env.GITHUB_RUN_ID || 'unknown',
  runNumber: process.env.GITHUB_RUN_NUMBER || 'unknown',
  job: process.env.GITHUB_JOB || 'unknown',
  ref: process.env.GITHUB_REF_NAME || 'unknown',
};

function extractDiagnostics() {
  const text = readFileSync(0, 'utf8');
  const lines = text.split(/\r?\n/).filter(Boolean);
  const errors = lines.filter((line) => /(?:error|failed|failure|exception|fatal|TS\d{4})/i.test(line)).slice(-20);
  return errors.length ? errors : ['No structured error lines were captured.'];
}

const errors = extractDiagnostics();
const entry = [
  `\n## CI failure ${new Date().toISOString()}`,
  `- SHA: \`${context.sha}\``,
  `- Run: [#${context.runNumber}](https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${context.runId})`,
  `- Job: \`${context.job}\``,
  `- Ref: \`${context.ref}\``,
  '',
  '### Extracted diagnostics',
  ...errors.map((line) => `- ${line.replace(/\|/g, '\\|')}`),
  '',
  '### Correlation',
  `- Client trace IDs are stored by runtime diagnostics and propagated through \`x-flixo-trace-id\`.`,
  '',
  '---',
  '',
].join('\n');

if (!existsSync(memoryPath)) writeFileSync(memoryPath, '# FLIXO Error Memory\n\n');
appendFileSync(memoryPath, entry);
if (summaryPath) appendFileSync(summaryPath, `\n### Error Memory\n\nRecorded CI failure for \`${context.sha}\` in \`${context.job}\`.\n`);
process.stdout.write(entry);
