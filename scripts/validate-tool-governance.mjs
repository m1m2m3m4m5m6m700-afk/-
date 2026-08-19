#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const slug = process.env.TOOL_SLUG || "qr-generator";
const manifestPath = path.join(repoRoot, "src/lib/tool-platform/publicDesktopTools.ts");
const baselinePath = path.join(repoRoot, "baselines", slug, "certification-baseline.json");

const fail = (message) => {
  console.error(`[TOOL GOVERNANCE] FAIL: ${message}`);
  process.exit(1);
};

if (!fs.existsSync(manifestPath)) fail(`Missing manifest: ${path.relative(repoRoot, manifestPath)}`);

const source = fs.readFileSync(manifestPath, "utf8");
const block = source.match(new RegExp(`id: \"${slug}\"[\\s\\S]*?(?=\\n  \\},|\\n\\] as const)`))?.[0] ?? "";
if (!block) fail(`Cannot locate manifest block for ${slug}`);

const policyDefaults = {
  requiresNetwork: /requiresNetwork:\s*true/.test(block),
  requiresStorage: /requiresStorage:\s*true/.test(block),
  sensitiveInput: /sensitiveInput:\s*true/.test(block),
};

if (!/policy:\s*\{/.test(block)) {
  console.log(JSON.stringify({
    verdict: "GOVERNANCE_PASS",
    tool: slug,
    policy: { ...policyDefaults, inferred: true },
    baseline: fs.existsSync(baselinePath) ? "present" : "not-yet-required",
    dependencies: [],
  }, null, 2));
  process.exit(0);
}

const dependencyMatch = block.match(/dependencies:\s*\[([^\]]*)\]/);
const dependencies = dependencyMatch
  ? [...dependencyMatch[1].matchAll(/\"([^\"]+)\"/g)].map((match) => match[1])
  : [];

for (const dependency of dependencies) {
  const dependencyBaseline = path.join(repoRoot, "baselines", dependency, "certification-baseline.json");
  if (!fs.existsSync(dependencyBaseline)) {
    fail(`Dependency ${dependency} requires a certified baseline at baselines/${dependency}/certification-baseline.json`);
  }
  const baseline = JSON.parse(fs.readFileSync(dependencyBaseline, "utf8"));
  if (baseline.status !== "certified" && baseline.verdict !== "CERTIFIED") {
    fail(`Dependency ${dependency} baseline is not CERTIFIED`);
  }
  if (baseline.expiresAt && Date.parse(baseline.expiresAt) <= Date.now()) {
    fail(`Dependency ${dependency} baseline is expired`);
  }
}

console.log(JSON.stringify({
  verdict: "GOVERNANCE_PASS",
  tool: slug,
  policy: {
    requiresNetwork: /requiresNetwork:\s*true/.test(block),
    requiresStorage: /requiresStorage:\s*true/.test(block),
    sensitiveInput: /sensitiveInput:\s*true/.test(block),
  },
  dependencies,
  baseline: fs.existsSync(baselinePath) ? "present" : "not-yet-required",
}, null, 2));
