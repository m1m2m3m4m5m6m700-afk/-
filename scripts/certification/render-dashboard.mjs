#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.argv[2] ?? '.artifacts';
const output = process.argv[3] ?? path.join(root, 'certification-dashboard.md');

async function collect(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const found = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...await collect(full));
    else if (entry.name === 'gate-manifest.json') found.push(full);
  }
  return found;
}

const files = await collect(root);
const rows = [];
for (const file of files) {
  try {
    const m = JSON.parse(await fs.readFile(file, 'utf8'));
    rows.push({
      tool: m.tool ?? 'unknown',
      gate: m.gate ?? 'unknown',
      status: m.status ?? 'unknown',
      commit: m.commit ?? '',
      runId: m.runId ?? '',
      durationMs: m.execution?.durationMs ?? 0,
      valid: m.integrity?.valid ?? false,
    });
  } catch {
    // Ignore malformed artifacts here; Release Decision remains authoritative.
  }
}

rows.sort((a, b) => `${a.tool}:${a.gate}`.localeCompare(`${b.tool}:${b.gate}`));
const lines = [
  '# Certification Dashboard',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  '| Tool | Gate | Status | Integrity | Duration (ms) | Run | Commit |',
  '|---|---|---|---:|---:|---:|---|',
];
for (const r of rows) {
  lines.push(`| ${r.tool} | ${r.gate} | ${r.status} | ${r.valid ? 'PASS' : 'CHECK'} | ${r.durationMs} | ${r.runId} | ${r.commit} |`);
}

await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(output, `${lines.join('\n')}\n`, 'utf8');
console.log(`Wrote ${output} (${rows.length} manifests).`);
