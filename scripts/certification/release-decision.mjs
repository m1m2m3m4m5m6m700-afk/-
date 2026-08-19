import fs from 'node:fs/promises';
import path from 'node:path';
import { readAndVerifyGateManifest } from './verify-gate-manifest.mjs';

async function findFiles(root, name) {
  const out = [];
  async function walk(dir) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.name === name) out.push(full);
    }
  }
  await walk(root);
  return out;
}

export async function evaluateRelease(tool, { root, requiredGates, expectedCommit, expectedRunId, now = new Date() }) {
  const manifests = await findFiles(root, 'gate-manifest.json');
  const byGate = new Map();
  for (const manifestPath of manifests) {
    const raw = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    if (!byGate.has(raw.gate)) byGate.set(raw.gate, { manifestPath, manifest: raw });
  }

  const gates = [];
  for (const gate of requiredGates) {
    const found = byGate.get(gate);
    if (!found) {
      gates.push({ gate, status: 'missing', valid: false, errors: ['gate manifest missing'] });
      continue;
    }
    const evidencePath = path.join(path.dirname(found.manifestPath), found.manifest.evidence.file);
    const verified = await readAndVerifyGateManifest(found.manifestPath, {
      evidencePath,
      expectedCommit,
      expectedRunId,
      now,
    });
    gates.push({ gate, status: found.manifest.status, valid: verified.valid, errors: verified.errors, integrity: verified.integrity });
  }

  const rootFailures = gates.filter((g) => !g.valid);
  const passed = gates.filter((g) => g.valid && g.status === 'success').length;
  const decision = {
    schemaVersion: 1,
    tool,
    commit: expectedCommit,
    runId: String(expectedRunId),
    timestamp: now.toISOString(),
    gates,
    releaseStatus: rootFailures.length === 0 ? 'CERTIFIED' : 'REJECTED',
    summary: { total: requiredGates.length, passed, failed: requiredGates.length - passed, rootFailures: rootFailures.map((g) => g.gate) },
    diagnostics: {
      cascadeFailures: gates.filter((g) => g.status === 'skipped').map((g) => g.gate),
      externalChecksAreNonAuthoritative: true,
    },
  };

  const output = path.join(root, 'release-decision.json');
  await fs.writeFile(output, `${JSON.stringify(decision, null, 2)}\n`, 'utf8');
  return decision;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const tool = process.env.TOOL ?? 'qr-generator';
  const root = process.env.ARTIFACT_ROOT ?? `.artifacts/${tool}/downloads`;
  const requiredGates = (process.env.REQUIRED_GATES ?? '').split(',').map((v) => v.trim()).filter(Boolean);
  const decision = await evaluateRelease(tool, {
    root,
    requiredGates,
    expectedCommit: process.env.GITHUB_SHA,
    expectedRunId: process.env.GITHUB_RUN_ID,
  });
  console.log(JSON.stringify(decision, null, 2));
  process.exit(decision.releaseStatus === 'CERTIFIED' ? 0 : 1);
}
