import { mkdtempSync, mkdirSync, cpSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const SCANNERS = [
  ["check-typecheck", "src/mutant.ts", "export const mutant: any = null;", "CRITICAL"],
  ["check-lockfile", "package-lock.json", "{\"name\":\"mutant-package\",\"lockfileVersion\":3,\"packages\":{\"\":{\"name\":\"different-package\"}}}", "CRITICAL"],
  ["check-secrets", "src/mutant-secret.ts", "const token = \"ghp_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\";", "CRITICAL"],
  ["check-config-env", "src/mutant-env.ts", "console.log(process.env.MUTANT_REQUIRED_ENV);", "CRITICAL"],
  ["check-antipatterns", "src/mutant-antipattern.mjs", "Promise.resolve(1).then(x => console.log(x));", "WARNING"],
  ["check-deadcode", "src/mutant-dead.ts", "export const neverUsedMutation = 123;", "WARNING"],
  ["check-test-quality", "playwright.config.ts", "export default { fullyParallel: true, reuseExistingServer: true, trace: \"on\" };", "CRITICAL"],
  ["check-bundle", "dist/mutant.js", "x".repeat(360000), "CRITICAL"],
  ["check-i18n", "src/mutant-i18n.tsx", "export const Mutant = () => <div>Unlocalized mutation text</div>;", "WARNING"],
  ["check-git-integrity", "unexpected-workspace.tmp", "mutation", "CRITICAL"],
  ["check-client-runtime", "src/mutant-client.ts", "export const mutant = true;", "INFO"],
  ["check-ast-architecture", "src/components/mutant.tsx", "import x from \"../api/server\"; export const Mutant = () => null;", "CRITICAL"],
  ["check-regression-guard", "src/mutant-focused.ts", "test.only(() => {});", "CRITICAL"],
];

function setupBase(dir) {
  mkdirSync(join(dir, "scripts/diagnostics"), { recursive: true });
  mkdirSync(join(dir, "scripts/utils"), { recursive: true });
  cpSync(join(ROOT, "scripts/diagnostics/_core.mjs"), join(dir, "scripts/diagnostics/_core.mjs"));
  cpSync(join(ROOT, "scripts/error-sink.mjs"), join(dir, "scripts/error-sink.mjs"));
  cpSync(join(ROOT, "scripts/utils/get-head-sha.mjs"), join(dir, "scripts/utils/get-head-sha.mjs"));
  for (const [name] of SCANNERS) cpSync(join(ROOT, "scripts/diagnostics/${name}.mjs"), join(dir, `scripts/diagnostics/${name}.mjs`));
  mkdirSync(join(dir, "src"), { recursive: true });
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "mutation-fixture", version: "1.0.0", dependencies: {}, devDependencies: {} }, null, 2));
  writeFileSync(join(dir, ".env.example"), "SAFE_ENV=\n");
  writeFileSync(join(dir, "REGRESSION_RULES.json"), JSON.stringify({ version: 1, rules: [{ id: "no-focused-tests", pattern: "\\btest\\.only\\s*\\(", flags: "g", guardMode: "critical" }] }, null, 2));
  writeFileSync(join(dir, "playwright.config.ts"), "export default { fullyParallel: false, reuseExistingServer: false, trace: \"retain-on-failure\" };\n");
  writeFileSync(join(dir, "package-lock.json"), JSON.stringify({ name: "mutation-fixture", lockfileVersion: 3, packages: { "": { name: "mutation-fixture", version: "1.0.0", dependencies: {}, devDependencies: {} } } }, null, 2));
}

const results = [];
for (const [name, relativePath, content, expectedSeverity] of SCANNERS) {
  const dir = mkdtempSync(join(tmpdir(), "flixo-diag-mutant-"));
  try {
    setupBase(dir);
    const target = join(dir, relativePath);
    mkdirSync(join(target, ".."), { recursive: true });
    writeFileSync(target, content);
    const scanner = join(dir, "scripts/diagnostics", `${name}.mjs`);
    const result = spawnSync(process.execPath, [scanner], { cwd: dir, encoding: "utf8" });
    const logPath = join(dir, "errors.log.json");
    const entries = existsSync(logPath) ? JSON.parse(readFileSync(logPath, "utf8")) : [];
    const hit = entries.find((entry) => entry.scanner === name && entry.severity === expectedSeverity);
    const passed = Boolean(hit);
    results.push({ scanner: name, expectedSeverity, passed, exitCode: result.status, signature: hit?.message ?? null });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const failed = results.filter((item) => !item.passed);
console.log(JSON.stringify({ version: 1, total: results.length, passed: results.length - failed.length, failed, results }, null, 2));
if (failed.length) process.exit(1);
