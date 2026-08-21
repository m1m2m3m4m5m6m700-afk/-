import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const inputRoots = (process.argv.slice(2).length ? process.argv.slice(2) : ['.artifacts']).map((p) => path.resolve(root, p));
const out = path.resolve(root, process.env.FINDINGS_OUT ?? '.artifacts/errors/merged-findings.json');

async function walk(dir) {
  const result = [];
  try {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) result.push(...await walk(full));
      else if (entry.name.endsWith('.sarif') || entry.name.endsWith('.json')) result.push(full);
    }
  } catch {}
  return result;
}

const files = (await Promise.all(inputRoots.map(walk))).flat();
const findings = [];
for (const file of files) {
  let data;
  try { data = JSON.parse(await fs.readFile(file, 'utf8')); } catch { continue; }
  for (const run of data?.runs ?? []) {
    for (const result of run.results ?? []) {
      findings.push({
        source: path.relative(root, file).replaceAll(path.sep, '/'),
        tool: run.tool?.driver?.name ?? 'unknown',
        ruleId: result.ruleId ?? result.rule?.id ?? 'unknown',
        level: result.level ?? 'warning',
        message: String(result.message?.text ?? result.message ?? '').slice(0, 2000),
        locations: result.locations ?? [],
      });
    }
  }
}
const unique = new Map();
for (const finding of findings) {
  const key = `${finding.tool}|${finding.ruleId}|${finding.message}|${JSON.stringify(finding.locations)}`;
  if (!unique.has(key)) unique.set(key, finding);
}
await fs.mkdir(path.dirname(out), { recursive: true });
await fs.writeFile(out, JSON.stringify({ schemaVersion: 1, generatedAt: new Date().toISOString(), count: unique.size, findings: [...unique.values()].slice(0, 1000) }, null, 2));
console.log(`MERGED FINDINGS: ${unique.size}`);
console.log(`OUTPUT: ${path.relative(root, out)}`);
