import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const base = process.env.FLIXO_TEST_BASE || process.env.GITHUB_BASE_SHA || null;
const head = process.env.FLIXO_TEST_HEAD || process.env.GITHUB_SHA || "HEAD";

function gitChangedFiles() {
  if (base) {
    try {
      const output = execFileSync("git", ["diff", "--name-only", `${base}...${head}`], { encoding: "utf8" });
      return output.split(/\r?\n/).filter(Boolean);
    } catch {
      // Pull-request checkouts commonly use fetch-depth=1. Fall back to the checked-out tree
      // instead of crashing the selector merely because the comparison commit is unavailable.
    }
  }
  return execFileSync("git", ["show", "--format=", "--name-only", head], { encoding: "utf8" })
    .split(/\r?\n/)
    .filter(Boolean);
}

const changed = gitChangedFiles();
const tests = new Set();
const reasons = [];

for (const file of changed) {
  if (/^tests\//.test(file)) tests.add(file);
  if (/tool-runtime|tool-platform/.test(file)) {
    tests.add("tests/desktop-tools.spec.ts");
    tests.add("tests/accessibility.spec.ts");
    reasons.push(`${file} touches tool platform/runtime`);
  }
  if (/lib\/ai|scripts\/flixo-agent|scripts\/diagnose-ci-failure|failure-memory/.test(file)) {
    tests.add("tests/chat.spec.ts");
    reasons.push(`${file} touches AI/agent infrastructure`);
  }
  if (/pdf|document|jspdf|pdf-lib/.test(file)) {
    tests.add("tests/pdf-tools.spec.ts");
    reasons.push(`${file} touches PDF/document functionality`);
  }
  if (/localization|i18n|locale/.test(file)) {
    tests.add("tests/accessibility.spec.ts");
    reasons.push(`${file} touches localization/i18n`);
  }
}

if (tests.size === 0) {
  tests.add("tests/accessibility.spec.ts");
  reasons.push("No specialized impact detected; run a representative browser slice.");
}

const report = {
  schemaVersion: 1,
  base,
  head,
  changedFiles: changed,
  selectedTests: [...tests],
  reasons,
  deterministic: true,
  aiRequired: false,
  autoApply: false,
  generatedAt: new Date().toISOString(),
};

const outDir = path.join(root, ".artifacts", "test-selection");
await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(path.join(outDir, "test-selection-report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
