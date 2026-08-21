import fs from 'node:fs/promises';

const memoryPath = process.env.ERROR_MEMORY_PATH ?? '.artifacts/errors/failure-memory.json';
const out = process.env.ERROR_ADAPTIVE_OUT ?? '.artifacts/errors/adaptive-learning.json';
const memory = JSON.parse(await fs.readFile(memoryPath, 'utf8'));
const entries = Object.values(memory.entries ?? {});
const reviewed = entries.filter((e) => ['fixed', 'false-positive', 'wont-fix'].includes(e.resolutionStatus));
const fixed = reviewed.filter((e) => e.resolutionStatus === 'fixed');
const falsePositives = reviewed.filter((e) => e.resolutionStatus === 'false-positive');
const byRule = new Map();
for (const entry of reviewed) {
  const current = byRule.get(entry.rootCauseCode) ?? { reviewed: 0, fixed: 0, falsePositive: 0 };
  current.reviewed += 1;
  current.fixed += entry.resolutionStatus === 'fixed' ? 1 : 0;
  current.falsePositive += entry.resolutionStatus === 'false-positive' ? 1 : 0;
  byRule.set(entry.rootCauseCode, current);
}
const recommendations = [...byRule.entries()].map(([rule, stats]) => ({
  rule,
  fixedRate: stats.reviewed ? stats.fixed / stats.reviewed : 0,
  falsePositiveRate: stats.reviewed ? stats.falsePositive / stats.reviewed : 0,
  action: stats.falsePositive > stats.fixed ? 'review-rule' : stats.fixed ? 'keep-rule' : 'needs-review',
}));
const result = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  reviewed: reviewed.length,
  fixed: fixed.length,
  falsePositives: falsePositives.length,
  diagnosisAccuracy: reviewed.length ? fixed.length / reviewed.length : null,
  recommendations,
  safeOnly: true,
  autoApply: false,
  requiresHumanReview: true,
};
await fs.mkdir('.artifacts/errors', { recursive: true });
await fs.writeFile(out, JSON.stringify(result, null, 2));
console.log(`ADAPTIVE LEARNING: reviewed=${reviewed.length} accuracy=${result.diagnosisAccuracy ?? 'n/a'}`);
