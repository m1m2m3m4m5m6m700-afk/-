#!/usr/bin/env node

import { spawn } from "node:child_process";

const groups = {
  quick: ["typecheck", "lint", "build"],
  contracts: [
    "validate:project-contract",
    "validate:dependencies",
    "validate:registry",
    "validate:tool-runtime",
    "validate:tool-platform",
    "validate:tool-platform-lifecycle",
    "validate:tool-platform-boundaries",
    "validate:tool-platform-regression",
  ],
  quality: [
    "validate:test-quality",
    "validate:route-tree",
    "validate:flaky-isolation",
    "validate:failure-quality",
    "validate:performance",
  ],
  security: ["validate:security-strict", "validate:security", "audit:production"],
  content: [
    "validate:search-catalog",
    "validate:seo",
    "validate:tool-content",
    "validate:localization",
    "validate:localization-surface",
    "validate:tool-content-localization",
    "validate:pdf-catalog",
    "validate:tool-review",
    "validate:ai",
    "validate:search-intent",
    "validate:accessibility",
  ],
  ci: [
    "validate-ci-contract",
    "validate:dependencies",
    "validate:project-contract",
    "validate:test-quality",
    "validate:tool-platform",
    "validate:tool-platform-lifecycle",
    "validate:tool-platform-boundaries",
    "validate:tool-platform-regression",
    "validate:route-tree",
    "validate:flaky-isolation",
    "validate:failure-quality",
    "validate:performance",
    "validate:security-strict",
    "validate:registry",
    "validate:tool-runtime",
    "validate:search-catalog",
    "validate:seo",
    "validate:tool-content",
    "validate:localization",
    "validate:localization-surface",
    "validate:tool-content-localization",
    "validate:pdf-catalog",
    "validate:tool-review",
    "validate:ai",
    "validate:search-intent",
    "validate:accessibility",
    "validate:security",
    "typecheck",
    "lint",
    "build",
  ],
};

groups.all = [...new Set(Object.values(groups).flat())];

function run(script) {
  return new Promise((resolve, reject) => {
    const npm = process.platform === "win32" ? "npm.cmd" : "npm";
    const child = spawn(npm, ["run", script], { stdio: "inherit", shell: false });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`npm run ${script} failed with exit code ${code ?? "unknown"}`));
    });
  });
}

const command = process.argv[2] ?? "quick";
if (!groups[command]) {
  console.error(`Unknown check group: ${command}`);
  console.error(`Available groups: ${Object.keys(groups).join(", ")}`);
  process.exit(2);
}

console.log(`\nFLIXO check: ${command}`);
for (const script of groups[command]) {
  console.log(`\n▶ npm run ${script}`);
  await run(script);
}
console.log(`\nFLIXO check: ${command} PASS`);
