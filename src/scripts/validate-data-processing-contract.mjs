import { readFile } from "node:fs/promises";

const manifest = await readFile("src/lib/tool-platform/publicDesktopTools.ts", "utf8");
const publicTools = ["zip-creator", "archive-extractor", "file-splitter", "metadata-viewer"];
for (const tool of publicTools) {
  const marker = `id: "${tool}"`;
  const start = manifest.indexOf(marker);
  if (start < 0) throw new Error(`Data contract: missing ${tool}`);
  const block = manifest.slice(start, manifest.indexOf("  },", start) + 4);
  if (!block.includes("localOnly: true")) throw new Error(`Data contract: ${tool} is not explicitly local-only.`);
}
console.log(`DATA PROCESSING CONTRACT: PASS — ${publicTools.length} public tools are explicitly local-only.`);
