import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const source = await readFile("tests/desktop-tools.spec.ts", "utf8");
const mutated = source.replace('toBe("alpha")', 'toBe("MUTATION_SHOULD_FAIL")');
if (mutated === source) {
  console.error("MUTATION GATE: FAIL — mutation target was not found.");
  process.exit(1);
}

const dir = await mkdtemp(join(tmpdir(), "flixo-mutation-"));
const spec = join(dir, "desktop-tools.mutation.spec.ts");
await writeFile(spec, mutated, "utf8");

const result = await new Promise((resolve) => {
  const child = spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["playwright", "test", spec, "--project=chromium", "--reporter=line"], { stdio: "inherit" });
  child.on("exit", (code, signal) => resolve({ code: code ?? 1, signal }));
});

await rm(dir, { recursive: true, force: true });
if (result.code === 0) {
  console.error("MUTATION GATE: FAIL — mutated expected output passed.");
  process.exit(1);
}
console.log("MUTATION GATE: PASS — injected E2E fault was rejected.");
