#!/usr/bin/env node
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { detectV1 } from './v1/index.mjs';
import { detectV2 } from './v2/index.mjs';
import { diagnoseAll } from './v3/core/diagnose.mjs';
import { buildStrategicPlan } from './v3/planning/strategic-planner.mjs';
import { verify } from './v3/core/verifier.mjs';
import { planExperiments } from './v4/index.mjs';

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
  return {
    branch: branch.stdout.trim(),
    status: status.stdout,
    diff: diff.stdout,
  };
}

async function main() {
  const repair = process.argv.includes('--repair');
  const context = await stagedContext();
  const log = [context.status, context.diff].join('\n');

  const v1 = detectV1(log);
  const v2 = await detectV2(log);
  const roots = diagnoseAll(log);
  const plan = buildStrategicPlan(roots);
  const verification = verify(plan);
  const experiments = planExperiments(roots, { branch: context.branch });

  const checks = [];
  checks.push(['git-branch', context.branch !== 'main' && context.branch !== 'master']);
  checks.push(['baseline-contract', (await run('npm', ['run', 'test:certification-baseline'])).ok]);
  checks.push(['dependency-contract', (await run('npm', ['run', 'validate:dependencies'])).ok]);
  checks.push(['ci-contract', (await run('npm', ['run', 'validate-ci-contract'])).ok]);
  checks.push(['typecheck', (await run('npm', ['run', 'typecheck'])).ok]);
  checks.push(['lint', (await run('npm', ['run', 'lint'])).ok]);

  const known = roots.filter((root) => ['playwright', 'jsqr', 'arabic-test-case', 'baseline'].includes(root.pattern));
  const unknown = roots.filter((root) => !known.includes(root));
  const failures = checks.filter(([, ok]) => !ok).map(([name]) => name);
  if (unknown.length) failures.push(...unknown.map((root) => `unknown:${root.pattern}`));
  if (!verification.valid && plan.steps.length) failures.push(...verification.errors);

  const report = {
    status: failures.length ? 'FAIL' : 'PASS',
    mode: repair ? 'repair-requested' : 'detect-only',
    branch: context.branch,
    v1,
    v2,
    roots,
    plan,
    verification,
    v4: { ...experiments, autoApply: false, localOnly: true },
    checks,
    failures,
  };

  console.log(JSON.stringify(report, null, 2));

  if (repair && failures.length === 0 && plan.steps.length === 0) {
    console.log('No repair required.');
  }

  process.exitCode = failures.length ? 1 : 0;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
