import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const PACKAGE_FILES = new Set(['package.json', 'package-lock.json']);
const DEFAULT_TIMEOUT_MS = 120_000;

function assertDependencyPlan(plan, { allowApply = false } = {}) {
  if (!plan || plan.approved !== true) {
    throw new Error('Dependency repair plan must be explicitly verified with approved=true');
  }
  if (!allowApply) {
    throw new Error('Dependency executor requires explicit apply mode');
  }
  if (plan.category !== 'DEPENDENCY') {
    throw new Error(`Unsupported plan category for dependency executor: ${plan.category}`);
  }
  if (plan.constraints?.requiresSandbox !== true) {
    throw new Error('Dependency plan must require sandbox execution');
  }
  if (!Array.isArray(plan.changes) || plan.changes.length !== 1) {
    throw new Error('Dependency plan must contain exactly one dependency-sync change');
  }
  const [change] = plan.changes;
  if (change.type !== 'dependency-sync' || change.file !== 'package.json') {
    throw new Error('Dependency plan must target package.json with dependency-sync');
  }
  if (typeof change.package !== 'string' || !change.package) {
    throw new Error('Dependency change must specify a package name');
  }
  if (!/^\^?\d+\.\d+\.\d+$/.test(change.version ?? '')) {
    throw new Error('Dependency change must specify a concrete semver version/range');
  }
}

function withPackageJson(base, packageName, version) {
  const next = structuredClone(base);
  const target = next.devDependencies ?? (next.devDependencies = {});
  target[packageName] = version;
  return next;
}

async function runNpmInstall(cwd, { runner = defaultRunner, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  return runner(
    'npm',
    ['install', '--package-lock-only', '--ignore-scripts', '--no-audit', '--no-fund'],
    { cwd, timeoutMs },
  );
}

async function defaultRunner(command, args, options = {}) {
  return execFileAsync(command, args, {
    cwd: options.cwd,
    timeout: options.timeoutMs,
    windowsHide: true,
    maxBuffer: 10 * 1024 * 1024,
  });
}

export async function executeDependencyRepair(
  plan,
  {
    rootDir = process.cwd(),
    apply = false,
    runner = defaultRunner,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    keepSandbox = false,
  } = {},
) {
  assertDependencyPlan(plan, { allowApply: apply });

  const originalPackage = JSON.parse(await fs.readFile(path.join(rootDir, 'package.json'), 'utf8'));
  const nextPackage = withPackageJson(originalPackage, plan.changes[0].package, plan.changes[0].version);

  if (!apply) {
    return {
      applied: false,
      dryRun: true,
      requiresSandbox: true,
      package: nextPackage,
      note: 'Dependency changes are not applied outside explicit apply mode.',
    };
  }

  const sandbox = await fs.mkdtemp(path.join(os.tmpdir(), 'flixo-agent-deps-'));
  try {
    await fs.cp(rootDir, sandbox, { recursive: true, filter: (source) => !source.includes(`${path.sep}.git${path.sep}`) });
    await fs.writeFile(path.join(sandbox, 'package.json'), `${JSON.stringify(nextPackage, null, 2)}\n`, 'utf8');

    await runNpmInstall(sandbox, { runner, timeoutMs });

    const generatedPackage = JSON.parse(await fs.readFile(path.join(sandbox, 'package.json'), 'utf8'));
    const generatedLock = JSON.parse(await fs.readFile(path.join(sandbox, 'package-lock.json'), 'utf8'));
    if (!generatedLock.packages || typeof generatedLock.packages !== 'object') {
      throw new Error('Generated package-lock.json is missing the packages map');
    }
    if (!generatedLock.packages['node_modules/' + plan.changes[0].package]) {
      throw new Error(`Generated package-lock.json does not contain ${plan.changes[0].package}`);
    }
    if (generatedPackage.devDependencies?.[plan.changes[0].package] !== plan.changes[0].version) {
      throw new Error('Generated package.json does not contain the requested dependency version');
    }

    const packageContent = `${JSON.stringify(generatedPackage, null, 2)}\n`;
    const lockContent = `${JSON.stringify(generatedLock, null, 2)}\n`;

    return {
      applied: false,
      dryRun: false,
      verified: true,
      files: [
        { file: 'package.json', content: packageContent },
        { file: 'package-lock.json', content: lockContent },
      ],
      sandbox,
      note: 'Dependency repair verified in sandbox. Outer GitHub execution layer must create the single commit.',
    };
  } finally {
    if (!keepSandbox) {
      await fs.rm(sandbox, { recursive: true, force: true });
    }
  }
}

export const dependencyExecutorInternals = Object.freeze({
  assertDependencyPlan,
  withPackageJson,
  PACKAGE_FILES,
});
