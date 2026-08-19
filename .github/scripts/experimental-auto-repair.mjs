import fs from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export const TARGET_BRANCH = 'experimental';
export const MIN_CONFIDENCE = 0.85;
export const ALLOWED_STRATEGIES = new Set(['lockfile-fixer']);
export const ALLOWED_PATHS = new Set(['package-lock.json']);

export function isRepairEligible(report) {
  if (!report || report.headBranch !== TARGET_BRANCH) return false;
  if (report.baseRef && report.baseRef !== 'main' && report.baseRef !== TARGET_BRANCH) return false;
  if (report.decision !== 'candidate-for-safe-dry-run') return false;
  const issue = report.issues?.find((candidate) => (
    candidate.confidence >= MIN_CONFIDENCE
    && candidate.autoApplyAllowed === false
    && ALLOWED_STRATEGIES.has(candidate.recommendedStrategy)
  ));
  return Boolean(issue);
}

export function allowedChangedPaths(files) {
  return files.every((file) => ALLOWED_PATHS.has(file));
}

export function selectRepair(report) {
  return report?.issues?.find((candidate) => (
    candidate.confidence >= MIN_CONFIDENCE
    && candidate.autoApplyAllowed === false
    && ALLOWED_STRATEGIES.has(candidate.recommendedStrategy)
  )) ?? null;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} exited with ${result.status}`);
  }
}

function capture(command, args) {
  return execFileSync(command, args, { encoding: 'utf8' });
}

function trackedChanges() {
  return capture('git', ['status', '--porcelain'])
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.slice(3));
}

function writeDecision(data) {
  fs.mkdirSync('.github/self-healing/logs', { recursive: true });
  fs.writeFileSync(
    `.github/self-healing/logs/${process.env.RUN_ID || 'unknown'}-execution.json`,
    JSON.stringify(data, null, 2),
  );
}

function main() {
  const runId = process.env.RUN_ID || 'unknown';
  const repository = process.env.REPOSITORY || process.env.GITHUB_REPOSITORY || '';
  const report = JSON.parse(fs.readFileSync('.github/diagnosis-report.json', 'utf8'));

  if (process.env.GITHUB_REF_NAME !== TARGET_BRANCH) {
    throw new Error(`Refuse execution outside ${TARGET_BRANCH}: ${process.env.GITHUB_REF_NAME || 'unknown'}`);
  }
  if (report.headBranch !== TARGET_BRANCH) {
    throw new Error(`Diagnosis head branch is not ${TARGET_BRANCH}`);
  }
  if (!isRepairEligible(report)) {
    writeDecision({ decision: 'escalate', reason: 'Diagnosis did not satisfy experimental-only safe-repair policy.' });
    console.log('Experimental repair: no eligible safe repair.');
    return;
  }

  const issue = selectRepair(report);
  const branch = `auto-fix/${issue.recommendedStrategy}/${runId}`;
  const failedSha = report.headSha;

  if (!failedSha) throw new Error('Missing failed SHA in diagnosis report');
  if (report.headBranch !== TARGET_BRANCH) throw new Error('Refusing non-experimental source branch');

  try {
    run('git', ['switch', '-c', branch]);

    if (issue.recommendedStrategy === 'lockfile-fixer') {
      const manifestBefore = fs.readFileSync('package.json', 'utf8');
      run('npm', ['install', '--package-lock-only', '--ignore-scripts', '--package-lock=true']);
      if (fs.readFileSync('package.json', 'utf8') !== manifestBefore) {
        throw new Error('lockfile-fixer changed package.json');
      }
      if (!fs.existsSync('package-lock.json')) {
        throw new Error('lockfile-fixer did not produce package-lock.json');
      }
      run('npm', ['ci', '--ignore-scripts']);
      run('npm', ['run', 'validate:dependencies']);
    }

    const changes = trackedChanges();
    if (!changes.length) throw new Error('Repair produced no changes');
    if (!allowedChangedPaths(changes)) {
      throw new Error(`Repair touched forbidden paths: ${changes.join(', ')}`);
    }

    run('git', ['diff', '--check']);
    run('git', ['add', '--', ...changes]);
    run('git', ['diff', '--cached', '--check']);
    const staged = capture('git', ['diff', '--cached', '--name-only']).trim().split(/\r?\n/).filter(Boolean);
    if (!allowedChangedPaths(staged)) {
      throw new Error(`Staged repair touched forbidden paths: ${staged.join(', ')}`);
    }

    run('git', ['config', 'user.name', 'flixo-experimental-repair']);
    run('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
    run('git', ['commit', '-m', `chore(auto-repair): ${issue.recommendedStrategy} from run ${runId}`]);
    run('git', ['push', '--set-upstream', 'origin', branch]);

    const body = [
      '## Experimental-only automatic repair',
      '',
      `Source CI run: ${runId}`,
      `Source SHA: ${failedSha}`,
      `Strategy: ${issue.recommendedStrategy}`,
      `Confidence: ${issue.confidence}`,
      '',
      '### Safety policy',
      '- Source branch was exactly `experimental`.',
      '- Target branch is exactly `experimental`.',
      '- Repair is limited to allow-listed paths.',
      '- `package.json` is immutable for the lockfile fixer.',
      '- `npm ci` and dependency validation run before the PR is opened.',
      '- No push to `main` is permitted by this workflow.',
    ].join('\n');

    run('gh', [
      'pr', 'create',
      '--repo', repository,
      '--head', branch,
      '--base', TARGET_BRANCH,
      '--title', `chore(auto): ${issue.recommendedStrategy} for experimental CI run ${runId}`,
      '--body', body,
    ]);

    writeDecision({
      decision: 'pr-created',
      sourceBranch: TARGET_BRANCH,
      targetBranch: TARGET_BRANCH,
      sourceSha: failedSha,
      branch,
      strategy: issue.recommendedStrategy,
      confidence: issue.confidence,
      changed: staged,
    });
  } catch (error) {
    try { run('git', ['reset', '--hard', 'HEAD']); } catch {}
    try { run('git', ['branch', '-D', branch]); } catch {}
    writeDecision({
      decision: 'rollback-escalate',
      sourceBranch: TARGET_BRANCH,
      targetBranch: TARGET_BRANCH,
      sourceSha: failedSha,
      strategy: issue.recommendedStrategy,
      error: String(error),
    });
    console.error(error);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
