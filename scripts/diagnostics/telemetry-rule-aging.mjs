import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { getExactHeadSha } from "../utils/get-head-sha.mjs";

const RULES = "REGRESSION_RULES.json";
const LOG = "errors.log.json";
const TELEMETRY = "diagnostics/rule-telemetry.json";
const now = new Date().toISOString();

const rules = existsSync(RULES) ? JSON.parse(readFileSync(RULES, "utf8")) : { version: 3, rules: [] };
const entries = existsSync(LOG) ? JSON.parse(readFileSync(LOG, "utf8")) : [];
const telemetry = existsSync(TELEMETRY) ? JSON.parse(readFileSync(TELEMETRY, "utf8")) : { version: 1, rules: {} };
telemetry.rules ??= {};

for (const rule of rules.rules ?? []) {
  const item = telemetry.rules[rule.id] ?? { hits: 0, confirmed: 0, falsePositives: 0, createdAt: now, lastHitAt: null, guardMode: rule.guardMode ?? "critical" };
  const pattern = (() => { try { return new RegExp(rule.pattern, rule.flags ?? ""); } catch { return null; } })();
  if (pattern) {
    for (const entry of entries) {
      const haystack = `${entry.message ?? ""}\n${JSON.stringify(entry.details ?? {})}`;
      pattern.lastIndex = 0;
      if (pattern.test(haystack)) {
        item.hits += 1;
        item.lastHitAt = entry.timestamp ?? now;
        if (entry.details?.confirmed === true) item.confirmed += 1;
        if (entry.details?.falsePositive === true) item.falsePositives += 1;
      }
    }
  }
  item.guardMode = rule.guardMode ?? item.guardMode;
  if (item.falsePositives > 3 && item.guardMode === "critical") {
    item.guardMode = "advisory";
    rule.guardMode = "advisory";
    rule.agingAction = "auto-demoted-after-4-confirmed-false-positives";
  }
  telemetry.rules[rule.id] = item;
}

telemetry.lastRunAt = now;
telemetry.sha = getExactHeadSha();
writeFileSync(TELEMETRY, JSON.stringify(telemetry, null, 2) + "\n", "utf8");
writeFileSync(RULES, JSON.stringify(rules, null, 2) + "\n", "utf8");
console.log(JSON.stringify({ sha: telemetry.sha, ruleCount: rules.rules?.length ?? 0, telemetry: TELEMETRY }, null, 2));
