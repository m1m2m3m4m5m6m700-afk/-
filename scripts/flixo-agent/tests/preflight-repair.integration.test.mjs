import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { executePlan } from '../v4/experimental/execute-plan.mjs';
import { createLocalRepairRunner } from '../v4/experimental/local-repair-runner.mjs';

async function withTempRepo(fn) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'flixo-preflight-'));
  const original = process.cwd();
  const previousActions = process.env.GITHUB_ACTIONS;
  const previousToken = process.env.GITHUB_TOKEN;
  try {
    delete process.env.GITHUB_ACTIONS;
    delete process.env.GITHUB_TOKEN;
    process.chdir(dir);
    await fn(dir);
  } finally {
    process.chdir(original);
    if (previousActions === undefined) delete process.env.GITHUB_ACTIONS;
    else process.env.GITHUB_ACTIONS = previousActions;
    if (previousToken === undefined) delete process.env.GITHUB_TOKEN;
    else process.env.GITHUB_TOKEN = previousToken;
    await fs.rm(dir, { recursive: true, force: true });
  }
}

function planFor(rootCause) {
  return {
    version: 3,
    status: 'planned',
    steps: [{ id: `step-1-${rootCause}`, rootCause, gate: rootCause === 'playwright' ? 'Windows' : 'Node', dependsOn: [], autoApply: false }],
    policy: { autoApply: false },
  };
}

const verification = { valid: true, errors: [], approved: false };

test('preflight local repair applies a safe Playwright workflow fix without remote access', async () => {
  await withTempRepo(async () => {
    await fs.mkdir('.github/workflows', { recursive: true });
    await fs.writeFile('.github/workflows/qr-independent-certification.yml', '      - run: npm ci --include=dev\n', 'utf8');

    const result = await executePlan({ plan: planFor('playwright'), verification }, createLocalRepairRunner(), {
      apply: true,
      localOnly: true,
      branch: 'feat/certification-foundation-pdf-merge',
    });

    assert.equal(result.status, 'accepted');
    const workflow = await fs.readFile('.github/workflows/qr-independent-certification.yml', 'utf8');
    assert.match(workflow, /npx playwright install chromium/);
  });
});

test('preflight local repair rolls back the whole transaction on an unsupported step', async () => {
  await withTempRepo(async () => {
    await fs.mkdir('.github/workflows', { recursive: true });
    const file = '.github/workflows/qr-independent-certification.yml';
    const original = '      - run: npm ci --include=dev\n';
    await fs.writeFile(file, original, 'utf8');

    const plan = {
      version: 3,
      status: 'planned',
      steps: [
        { id: 'step-1-playwright', rootCause: 'playwright', gate: 'Windows', dependsOn: [], autoApply: false },
        { id: 'step-2-unsupported', rootCause: 'unsupported-root', gate: 'Node', dependsOn: ['step-1-playwright'], autoApply: false },
      ],
      policy: { autoApply: false },
    };

    const result = await executePlan({ plan, verification }, createLocalRepairRunner(), {
      apply: true,
      localOnly: true,
      branch: 'feat/certification-foundation-pdf-merge',
    });

    assert.equal(result.status, 'rolled-back');
    assert.equal(await fs.readFile(file, 'utf8'), original);
  });
});
