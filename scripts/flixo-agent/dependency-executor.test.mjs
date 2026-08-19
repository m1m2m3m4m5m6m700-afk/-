import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { dependencyExecutorInternals, executeDependencyRepair } from './dependency-executor.mjs';

function makePlan(overrides = {}) {
  return {
    category: 'DEPENDENCY',
    rootCause: 'QR payload matrix imports jsqr but the dependency is not declared.',
    requiresSandbox: true,
    changes: [{
      file: 'package.json',
      type: 'dependency-sync',
      package: 'jsqr',
      version: '^1.4.0',
      command: 'npm install --save-dev jsqr@^1.4.0',
    }],
    ...overrides,
  };
}

async function makeSandbox() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'flixo-agent-'));
  await fs.writeFile(path.join(root, 'package.json'), JSON.stringify({
    name: 'sandbox-project',
    devDependencies: {},
  }, null, 2) + '\n');
  await fs.writeFile(path.join(root, 'package-lock.json'), JSON.stringify({
    name: 'sandbox-project',
    lockfileVersion: 3,
    packages: {
      '': { name: 'sandbox-project', devDependencies: {} },
    },
  }, null, 2) + '\n');
  return root;
}

test('rejects dependency execution without explicit apply', async () => {
  const root = await makeSandbox();
  try {
    await assert.rejects(
      executeDependencyRepair(makePlan(), { rootDir: root, apply: false }),
      /explicit --apply/,
    );
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('rejects plans without sandbox requirement', async () => {
  const root = await makeSandbox();
  try {
    await assert.rejects(
      executeDependencyRepair(makePlan({ requiresSandbox: false }), { rootDir: root, apply: true }),
      /requiresSandbox=true/,
    );
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test('rejects non dependency-sync changes', () => {
  assert.throws(
    () => dependencyExecutorInternals.assertDependencyPlan(
      makePlan({ changes: [{ file: 'package.json', type: 'replace', find: 'x', content: 'y' }] }),
      { allowApply: true },
    ),
    /dependency-sync/,
  );
});

test('rejects non concrete semver versions', () => {
  assert.throws(
    () => dependencyExecutorInternals.assertDependencyPlan(
      makePlan({ changes: [{ file: 'package.json', type: 'dependency-sync', package: 'jsqr', version: 'latest' }] }),
      { allowApply: true },
    ),
    /concrete semver/,
  );
});

test('accepts validated dependency plans and produces package + lockfile outputs', async () => {
  const root = await makeSandbox();
  const runner = async ({ cwd }) => {
    const packageJson = JSON.parse(await fs.readFile(path.join(cwd, 'package.json'), 'utf8'));
    packageJson.devDependencies = { ...(packageJson.devDependencies ?? {}), jsqr: '^1.4.0' };
    await fs.writeFile(path.join(cwd, 'package.json'), JSON.stringify(packageJson, null, 2) + '\n');

    const lockfile = JSON.parse(await fs.readFile(path.join(cwd, 'package-lock.json'), 'utf8'));
    lockfile.packages[''].devDependencies = { jsqr: '^1.4.0' };
    lockfile.packages['node_modules/jsqr'] = { version: '1.4.0' };
    await fs.writeFile(path.join(cwd, 'package-lock.json'), JSON.stringify(lockfile, null, 2) + '\n');
  };

  try {
    const result = await executeDependencyRepair(makePlan(), {
      rootDir: root,
      apply: true,
      runner,
    });

    assert.equal(result.verified, true);
    assert.deepEqual(result.files.map((item) => item.file), ['package.json', 'package-lock.json']);
    assert.match(result.files[0].content, /"jsqr": "\^1\.4\.0"/);
    assert.match(result.files[1].content, /node_modules\/jsqr/);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
