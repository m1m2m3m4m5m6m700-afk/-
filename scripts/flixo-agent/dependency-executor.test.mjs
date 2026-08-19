import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { executeDependencyRepair, dependencyExecutorInternals } from './dependency-executor.mjs';

function makePlan(overrides = {}) {
  return {
    version: 1,
    status: 'planned',
    approved: true,
    category: 'DEPENDENCY',
    rootCause: 'QR payload matrix imports jsqr but the dependency is not declared.',
    constraints: { requiresSandbox: true },
    changes: [{
      file: 'package.json',
      type: 'dependency-sync',
      package: 'jsqr',
      version: '^1.4.0',
    }],
    validation: ['package-lock consistency', 'dependency contract'],
    ...overrides,
  };
}

async function makeRoot() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'flixo-deps-test-'));
  const pkg = {
    name: 'fixture',
    version: '1.0.0',
    devDependencies: { vitest: '^3.0.0' },
  };
  const lock = {
    name: 'fixture',
    version: '1.0.0',
    lockfileVersion: 3,
    requires: true,
    packages: {
      '': { name: 'fixture', version: '1.0.0', devDependencies: { vitest: '^3.0.0' } },
    },
  };
  await fs.writeFile(path.join(root, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`);
  await fs.writeFile(path.join(root, 'package-lock.json'), `${JSON.stringify(lock, null, 2)}\n`);
  return root;
}

test('dry-run refuses dependency application', async () => {
  const root = await makeRoot();
  try {
    await assert.rejects(
      () => executeDependencyRepair(makePlan(), { rootDir: root, apply: false }),
      /requires explicit apply mode/,
    );
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('requires sandbox constraint', async () => {
  const root = await makeRoot();
  try {
    await assert.rejects(
      () => executeDependencyRepair(makePlan({ constraints: { requiresSandbox: false } }), { rootDir: root, apply: true, runner: async () => ({}) }),
      /must require sandbox execution/,
    );
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('rejects non dependency-sync plans', async () => {
  const root = await makeRoot();
  try {
    await assert.rejects(
      () => executeDependencyRepair(makePlan({ changes: [{ file: 'package.json', type: 'replace', package: 'jsqr', version: '^1.4.0' }] }), { rootDir: root, apply: true, runner: async () => ({}) }),
      /dependency-sync/,
    );
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('sandbox install result contains synchronized package and lockfile', async () => {
  const root = await makeRoot();
  try {
    const runner = async (_command, _args, { cwd }) => {
      const pkgPath = path.join(cwd, 'package.json');
      const lockPath = path.join(cwd, 'package-lock.json');
      const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
      pkg.devDependencies.jsqr = '^1.4.0';
      const lock = JSON.parse(await fs.readFile(lockPath, 'utf8'));
      lock.packages[''].devDependencies.jsqr = '^1.4.0';
      lock.packages['node_modules/jsqr'] = { version: '1.4.0', resolved: 'https://registry.npmjs.org/jsqr/-/jsqr-1.4.0.tgz' };
      await fs.writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
      await fs.writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
      return { stdout: '', stderr: '' };
    };

    const result = await executeDependencyRepair(makePlan(), {
      rootDir: root,
      apply: true,
      runner,
    });

    assert.equal(result.verified, true);
    assert.deepEqual(result.files.map((item) => item.file), ['package.json', 'package-lock.json']);
    assert.match(result.files[0].content, /"jsqr": "\^1\.4\.0"/);
    assert.match(result.files[1].content, /node_modules\\/jsqr/);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('internal validator rejects malformed package version', () => {
  assert.throws(
    () => dependencyExecutorInternals.assertDependencyPlan(makePlan({ changes: [{ file: 'package.json', type: 'dependency-sync', package: 'jsqr', version: 'latest' }] }), { allowApply: true }),
    /concrete semver/,
  );
});
