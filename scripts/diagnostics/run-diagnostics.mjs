import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const checks = [
  { id: 'environment', script: 'scripts/diagnostics/capture-environment.mjs' },
  { id: 'error-memory', script: 'scripts/diagnostics/validate-error-memory.mjs' },
  { id: 'dependency-drift', script: 'scripts/diagnostics/check-dependency-drift.mjs' },
  { id: 'workflow-scan', script: 'scripts/diagnostics/scan-workflows.mjs' },
  { id: 'tool-contract', script: 'scripts/diagnostics/probe-tool-contracts.mjs' },
];

const startedAt = new Date().toISOString();
const results = [];

function runNode(script) {
  return new Promise((resolvePromise) => {
    const child = spawn(process.execPath, [script], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('close', (code) => resolvePromise({ code: code ?? 1, stdout, stderr }));
  });
}

for (const check of checks) {
  const started = Date.now();
  const result = await runNode(check.script);
  results.push({
    id: check.id,
    status: result.code === 0 ? 'PASS' : 'FAIL',
    durationMs: Date.now() - started,
    exitCode: result.code,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
  });
}

const summary = {
  schemaVersion: 1,
  startedAt,
  finishedAt: new Date().toISOString(),
  counts: {
    pass: results.filter((result) => result.status === 'PASS').length,
    fail: results.filter((result) => result.status === 'FAIL').length,
  },
  results,
};

const outputDir = resolve('artifacts/diagnostics');
await mkdir(outputDir, { recursive: true });
await writeFile(resolve(outputDir, 'diagnostic-report.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

console.log(`DIAGNOSTIC_RUN ${summary.counts.pass} PASS / ${summary.counts.fail} FAIL`);
for (const result of results) {
  console.log(`${result.status.padEnd(4)} ${result.id} (${result.durationMs}ms)`);
  if (result.stdout) console.log(result.stdout);
  if (result.stderr) console.error(result.stderr);
}

process.exit(summary.counts.fail > 0 ? 1 : 0);
