import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "flixo-regression-test-"));
const target = path.join(tmp, "target.ts");
const rules = path.join(tmp, "REGRESSION_RULES.json");
const source = fs.readFileSync(new URL("./regression-guard.mjs", import.meta.url), "utf8");

try {
  fs.writeFileSync(target, "const value = fullyParallel: true;\n");
  fs.writeFileSync(rules, JSON.stringify({ rules: [{ id: "parallel", targetFile: path.relative(process.cwd(), target), bannedPattern: "fullyParallel\\s*:\\s*true", requiredPattern: "fullyParallel: false", fixSha: "0123456789abcdef0123456789abcdef01234567", guardMode: "blocking" }] }));
  if (!source.includes("SHA_REGEX") || !source.includes("safeTarget") || !source.includes("unsafePattern")) throw new Error("Regression guard hardening contract missing");

  const invalid = spawnSync(process.execPath, ["--input-type=module", "-e", `import { validateRule } from ${JSON.stringify(new URL("./regression-guard.mjs", import.meta.url).href)}; const bad=validateRule({id:"x",targetFile:"../../etc/passwd",bannedPattern:".*",fixSha:"UNKNOWN_SHA",guardMode:"blocking"}); if(bad.valid) process.exit(1);`], { stdio: "inherit" });
  if (invalid.status !== 0) throw new Error("Unsafe rule validation did not fail");
  console.log("PASS regression-guard contract");
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
