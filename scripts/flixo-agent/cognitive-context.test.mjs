import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { buildProjectGraph, writeProjectGraph } from './project-graph.mjs';
import { appendDecision, getDecisionLog, findSimilarDecisions } from './decision-log.mjs';

async function withTempRepo(fn) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'flixo-cognitive-test-'));
  const previous = process.env.FLIXO_REPO_ROOT;
  process.env.FLIXO_REPO_ROOT = root;
  try {
    await fs.mkdir(path.join(root, '.github/workflows'), { recursive: true });
    await fs.writeFile(path.join(root, 'package.json'), JSON.stringify({
      name: 'fixture',
      dependencies: { qrcode: '^1.0.0' },
      devDependencies: { jsqr: '^1.4.0' },
    }, null, 2));
    await fs.writeFile(path.join(root, 'tool-dependencies.json'), JSON.stringify({
      tools: [{ id: 'qr-generator', name: 'QR Generator', dependencies: ['qrcode', 'jsqr'] }],
    }));
    await fs.writeFile(path.join(root, '.github/workflows/qr.yml'), 'name: QR\njobs:\n  test:\n    steps:\n      - run: npm run test:desktop\n      - run: npx playwright install chromium\n');
    await fs.writeFile(path.join(root, 'package-lock.json'), '{}\n');
    await fn(root);
  } finally {
    if (previous === undefined) delete process.env.FLIXO_REPO_ROOT;
    else process.env.FLIXO_REPO_ROOT = previous;
    await fs.rm(root, { recursive: true, force: true });
  }
}

test('project graph records dependencies, tools, workflows, and commands', async () => {
  await withTempRepo(async (root) => {
    const graph = await buildProjectGraph();
    assert.equal(graph.schemaVersion, 1);
    assert.ok(graph.nodes.some((node) => node.id === 'dependency:jsqr'));
    assert.ok(graph.nodes.some((node) => node.id === 'tool:qr-generator'));
    assert.ok(graph.nodes.some((node) => node.id === '.github/workflows/qr.yml'));
    assert.ok(graph.edges.some((edge) => edge.type === 'requires' && edge.to === 'dependency:jsqr'));
    assert.ok(graph.edges.some((edge) => edge.type === 'executes' && edge.to === 'command:test:desktop'));
    const written = await writeProjectGraph(graph);
    assert.equal(written, path.join(root, 'state/cognitive/project-graph.json'));
    const saved = JSON.parse(await fs.readFile(written, 'utf8'));
    assert.equal(saved.stats.nodes, graph.stats.nodes);
  });
});

test('decision log appends and supports similarity retrieval without rewriting history', async () => {
  await withTempRepo(async () => {
    const first = await appendDecision({ category: 'DEPENDENCY', issue: "Cannot find module 'jsqr'", selected: 'dependency-sync', outcome: { status: 'PASS' } });
    const second = await appendDecision({ category: 'ENVIRONMENT', issue: 'Playwright browser missing', selected: 'install-browser', outcome: { status: 'PASS' } });
    const entries = await getDecisionLog();
    assert.equal(entries.length, 2);
    assert.equal(entries[0].id, first.id);
    assert.equal(entries[1].id, second.id);

    const similar = await findSimilarDecisions('jsqr dependency');
    assert.equal(similar[0].id, first.id);
    assert.ok(similar[0].similarity > 0);
  });
});
