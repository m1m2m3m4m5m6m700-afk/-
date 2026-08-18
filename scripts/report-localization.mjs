#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

mkdirSync("reports", { recursive: true });
const result = spawnSync(process.execPath, ["src/scripts/validate-localization.mjs"], {
  encoding: "utf8",
});

const report = [
  `generatedAt=${new Date().toISOString()}`,
  `exitCode=${result.status ?? 1}`,
  "",
  result.stdout ?? "",
  result.stderr ?? "",
].join("\n");

writeFileSync("reports/localization-report.txt", report, "utf8");
console.log("Localization report: reports/localization-report.txt");
// Reporting is intentionally non-blocking.
process.exit(0);
