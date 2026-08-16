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

const INTERNAL_ARTIFACTS = new Set(['.github/diagnosis-report.json']);
const INTERNAL_ARTIFACT_PREFIXES = ['.github/self-healing/logs/'];
function isInternalArtifact(file) {
  return INTERNAL_ARTIFACTS.has(file)
    || INTERNAL_ARTIFACT_PREFIXES.some((prefix) => file.startsWith(prefix));
}

function fileListFromStatus() {
  return capture('git', ['status', '--porcelain'])
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.slice(3))
    .filter((file) => !isInternalArtifact(file));
}

function validateAllowlist(files, strategy) {
  const valid = strategy === 'lint-fixer'
    ? (file) => file.startsWith('tests/')
    : (file) => file === 'package-lock.json';
  const forbidden = files.filter((file) => !valid(file));
  if (forbidden.length) {
    throw new Error(`${strategy} touched forbidden paths: ${forbidden.join(', ')}`);
  }
}

function scanDiffForSecrets(diffText) {
  const secretPatterns = [
    /ghp_[A-Za-z0-9_]{20,}/,
    /github_pat_[A-Za-z0-9_]{20,}/,
    /sk-[A-Za-z0-9]{20,}/,
    /AIza[0-9A-Za-z_-]{20,}/,
    /AKIA[0-9A-Z]{16}/,
    /xox[baprs]-[0-9A-Za-z-]{10,}/,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /(?:api[_-]?key|access[_-]?token|secret[_-]?key|password)\s*[:=]\s*["']?[^\s"']{12,}/i,
  ];
  return secretPatterns.some((pattern) => pattern.test(diffText));
}

function finalPrGuard({ changed, stagedDiff, issue }) {
  const expected = ['package-lock.json'];
  if (JSON.stringify(changed) !== JSON.stringify(expected)) {
    throw new Error(`PR guard rejected changed paths: ${JSON.stringify(changed)}`);
  }
  if (issue.autoApplyAllowed === true) {
    throw new Error('PR guard rejected autoApplyAllowed=true; this workflow is PR-only and must remain human-reviewed.');
  }
  if (!stagedDiff || stagedDiff.trim().length === 0) {
    throw new Error('PR guard rejected empty staged diff.');
  }
  if (scanDiffForSecrets(stagedDiff)) {
    throw new Error('PR guard rejected the staged diff because it matches a potential secret pattern.');
  }
  writeDecision({
    decision: 'pr-guard-passed',
    strategy: issue.recommendedStrategy,
    confidence: issue.confidence,
    changed,
    guard: {
      allowlist: expected,
      autoApplyAllowed: issue.autoApplyAllowed === true,
      secretScan: 'passed',
    },
  });
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
    console.log(`npm package-lock config before fixer: ${capture('npm', ['config', 'get', 'package-lock']).trim()}`);
    run('npm', ['install', '--package-lock-only', '--ignore-scripts', '--package-lock=true']);
    if (fs.readFileSync('package.json', 'utf8') !== beforeManifest) {
      throw new Error('lockfile fixer changed package.json; aborting');
    }
    if (!fs.existsSync('package-lock.json')) {
      throw new Error('lockfile fixer completed without generating package-lock.json');
    }
    console.log(`Generated package-lock.json: ${fs.statSync('package-lock.json').size} bytes`);
  }

  if (strategy === 'lint-fixer') {
    run('npx', ['eslint', 'tests', '--fix']);
  }

  const workingTreeFiles = fileListFromStatus();
  console.log(`Working tree after fixer (excluding diagnostic artifacts): ${JSON.stringify(workingTreeFiles)}`);
  validateAllowlist(workingTreeFiles, strategy);
  if (!workingTreeFiles.length) throw new Error('Fixer produced no changes');

  run('git', ['add', '--', ...workingTreeFiles]);
  run('git', ['diff', '--cached', '--check']);

  const changed = capture('git', ['diff', '--cached', '--name-only']).trim().split(/\r?\n/).filter(Boolean);
  console.log(`Staged files: ${JSON.stringify(changed)}`);
  if (!changed.length) throw new Error('Fixer produced no staged changes');
  validateAllowlist(changed, strategy);

  const stagedDiff = capture('git', ['diff', '--cached', '--', ...changed]);
  const diffPath = `${logDir}/${runId}-dryrun.diff`;
  fs.writeFileSync(diffPath, stagedDiff);

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

  if (mode === 'pr') {
    finalPrGuard({ changed, stagedDiff, issue });
  }

  run('git', ['config', 'user.name', 'flixo-self-heal']);
  run('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
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
    '- Final PR guard passed before commit/push.',
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
