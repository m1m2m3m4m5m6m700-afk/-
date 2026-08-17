import { readFile } from "node:fs/promises";

const repoRoot = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, repoRoot), "utf8");

const manifest = await read("lib/tool-platform/publicDesktopTools.ts");
const contracts = await read("lib/tool-platform/testContracts.ts");
const runtimes = await read("lib/tool-runtime/readyTools.ts");
const tests = await read("../../tests/desktop-tools.spec.ts");

const tools = [
  ["zip-creator", "ZIP Creator"],
  ["archive-extractor", "Archive Extractor"],
  ["file-splitter", "File Splitter"],
  ["metadata-viewer", "Metadata Viewer"],
];

const requiredChecks = ["render", "interaction", "output"];

for (const [slug, title] of tools) {
  const manifestEntry = new RegExp(`id: "${slug}"[\\s\\S]*?lifecycle: "public"`).test(manifest);
  if (!manifestEntry) throw new Error(`Public manifest is incomplete: ${slug}`);

  const contractEntry = new RegExp(`toolId: "${slug}"[\\s\\S]*?route: "/tools/${slug}"[\\s\\S]*?requiredChecks: \\[[^\\]]*\\]`).test(contracts);
  if (!contractEntry) throw new Error(`Test contract is incomplete: ${slug}`);
  for (const check of requiredChecks) {
    if (!contracts.includes(`"${check}"`)) throw new Error(`Missing required check type: ${check}`);
  }

  if (!runtimes.includes(slug)) throw new Error(`Runtime binding missing: ${slug}`);
  if (!tests.includes(title)) throw new Error(`Regression test missing: ${title}`);
  if (!tests.includes(`/tools/${slug}`)) throw new Error(`Regression route missing: ${slug}`);
}

console.log(`Desktop tool contract: PASS (${tools.length} tools)`);
