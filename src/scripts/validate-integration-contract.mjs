import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const packageJson = JSON.parse(read("package.json"));
const ci = read(".github/workflows/ci.yml");
const deploy = read(".github/workflows/deploy.yml");
const handler = read("src/lib/ai/chat/handler.ts");
const flags = read("src/lib/feature-flags.ts");
const issues = [];

const requiredScripts = [
  "validate-ci-contract",
  "validate:dependencies",
  "validate:registry",
  "validate:tool-runtime",
  "validate:tool-quality",
  "validate:ai",
  "validate:accessibility",
  "validate:security",
  "validate:seo",
  "validate:localization",
  "validate:route-tree",
  "typecheck",
  "lint",
  "test:chat",
  "test:a11y",
  "test:desktop",
];

for (const script of requiredScripts) {
  if (!packageJson.scripts?.[script]) issues.push(`Missing package script: ${script}`);
}

const ciCommands = [
  "npm run validate-ci-contract",
  "npm run validate:dependencies",
  "npm ci",
  "npm run audit:production",
  "npm run validate:registry",
  "npm run validate:tool-runtime",
  "npm run validate:tool-quality",
  "npm run validate:ai",
  "npm run validate:accessibility",
  "npm run validate:security",
  "npm run validate:seo",
  "npm run validate:localization",
  "npm run build",
  "npm run typecheck",
  "npm run lint",
  "npm run test:chat",
  "npm run test:a11y",
  "npm run test:desktop",
];
for (const command of ciCommands) {
  if (!ci.includes(command)) issues.push(`CI is missing required gate: ${command}`);
}

// Deployment must remain impossible until the hardening phase is explicitly closed.
if (!/if:\s*\$\{\{\s*false\s*\}\}/.test(deploy)) {
  issues.push("Vercel production deployment must remain disabled during integration hardening.");
}

// Keep AI validation semantic and formatting-independent.
const hasRuntimeReadyFilter = /tools\s*\.\s*filter\s*\(\s*\(?(?:tool|entry)\)?\s*=>\s*(?:tool|entry)\.status\s*===\s*["']ready["']/.test(handler);
if (!hasRuntimeReadyFilter) issues.push("Flex catalog must filter to runtime-ready tools.");
if (!handler.includes('isFeatureEnabled("webResearch")')) issues.push("Flex web research must use the webResearch feature flag.");
if (!handler.includes("AbortController")) issues.push("Flex provider calls must use bounded cancellation.");
if (!handler.includes("retryable")) issues.push("Flex provider failures must expose retryability.");
if (!flags.includes("webResearch") || !flags.includes("toolDiscovery")) issues.push("AI feature flags are incomplete.");

if (issues.length) {
  console.error(`Integration contract failed:\n- ${issues.join("\n- ")}`);
  process.exit(1);
}

console.log("Integration contract passed: package scripts, CI gates, disabled deployment, AI boundaries, and feature flags are consistent.");
