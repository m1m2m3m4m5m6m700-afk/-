import fs from 'node:fs/promises';

const reportPath = process.env.ERROR_REPORT_PATH ?? '.artifacts/errors/error-report.json';
const memoryPath = process.env.ERROR_MEMORY_PATH ?? '.artifacts/errors/failure-memory.json';
const out = process.env.ERROR_DASHBOARD_OUT ?? '.artifacts/errors/error-intelligence-dashboard.md';

const readJson = async (file, fallback) => { try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { return fallback; } };
const report = await readJson(reportPath, null);
const memory = await readJson(memoryPath, { entries: {}, metrics: {} });
if (!report) { console.error(`Missing ${reportPath}`); process.exit(1); }

const entries = Object.values(memory.entries ?? {});
const hits = entries.filter((e) => (e.occurrences ?? 0) > 1).length;
const avgConfidence = entries.length ? entries.reduce((sum, e) => sum + Number(e.diagnosisConfidence ?? 0), 0) / entries.length : 0;
const byCode = new Map();
for (const entry of entries) byCode.set(entry.rootCauseCode, (byCode.get(entry.rootCauseCode) ?? 0) + (entry.occurrences ?? 0));
const topPatterns = [...byCode.entries()].sort((a,b) => b[1]-a[1]).slice(0, 10);
const findingCount = report.findings?.length ?? 0;
const accuracy = memory.metrics?.diagnosesReviewed ? memory.metrics.diagnosesAccurate / memory.metrics.diagnosesReviewed : null;

const lines = [
  '# FLIXO Error Intelligence Dashboard', '',
  `Generated: ${new Date().toISOString()}`,
  '',
  '## Current diagnosis',
  `- Root cause: **${report.rootCauseCode ?? 'unknown'}**`,
  `- Confidence: **${Math.round((report.diagnosisConfidence ?? 0) * 100)}%**`,
  `- Memory hit: **${report.memory?.hit ? 'yes' : 'no'}**`,
  `- Findings ingested: **${findingCount}**`,
  `- autoApply: **${report.autoApply === false ? 'false' : 'BLOCK'}**`,
  `- Human review: **${report.requiresHumanReview === true ? 'required' : 'BLOCK'}**`,
  '',
  '## Memory',
  `- Entries: **${entries.length}/${memory.maxEntries ?? 500}**`,
  `- Repeated patterns: **${hits}**`,
  `- Average stored diagnosis confidence: **${Math.round(avgConfidence * 100)}%**`,
  `- Reviewed diagnoses: **${memory.metrics?.diagnosesReviewed ?? 0}**`,
  `- Diagnosis accuracy (reviewed only): **${accuracy == null ? 'not enough reviewed data' : `${Math.round(accuracy * 100)}%`}**`,
  '',
  '## Top patterns',
  ...(topPatterns.length ? topPatterns.map(([code, count]) => `- ${code}: ${count}`) : ['- none']),
  '',
  '## Recommendation',
  report.recommendation ?? 'No recommendation.',
  '',
  '> Safety invariant: recommendations are advisory only; autoApply remains false.',
];

await fs.mkdir(new URL('.', `file://${process.cwd()}/`).pathname).catch(() => {});
await fs.mkdir(require('node:path').dirname(out), { recursive: true });
await fs.writeFile(out, `${lines.join('\n')}\n`);
console.log(`DASHBOARD: ${out}`);
