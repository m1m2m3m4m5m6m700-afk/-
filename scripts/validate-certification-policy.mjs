#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const slug = process.env.TOOL_SLUG || "qr-generator";
const files = {
  manifest: path.join(repoRoot, "src/lib/tool-platform/publicDesktopTools.ts"),
  contracts: path.join(repoRoot, "src/lib/tool-platform/testContracts.ts"),
  promotion: path.join(repoRoot, "src/lib/tool-platform/promotion.ts"),
};

const fail = (message) => {
  console.error(`[CERTIFICATION POLICY] FAIL: ${message}`);
  process.exit(1);
};

for (const [name, file] of Object.entries(files)) {
  if (!fs.existsSync(file)) fail(`Missing required ${name} source: ${path.relative(repoRoot, file)}`);
}

const manifest = fs.readFileSync(files.manifest, "utf8");
const contracts = fs.readFileSync(files.contracts, "utf8");
const promotion = fs.readFileSync(files.promotion, "utf8");

const required = [
  [`manifest id`, new RegExp(`id:\s*"${slug}"`), manifest],
  [`manifest slug`, new RegExp(`slug:\s*"${slug}"`), manifest],
  [`public lifecycle`, /lifecycle:\s*"public"/, manifest],
  [`local-only capability`, /localOnly:\s*true/, manifest],
  [`test contract`, new RegExp(`toolId:\s*"${slug}"`), contracts],
  [`test route`, new RegExp(`route:\s*"\/tools\/${slug}"`), contracts],
  [`strict evidence requirement`, /requiredEvidence:\s*true/, contracts],
  [`regression lock requirement`, /regressionLocked:\s*true/, contracts],
  [`public certification assertion`, /assertPublicRegistration/, promotion],
];

for (const [name, pattern, source] of required) {
  if (!pattern.test(source)) fail(`${name} is missing for ${slug}`);
}

const strictChecks = ["render", "interaction", "output", "error", "security", "performance", "mutation", "invariant", "evidence"];
const contractSlice = contracts.match(new RegExp(`toolId:\s*"${slug}"[\\s\\S]{0,180}`))?.[0] ?? "";
if (!contractSlice.includes("requiredChecks: strictChecks")) {
  fail(`tool ${slug} is not attached to the canonical strict certification checks`);
}

const validation = spawnSync("node", ["scripts/validate-release-tools.mjs"], {
  stdio: "inherit",
  env: { ...process.env, CI: process.env.CI ?? "1" },
});
if (validation.status !== 0) fail(`release-tool validator failed for ${slug}`);

console.log(JSON.stringify({
  verdict: "POLICY_PASS",
  tool: slug,
  requiredChecks: strictChecks,
  certification: "certified",
  evidenceRequired: true,
  regressionLocked: true,
  localOnly: true,
}, null, 2));
