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

const has = (source, text) => source.includes(text);

const required = [
  [`manifest id`, has(manifest, `id: "${slug}"`)],
  [`manifest slug`, has(manifest, `slug: "${slug}"`)],
  [`public lifecycle`, has(manifest, `lifecycle: "public"`)],
  [`local-only capability`, has(manifest, "localOnly: true")],
  [`test contract`, has(contracts, `toolId: "${slug}"`)],
  [`test route`, has(contracts, `route: "/tools/${slug}"`)],
  [`strict evidence requirement`, has(contracts, "requiredEvidence: true")],
  [`regression lock requirement`, has(contracts, "regressionLocked: true")],
  [`public certification assertion`, has(promotion, "assertPublicRegistration")],
];

for (const [name, passed] of required) {
  if (!passed) fail(`${name} is missing for ${slug}`);
}

const strictChecks = [
  "render",
  "interaction",
  "output",
  "error",
  "security",
  "performance",
  "mutation",
  "invariant",
  "evidence",
];

const contractSlice = contracts.match(
  new RegExp(`toolId: "${slug}"[\\s\\S]{0,240}`),
)?.[0] ?? "";
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
