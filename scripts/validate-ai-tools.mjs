import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const required = [
  ".github/agents/agent-triage.md",
  ".github/agents/agent-pr-review.md",
  ".github/agents/agent-ci-failure.md",
  "scripts/security/redact-secrets.mjs",
  "scripts/test-selection.mjs",
  "scripts/test-generation.mjs",
];

const failures = [];
for (const file of required) {
  try {
    await fs.access(path.join(root, file));
  } catch {
    failures.push(`Missing ${file}`);
  }
}

const read = async (file) => fs.readFile(path.join(root, file), "utf8");
if (!failures.length) {
  const triage = await read(".github/agents/agent-triage.md");
  const review = await read(".github/agents/agent-pr-review.md");
  const ciFailure = await read(".github/agents/agent-ci-failure.md");
  const redactor = await read("scripts/security/redact-secrets.mjs");
  const selection = await read("scripts/test-selection.mjs");
  const generation = await read("scripts/test-generation.mjs");

  for (const [name, source] of [["triage", triage], ["review", review], ["ciFailure", ciFailure]]) {
    const hasSafeApplyContract = source.includes('"autoApply": false') || source.includes("`autoApply` must always be `false`") || source.includes("autoApply=false");
    if (!hasSafeApplyContract) failures.push(`${name} agent missing autoApply=false guardrail`);
  }
  if (!redactor.includes("[REDACTED]")) failures.push("redactSecrets must redact credentials");
  if (!selection.includes("git") || !selection.includes("selectedTests")) failures.push("test-selection must remain deterministic and report selected tests");
  if (!generation.includes("requiresHumanReview") || !generation.includes("aiOptional")) failures.push("test-generation must remain advisory");
}

const scanRoots = ["src", "tests", "scripts"];
const legacy = [];
async function scan(dir) {
  const entries = await fs.readdir(path.join(root, dir), { withFileTypes: true });
  for (const entry of entries) {
    const relative = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await scan(relative);
      continue;
    }
    if (!/\.(ts|tsx|mjs|js)$/.test(entry.name)) continue;
    const content = await fs.readFile(path.join(root, relative), "utf8");
    if (content.includes("megaToolsCatalog") || content.includes("megaToolsEngine")) legacy.push(relative);
  }
}
for (const dir of scanRoots) {
  try { await scan(dir); } catch { /* best-effort scan */ }
}
if (legacy.length) failures.push(`Legacy mega-tool references remain: ${legacy.join(", ")}`);

if (failures.length) {
  console.error(`Advanced AI tools validation failed with ${failures.length} issue(s).`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("Advanced AI tools validation: PASS");
