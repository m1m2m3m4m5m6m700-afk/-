import { readFile } from "node:fs/promises";

const policy = await readFile("docs/PR-DISCIPLINE.md", "utf8");
const requiredRules = [
  "Never open a new PR when an existing open PR already targets the same root cause",
  "Self-heal is diagnosis-only and manual",
  "A PR is not merge-ready until its required CI gates are green",
  "Vercel/preview failures caused by provider rate limits are infrastructure noise",
];

const missing = requiredRules.filter((rule) => !policy.includes(rule));
if (missing.length) {
  console.error("PR DISCIPLINE CONTRACT: FAIL");
  missing.forEach((rule) => console.error(`- Missing rule: ${rule}`));
  process.exit(1);
}

console.log("PR DISCIPLINE CONTRACT: PASS");
