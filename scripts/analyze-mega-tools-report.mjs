import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const reportDir = path.join(root, "test-results");
const reportFiles = fs.existsSync(reportDir)
  ? fs.readdirSync(reportDir).filter((file) => file === "mega-tools-report.json" || file.startsWith("mega-tools-report-"))
  : [];

const summaries = [];
for (const file of reportFiles) {
  try {
    const report = JSON.parse(fs.readFileSync(path.join(reportDir, file), "utf8"));
    summaries.push({
      file,
      startedAt: report.startedAt ?? null,
      totalVariants: report.totalVariants ?? 0,
      passed: report.passed ?? 0,
      failed: report.failed ?? 0,
      failures: Array.isArray(report.results)
        ? report.results.filter((result) => result.status === "failed").map((result) => ({ slug: result.slug, error: result.error }))
        : [],
    });
  } catch (error) {
    summaries.push({ file, parseError: error instanceof Error ? error.message : String(error) });
  }
}

const failureCounts = new Map();
for (const summary of summaries) {
  for (const failure of summary.failures ?? []) {
    const entry = failureCounts.get(failure.slug) ?? { slug: failure.slug, count: 0, errors: new Set() };
    entry.count += 1;
    entry.errors.add(failure.error ?? "Unknown failure");
    failureCounts.set(failure.slug, entry);
  }
}

const analysis = {
  generatedAt: new Date().toISOString(),
  reports: summaries,
  recurringFailures: [...failureCounts.values()]
    .sort((a, b) => b.count - a.count)
    .map((entry) => ({ ...entry, errors: [...entry.errors] })),
};

fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(path.join(reportDir, "mega-tools-analysis.json"), JSON.stringify(analysis, null, 2));
console.log(JSON.stringify(analysis, null, 2));
