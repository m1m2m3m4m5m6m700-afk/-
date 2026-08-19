import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { applyRepairPlan } from './executor.mjs';

async function tempRepo() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'flixo-agent-'));
}

test('rejects unverified plans', async () => {
  await assert.rejects(
    () => applyRepairPlan({ approved: false, changes: [] }),
    /approved=true/
  );
});

test('rejects forbidden release workflow', async () => {
  await assert.rejects(
    () => applyRepairPlan({ approved: true, changes: [
      { file: '.github/workflows/release-certification.yml', type: 'insert', after: 'x', content: 'y' }
    ] }),
    /Forbidden file/
  );
});

test('rejects ambiguous replacement targets', async () => {
  const rootDir = await tempRepo();
  await fs.writeFile(path.join(rootDir, 'fixture.txt'), 'x\nx\n');
  await assert.rejects(
    () => applyRepairPlan({ approved: true, changes: [
      { file: 'fixture.txt', type: 'replace', find: 'x', content: 'y' }
    ] }, { rootDir }),
    /found 2/
  );
});

test('dry-run never writes files', async () => {
  const rootDir = await tempRepo();
  await fs.writeFile(path.join(rootDir, 'fixture.txt'), 'before\n');
  const result = await applyRepairPlan({ approved: true, changes: [
    { file: 'fixture.txt', type: 'replace', find: 'before', content: 'after' }
  ] }, { rootDir, dryRun: true });
  assert.equal(result.applied, false);
  assert.equal(await fs.readFile(path.join(rootDir, 'fixture.txt'), 'utf8'), 'before\n');
});

test('applies an exact replace when explicitly enabled', async () => {
  const rootDir = await tempRepo();
  await fs.writeFile(path.join(rootDir, 'fixture.txt'), 'before\n');
  const result = await applyRepairPlan({ approved: true, changes: [
    { file: 'fixture.txt', type: 'replace', find: 'before', content: 'after' }
  ] }, { rootDir, dryRun: false });
  assert.equal(result.applied, true);
  assert.equal(await fs.readFile(path.join(rootDir, 'fixture.txt'), 'utf8'), 'after\n');
});
