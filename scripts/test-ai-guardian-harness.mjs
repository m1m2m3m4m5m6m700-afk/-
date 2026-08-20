import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = process.cwd();
const diagnoseSourcePath = path.join(repoRoot, '.github/scripts/diagnose.js');
const source = fs.readFileSync(diagnoseSourcePath, 'utf8');

const requiredContracts = [
  ['AI feature flag', "FLIXO_AI_ERROR_DIAGNOSIS !== 'false'"],
  ['allowed strategy guard', "allowedStrategies.has(parsed.recommendedStrategy)"],
  ['confidence clamp', 'clampConfidence(parsed.confidence)'],
  ['main safety', 'Do not suggest modifying main'],
  ['dry-run policy', "defaultMode: 'dry-run'"],
  ['production merge protection', 'productionAutoMerge: false'],
  ['secret redaction', 'redactSecrets(corpus)'],
];
for (const [name, needle] of requiredContracts) {
  if (!source.includes(needle)) throw new Error(`Missing diagnosis safety contract: ${name}`);
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'flixo-ai-guardian-'));
const binDir = path.join(tempRoot, 'bin');
fs.mkdirSync(binDir, { recursive: true });
const fakeCurl = path.join(binDir, 'curl');
const preload = path.join(tempRoot, 'mock-ai.mjs');

fs.writeFileSync(fakeCurl, `#!/usr/bin/env node
const url = process.argv.at(-1) || '';
const scenario = process.env.HARNESS_SCENARIO || 'unknown';
const run = { id: 424242, head_sha: 'synthetic-sha', head_branch: 'experimental', event: 'pull_request', pull_requests: [{ base: { ref: 'main' } }] };
const lockText = 'npm ERR! code ERESOLVE\\nnpm ERR! package-lock.json is out of date with package.json';
const unknownText = 'Tool runtime exploded: quantum parser returned impossible state';
const jobs = { jobs: [{ id: 9001, name: 'Synthetic Failure', conclusion: 'failure', steps: [{ name: 'Install dependencies', conclusion: 'failure' }] }] };
if (url.includes('/actions/runs/424242/jobs')) process.stdout.write(JSON.stringify(jobs));
else if (url.includes('/actions/jobs/9001/logs')) process.stdout.write(scenario === 'lockfile' ? lockText : unknownText);
else if (url.includes('/actions/runs/424242')) process.stdout.write(JSON.stringify(run));
else if (url.includes('/actions/runs?')) process.stdout.write(JSON.stringify({ workflow_runs: [] }));
else process.stdout.write('{}');
`, { mode: 0o755 });

fs.writeFileSync(preload, `globalThis.fetch = async () => ({
  ok: true,
  status: 200,
  async json() {
    const lockfile = process.env.HARNESS_SCENARIO === 'lockfile';
    return { choices: [{ message: { content: JSON.stringify({
      rootCause: lockfile ? 'package-lock.json is inconsistent with package.json' : 'Unknown synthetic CI failure',
      explanation: lockfile ? 'The dependency install error indicates a lockfile mismatch.' : 'The supplied evidence does not match a known safe repair pattern.',
      confidence: lockfile ? 0.95 : 0.42,
      recommendedStrategy: lockfile ? 'lockfile-fixer' : 'human-review',
      evidence: [lockfile ? 'synthetic ERESOLVE lockfile mismatch' : 'synthetic unknown runtime error'],
      needsHumanReview: !lockfile
    }) } }] };
  }
});
`);

function runScenario(name) {
  const scenarioDir = path.join(tempRoot, name);
  fs.mkdirSync(path.join(scenarioDir, '.github/scripts'), { recursive: true });
  fs.mkdirSync(path.join(scenarioDir, '.github/self-healing/logs'), { recursive: true });
  fs.copyFileSync(diagnoseSourcePath, path.join(scenarioDir, '.github/scripts/diagnose.js'));
  const env = {
    ...process.env,
    PATH: `${binDir}${path.delimiter}${process.env.PATH}`,
    RUN_ID: '424242',
    REPOSITORY: 'm1m2m3m4m5m6m700-afk/FLIXO-AI-TOOLS',
    GH_TOKEN: 'synthetic-token',
    FLIXO_AI_ERROR_DIAGNOSIS: 'true',
    OPENAI_API_KEY: 'synthetic-openai-key',
    OPENAI_MODEL: 'synthetic-model',
    HARNESS_SCENARIO: name,
    NODE_OPTIONS: `--import=${preload}`,
  };
  const result = spawnSync(process.execPath, [path.join(scenarioDir, '.github/scripts/diagnose.js')], { cwd: scenarioDir, env, encoding: 'utf8', timeout: 30000 });
  if (result.status !== 0) throw new Error(`${name} diagnosis failed:\n${result.stderr || result.stdout}`);
  const reportPath = path.join(scenarioDir, '.github/diagnosis-report.json');
  if (!fs.existsSync(reportPath)) throw new Error(`${name}: diagnosis-report.json was not created`);
  return JSON.parse(fs.readFileSync(reportPath, 'utf8'));
}

const unknown = runScenario('unknown');
if (unknown.aiDiagnosis.status !== 'success') throw new Error('unknown: AI was not invoked successfully');
if (unknown.aiDiagnosis.recommendedStrategy !== 'human-review') throw new Error('unknown: unsafe strategy was accepted');
if (unknown.aiDiagnosis.confidence >= 0.85) throw new Error('unknown: synthetic low-confidence case exceeded safe threshold');
if (unknown.decision !== 'human-review-required') throw new Error('unknown: safety policy did not require human review');

const lockfile = runScenario('lockfile');
if (lockfile.aiDiagnosis.status !== 'success') throw new Error('lockfile: AI was not invoked successfully');
if (lockfile.aiDiagnosis.recommendedStrategy !== 'lockfile-fixer') throw new Error('lockfile: AI did not return the expected allow-listed strategy');
if (lockfile.aiDiagnosis.confidence < 0.85) throw new Error('lockfile: confidence did not reach safe threshold');
if (lockfile.decision !== 'candidate-for-safe-dry-run') throw new Error('lockfile: safety policy did not produce the expected dry-run decision');
if (lockfile.recommendedStrategy !== 'lockfile-fixer') throw new Error('lockfile: deterministic policy and AI did not agree');

console.log(JSON.stringify({
  status: 'PASS',
  scenarios: {
    unknown: { aiInvoked: true, confidence: unknown.aiDiagnosis.confidence, decision: unknown.decision },
    lockfile: { aiInvoked: true, confidence: lockfile.aiDiagnosis.confidence, decision: lockfile.decision, strategy: lockfile.recommendedStrategy },
  },
  safety: { allowListEnforced: true, mainProtected: true, dryRun: true, secretRedactionContractPresent: true },
}, null, 2));
