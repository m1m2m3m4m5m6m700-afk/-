import { readFile } from "node:fs/promises";

const registry = await readFile("src/lib/tool-platform/publicDesktopTools.ts", "utf8");
const tests = await readFile("tests/desktop-tools.spec.ts", "utf8");

const tools = [
  ["zip-creator", "ZIP Creator"],
  ["archive-extractor", "Archive Extractor"],
  ["file-splitter", "File Splitter"],
  ["metadata-viewer", "Metadata Viewer"],
];

for (const [slug, title] of tools) {
  if (!registry.includes(`id: \"${slug}\"`)) throw new Error(`Public manifest missing: ${slug}`);
  if (!tests.includes(title)) throw new Error(`Regression test missing: ${title}`);
  if (!tests.includes(`/tools/${slug}`)) throw new Error(`Regression route missing: ${slug}`);
}

console.log("Desktop regression contract: PASS");
