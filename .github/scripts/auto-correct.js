import fs from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';

const runId = process.env.RUN_ID || 'unknown';
const repo = process.env.REPOSITORY || process.env.GITHUB_REPOSITORY || '';
const mode = process.env.SELF_HEAL_MODE || 'dry-run';
const report = JSON.parse(fs.readFileSync('.github/diagnosis-report.json', 'utf8'));
const logDir = '.github/self-healing/logs';
fs.mkdirSync(logDir, { recursive: true });

const minConfidence = Number(report.policy?.minimumConfidence ?? 0.85);
const allowed = new Set(['lockfile-fixer', 'lint-fixer']);
const candidates = report.issues.filter((issue) => (
  issue.confidence >= minConfidence
  && allowed.has(issue.recommendedStrategy)
  && (issue.autoApplyAllowed === true || report.decision === 'candidate-for-safe-dry-run')
));

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} exited with ${result.status}`);
  }
}

function capture(command, args) {
  return execFileSync(command, args, { encoding: 'utf8' });
}

function writeDecision(data) {
  fs.writeFileSync(
    `${logDir}/${runId}-decision.json`,
    JSON.stringify({ runId, mode, failedSha: report.headSha, ...data }, null, 2),
  );
}

if (!['dry-run', 'pr', 'apply'].includes(mode)) {
  writeDecision({ decision: 'escalate', reason: `Unsupported SELF_HEAL_MODE: ${mode}` });
  console.error(`Self-heal: unsupported mode ${mode}.`);
  process.exit(1);
}

if (!candidates.length) {
  writeDecision({
    decision: 'escalate',
    reason: 'No high-confidence safe fixer matched the diagnosis.',
    candidates: report.issues,
  });
  console.log('Self-heal: escalation required; no safe fixer selected.');
  process.exit(0);
}

const issue = candidates[0];
const strategy = issue.recommendedStrategy;
const branch = `auto-fix/${strategy}/${runId}`;

try {
  run('git', ['switch', '-c', branch]);

  if (strategy === 'lockfile-fixer') {
    const beforeManifest = fs.readFileSync('package.json', 'utf8');
    run('npm', ['install', '--package-lock-only', '--ignore-scripts']);
    if (fs.readFileSync('package.json', 'utf8') !== beforeManifest) {
      throw new Error('lockfile fixer changed package.json; aborting');
    }
    const files = capture('git', ['diff', '--name-only']).trim().split(/\r?\n/).filter(Boolean);
    if (files.some((file) => file !== 'package-lock.json')) {
      throw new Error(`lockfile fixer touched forbidden paths: ${files.join(', ')}`);
    }
  }

  if (strategy === 'lint-fixer') {
    run('npx', ['eslint', 'tests', '--fix']);
    const files = capture('git', ['diff', '--name-only']).trim().split(/\r?\n/).filter(Boolean);
    if (files.some((file) => !file.startsWith('tests/'))) {
      throw new Error(`lint fixer touched forbidden paths: ${files.join(', ')}`);
    }
  }

  run('git', ['diff', '--check']);

  const changed = capture('git', ['diff', '--name-only']).trim().split(/\r?\n/).filter(Boolean);
  if (!changed.length) throw new Error('Fixer produced no changes');

  const diffPath = `${logDir}/${runId}-dryrun.diff`;
  fs.writeFileSync(diffPath, capture('git', ['diff', '--', ...changed]));

  if (mode === 'dry-run') {
    writeDecision({
      decision: 'dry-run-passed',
      strategy,
      confidence: issue.confidence,
      ruleId: issue.rule || issue.id,
      changed,
      diffPath,
      autoApplyAllowed: issue.autoApplyAllowed === true,
    });
    console.log(`Self-heal: dry-run passed for ${strategy}; no commit/push/PR performed.`);
    process.exit(0);
  }

  if (mode === 'apply' && issue.autoApplyAllowed !== true) {
    throw new Error('Apply mode requires explicit autoApplyAllowed=true from the diagnosis policy');
  }

  // PR mode creates a reviewable PR only after the dry-run mutation passed.
  run('git', ['config', 'user.name', 'flixo-self-heal']);
  run('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
  run('git', ['add', '--', ...changed]);
  run('git', ['commit', '-m', `chore(auto-heal): apply ${strategy} for run ${runId}`]);
  run('git', ['push', '--set-upstream', 'origin', branch]);

  const body = [
    '## Auto-heal generated PR',
    '',
    `Source CI run: ${runId}`,
    `Failed SHA: ${report.headSha}`,
    `Strategy: ${strategy}`,
    `Confidence: ${issue.confidence}`,
    `Rule: ${issue.rule || issue.id}`,
    '',
    '### Governance',
    '- Dry-run completed before commit.',
    '- No automatic mutation of src/**.',
    '- No major dependency upgrades.',
    '- Changes are limited to allow-listed paths.',
    '- Human review remains required before merge.',
    '',
    '### Diagnosis',
    '```json',
    JSON.stringify(report, null, 2),
    '```',
    '',
    '### Dry-run diff',
    'See the uploaded diagnostic artifact for the exact diff.',
  ].join('\n');

  run('gh', [
    'pr', 'create', '--repo', repo, '--head', branch, '--base', report.baseRef || 'main',
    '--title', `chore(auto): ${strategy} for run ${runId}`,
    '--body', body,
  ]);

  writeDecision({
    decision: 'pr-created',
    strategy,
    confidence: issue.confidence,
    ruleId: issue.rule || issue.id,
    changed,
    diffPath,
  });
} catch (error) {
  try { run('git', ['reset', '--hard', 'HEAD']); } catch {}
  writeDecision({
    decision: 'rollback-escalate',
    strategy,
    error: String(error),
  });
  console.error(error);
  process.exitCode = 0;
}
