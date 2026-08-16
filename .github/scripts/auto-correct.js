import fs from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';

const runId = process.env.RUN_ID || 'unknown';
const repo = process.env.REPOSITORY || process.env.GITHUB_REPOSITORY || '';
const report = JSON.parse(fs.readFileSync('.github/diagnosis-report.json', 'utf8'));
const logDir = '.github/self-healing/logs';
fs.mkdirSync(logDir, { recursive: true });

const allowed = new Set(['lockfile-fixer', 'lint-fixer']);
const candidates = report.issues.filter((issue) => issue.autoApplyAllowed && issue.confidence >= 0.8 && allowed.has(issue.recommendedStrategy));

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} exited with ${result.status}`);
}

if (!candidates.length) {
  fs.writeFileSync(`${logDir}/${runId}-decision.json`, JSON.stringify({ decision: 'escalate', reason: 'No allowed high-confidence fixer matched.', candidates: report.issues }, null, 2));
  console.log('Self-heal: escalation required; no safe fixer selected.');
  process.exit(0);
}

const strategy = candidates[0].recommendedStrategy;
const branch = `auto-fix/${strategy}/${runId}`;
run('git', ['switch', '-c', branch]);

try {
  if (strategy === 'lockfile-fixer') {
    const beforeManifest = fs.readFileSync('package.json', 'utf8');
    run('npm', ['install', '--package-lock-only', '--ignore-scripts']);
    if (fs.readFileSync('package.json', 'utf8') !== beforeManifest) throw new Error('lockfile fixer changed package.json; aborting');
    run('git', ['diff', '--exit-code', '--', 'package.json']);
    run('git', ['diff', '--quiet', '--', ':!package-lock.json']);
  }

  if (strategy === 'lint-fixer') {
    run('npx', ['eslint', 'tests', '--fix']);
    const files = execFileSync('git', ['diff', '--name-only'], { encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean);
    if (files.some((file) => !file.startsWith('tests/'))) throw new Error(`lint fixer touched forbidden paths: ${files.join(', ')}`);
  }

  run('npx', ['tsc', '--noEmit']);
  run('npm', ['run', 'lint']);
  run('npm', ['test', '--if-present']);

  const changed = execFileSync('git', ['diff', '--name-only'], { encoding: 'utf8' }).trim();
  if (!changed) throw new Error('Fixer produced no changes');

  run('git', ['config', 'user.name', 'flixo-self-heal']);
  run('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
  run('git', ['add', '--', ...changed.split(/\r?\n/)]);
  run('git', ['commit', '-m', `chore(auto-heal): apply ${strategy} for run ${runId}`]);
  run('git', ['push', '--set-upstream', 'origin', branch]);

  const body = [
    '## Auto-heal generated PR',
    '',
    `Source CI run: ${runId}`,
    `Strategy: ${strategy}`,
    `Confidence: ${candidates[0].confidence}`,
    '',
    '### Governance',
    '- No automatic mutation of src/**.',
    '- No major dependency upgrades.',
    '- Changes are limited to allow-listed paths.',
    '- Human review remains required before merge.',
    '',
    '### Diagnosis',
    '```json',
    JSON.stringify(report, null, 2),
    '```',
  ].join('\n');

  run('gh', ['pr', 'create', '--repo', repo, '--head', branch, '--base', 'main', '--title', `chore(auto): ${strategy} for run ${runId}`, '--body', body]);
  fs.writeFileSync(`${logDir}/${runId}-decision.json`, JSON.stringify({ decision: 'pr-created', branch, strategy, confidence: candidates[0].confidence, changed }, null, 2));
} catch (error) {
  try { run('git', ['reset', '--hard', 'HEAD']); } catch {}
  try { run('git', ['switch', 'main']); } catch {}
  fs.writeFileSync(`${logDir}/${runId}-decision.json`, JSON.stringify({ decision: 'rollback-escalate', strategy, error: String(error) }, null, 2));
  console.error(error);
  process.exitCode = 0;
}
