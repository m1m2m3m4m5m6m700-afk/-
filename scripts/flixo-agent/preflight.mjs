#!/usr/bin/env node
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { detectV1 } from './v1/index.mjs';
import { detectV2 } from './v2/index.mjs';
import { diagnoseAll } from './v3/core/diagnose.mjs';
import { buildStrategicPlan } from './v3/planning/strategic-planner.mjs';
import { verify } from './v3/core/verifier.mjs';
import { planExperiments } from './v4/index.mjs';
import { executePlan } from './v4/experimental/execute-plan.mjs';
import { createLocalRepairRunner } from './v4/experimental/local-repair-runner.mjs';

const exec = promisify(execFile);

async function run(command, args = []) {
  try {
    const { stdout, stderr } = await exec(command, args, { maxBuffer: 8 * 1024 * 1024 });
    return { ok: true, stdout, stderr };
  } catch (error) {
    return {
      ok: false,
      stdout: error.stdout ?? '',
      stderr: error.stderr ?? error.message ?? String(error),
      code: error.code ?? 1,
    };
  }
}

async function stagedContext() {
  const diff = await run('git', ['diff', '--cached', '--no-ext-diff']);
  const status = await run('git', ['status', '--short']);
  const branch = await run('git', ['branch', '--show-current']);
  return { branch: branch.stdout.trim(), status: status.stdout, diff: diff.stdout };
}

async function runChecks() {
  const checks = [];
  checks.push(['git-branch', (await run('git', ['branch', '--show-current'])).stdout.trim() !== 'main']);
  checks.push(['git-not-master', (await run('git', ['branch', '--show-current'])).stdout.trim() !== 'master']);
  checks.push(['baseline-contract', (await run('npm', ['run', 'test:certification-baseline'])).ok]);
  checks.push(['dependency-contract', (await run('npm', ['run', 'validate:dependencies'])).ok]);
  checks.push(['ci-contract', (await run('npm', ['run', 'validate-ci-contract'])).ok]);
  checks.push(['typecheck', (await run('npm', ['run', 'typecheck'])).ok]);
  checks.push(['lint', (await run('npm', ['run', 'lint'])).ok]);
  return checks;
}

async function analyze(context) {
  const log = [context.status, context.diff].join('\n');
  const v1 = detectV1(log);
  const v2 = await detectV2(log);
  const roots = diagnoseAll(log);
  const plan = buildStrategicPlan(roots);
  const verification = verify(plan);
  const experiments = planExperiments(roots, { branch: context.branch });
  return { log, v1, v2, roots, plan, verification, experiments };
}

async function executeLocalRepair(plan, verification, branch) {
  const runner = createLocalRepairRunner();
  const result = await executePlan({ plan, verification }, runner, {
    apply: true,
    localOnly: true,
    branch,
  });
  return result;
}

async function main() {
  const repair = process.argv.includes('--repair');
  const recheck = process.env.FLIXO_PREFLIGHT_RECHECK === '1';
  const context = await stagedContext();
  const analysis = await analyze(context);
  const checks = await runChecks();

  const known = analysis.roots.filter((root) => ['playwright', 'jsqr', 'arabic-test-case', 'baseline'].includes(root.pattern));
  const unknown = analysis.roots.filter((root) => !known.includes(root));
  const failures = checks.filter(([, ok]) => !ok).map(([name]) => name);
  if (unknown.length) failures.push(...unknown.map((root) => `unknown:${root.pattern}`));
  if (!analysis.verification.valid && analysis.plan.steps.length) failures.push(...analysis.verification.errors);

  if (repair && !recheck && analysis.plan.steps.length && unknown.length === 0 && analysis.verification.valid) {
    const execution = await executeLocalRepair(analysis.plan, analysis.verification, context.branch);
    if (execution.status !== 'accepted') {
      console.error(JSON.stringify({ status: 'FAIL', mode: 'repair-requested', execution }, null, 2));
      process.exitCode = 1;
      return;
    }

    process.stdout.write(JSON.stringify({ status: 'REPAIR_APPLIED', execution }, null, 2) + '\n');
    const child = await run(process.execPath, ['scripts/flixo-agent/preflight.mjs'], {
      ...process.env,
      FLIXO_PREFLIGHT_RECHECK: '1',
    });
    process.stdout.write(child.stdout);
    process.stderr.write(child.stderr);
    process.exitCode = child.ok ? 0 : 1;
    return;
  }

  const report = {
    status: failures.length ? 'FAIL' : 'PASS',
    mode: repair ? 'repair-requested' : 'detect-only',
    recheck,
    branch: context.branch,
    v1: analysis.v1,
    v2: analysis.v2,
    roots: analysis.roots,
    plan: analysis.plan,
    verification: analysis.verification,
    v4: { ...analysis.experiments, autoApply: false, localOnly: true },
    checks,
    failures,
  };

  console.log(JSON.stringify(report, null, 2));
  process.exitCode = failures.length ? 1 : 0;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
