import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const source = await readFile("tests/desktop-tools.spec.ts", "utf8");

const mutations = [
  {
    name: "zip output content",
    needle: 'expect(await secondZip.files["alpha.txt"].async("string")).toBe("alpha");',
    replacement: 'expect(await secondZip.files["alpha.txt"].async("string")).toBe("MUTATION_SHOULD_FAIL");',
    grep: "ZIP Creator",
  },
  {
    name: "archive extracted content",
    needle: 'const hello = Buffer.from("hello from Flixo");',
    replacement: 'const hello = Buffer.from("MUTATION_SHOULD_FAIL");',
    grep: "Archive Extractor",
  },
  {
    name: "splitter round-trip invariant",
    needle: "expect(merged.equals(source)).toBe(true);",
    replacement: "expect(merged.equals(source)).toBe(false);",
    grep: "File Splitter",
  },
  {
    name: "metadata size correctness",
    needle: 'const expected = { name: "report.txt", type: "text/plain", size: source.byteLength };',
    replacement: 'const expected = { name: "report.txt", type: "text/plain", size: source.byteLength + 1 };',
    grep: "Metadata Viewer",
  },
];

for (const mutation of mutations) {
  const mutated = source.replace(mutation.needle, mutation.replacement);
  if (mutated === source) {
    console.error(`MUTATION GATE: FAIL — target not found: ${mutation.name}`);
    process.exit(1);
  }

  const dir = await mkdtemp(join(tmpdir(), "flixo-mutation-"));
  const spec = join(dir, "desktop-tools.mutation.spec.ts");
  await writeFile(spec, mutated, "utf8");

  const result = await new Promise((resolve) => {
    const child = spawn(
      process.platform === "win32" ? "npx.cmd" : "npx",
      [
        "playwright",
        "test",
        spec,
        "--project=chromium",
        `--grep=${mutation.grep}`,
        "--reporter=line",
      ],
      { stdio: "inherit" },
    );
    child.on("exit", (code, signal) => resolve({ code: code ?? 1, signal }));
  });

  await rm(dir, { recursive: true, force: true });
  if (result.code === 0) {
    console.error(`MUTATION GATE: FAIL — mutation survived: ${mutation.name}`);
    process.exit(1);
  }

  console.log(`MUTATION GATE: rejected mutation: ${mutation.name}`);
}

console.log(`MUTATION GATE: PASS — ${mutations.length} independent mutations rejected.`);
