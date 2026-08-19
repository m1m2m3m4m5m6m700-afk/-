import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { buildCognitiveAssessment } from './cognitive/cognitive-engine.mjs';
import { buildStrategicPlan } from './planning/strategic-planner.mjs';
import { isRepairEligible, selectRepair, ALLOWED_PATHS, MIN_CONFIDENCE } from '../../.github/scripts/experimental-auto-repair.mjs';

const TARGET_BRANCH = 'experimental';
const REPORT_PATH = '.github/preflight-report.json';

function branchName() {
  return execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim();
}

function run(command, args) {
  try {
    return { ok: true, output: execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }) };
  } catch (error) {
    const stdout = error.stdout?.toString?.() ?? '';
    const stderr = error.stderr?.toString?.() ?? '';
    return { ok: false, output: `${stdout}\n${stderr}`.trim(), code: error.status ?? 1 };
  }
}

function writeReport(report) {
  fs.mkdirSync('.github', { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
}

function changedFiles() {
  return execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' })
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.slice(3));
}

function assertOnlyLockfileChanged(beforePackageJson) {
  const changed = changedFiles();
  if (!changed.length) throw new Error('Repair produced no tracked changes.');
  if (!changed.every((file) => ALLOWED_PATHS.has(file))) {
    throw new Error(`Repair touched forbidden paths: ${changed.join(', ')}`);
  }
  if (fs.readFileSync('package.json', 'utf8') !== beforePackageJson) {
    throw new Error('package.json changed during lockfile repair.');
  }
}

function dependencyRepair(log) {
  const assessment = buildCognitiveAssessment({ log });
  const plan = buildStrategicPlan(assessment);
  const report = {
    version: 1,
    mode: 'pre-ci',
    branch: TARGET_BRANCH,
    diagnosis: assessment.diagnosis,
    cognitive: {
      deterministic: assessment.deterministic,
      similarDecisions: assessment.similarDecisions,
      dependencyImpact: assessment.dependencyImpact,
    },
    plan,
    issues: plan.steps.map((step) => ({
      id: step.id,
      strategy: step.id === 'dependency-repair' ? 'lockfile-fixer' : 'manual-review',
      confidence: assessment.diagnosis.confidence,
      autoApplyAllowed: false,
    })),
  };
  writeReport(report);
  return { assessment, plan, report };
}

function fixLockfile() {
  const beforePackageJson = fs.readFileSync('package.json', 'utf8');
  const result = run('npm', ['install', '--package-lock-only', '--ignore-scripts', '--package-lock=true']);
  if (!result.ok) throw new Error(`lockfile-fixer failed:\n${result.output}`);
  assertOnlyLockfileChanged(beforePackageJson);
  const npmCi = run('npm', ['ci', '--ignore-scripts']);
  if (!npmCi.ok) throw new Error(`npm ci still fails after repair:\n${npmCi.output}`);
  const dependencyContract = run('npm', ['run', 'validate:dependencies']);
  if (!dependencyContract.ok) throw new Error(`dependency contract failed after repair:\n${dependencyContract.output}`);
  execFileSync('git', ['add', '--', 'package-lock.json'], { stdio: 'inherit' });
}

export function preflight() {
  if (process.env.CI === 'true' || process.env.CI === '1') {
    return { skipped: true, reason: 'CI environment; server-side repair policy owns fallback healing.' };
  }

  const branch = branchName();
  if (branch !== TARGET_BRANCH) {
    const message = `Pre-CI auto-repair is locked to ${TARGET_BRANCH}; refusing branch ${branch || 'detached'}.`;
    writeReport({ version: 1, mode: 'pre-ci', branch, status: 'blocked', reason: message });
    throw new Error(message);
  }

  const checks = [];
  let repaired = false;
  checks.push(['validate-ci-contract', run('npm', ['run', 'validate-ci-contract'])]);
  checks.push(['validate-dependencies', run('npm', ['run', 'validate:dependencies'])]);
  checks.push(['npm-ci', run('npm', ['ci', '--ignore-scripts'])]);

  const failed = checks.filter(([, result]) => !result.ok);
  if (failed.length) {
    const log = failed.map(([name, result]) => `### ${name}\n${result.output}`).join('\n');
    const { report } = dependencyRepair(log);
    const synthetic = {
      ...report,
      headBranch: TARGET_BRANCH,
      decision: report.plan.steps.some((step) => step.id === 'dependency-repair') ? 'candidate-for-safe-dry-run' : 'human-review-required',
      issues: report.issues.map((issue) => ({
        ...issue,
        recommendedStrategy: issue.strategy,
        confidence: report.diagnosis.confidence,
        autoApplyAllowed: false,
      })),
      policy: { minimumConfidence: MIN_CONFIDENCE },
    };

    if (isRepairEligible(synthetic) && selectRepair(synthetic)?.recommendedStrategy === 'lockfile-fixer') {
      fixLockfile();
      repaired = true;
    } else {
      throw new Error(`Pre-CI diagnosis requires manual review. See ${REPORT_PATH}.\n${log}`);
    }
  }

  const remainingChecks = [
    ['typecheck', ['run', 'typecheck']],
    ['lint', ['run', 'lint']],
    ['build', ['run', 'build']],
  ];
  for (const [name, args] of remainingChecks) {
    const result = run('npm', args);
    checks.push([name, result]);
    if (!result.ok) {
      const log = `${name}\n${result.output}`;
      const { assessment, plan } = dependencyRepair(log);
      throw new Error(`Pre-CI ${name} failure diagnosed as ${assessment.diagnosis.knownPattern ?? 'UNKNOWN'}; plan=${plan.status}. See ${REPORT_PATH}.`);
    }
  }

  writeReport({
    version: 1,
    mode: 'pre-ci',
    branch: TARGET_BRANCH,
    status: 'passed',
    repaired,
    checks: checks.map(([name, result]) => ({ name, ok: result.ok })),
  });
  return { skipped: false, status: 'passed', repaired };
}

if (process.argv[1] && new URL(`file://${process.argv[1]}`).href === import.meta.url) {
  try {
    const result = preflight();
    console.log(JSON.stringify(result));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
