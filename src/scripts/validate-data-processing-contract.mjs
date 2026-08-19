import { readFile } from "node:fs/promises";

const manifest = await readFile("src/lib/tool-platform/publicDesktopTools.ts", "utf8");
const publicTools = [...manifest.matchAll(/\bid:\s*"([^"]+)"/g)].map((match) => match[1]);

if (publicTools.length === 0) {
  throw new Error("Data contract: no public tools found in publicDesktopTools.ts");
}

for (const tool of publicTools) {
  const marker = `id: "${tool}"`;
  const start = manifest.indexOf(marker);
  const end = manifest.indexOf("  },", start);
  if (start < 0 || end < 0) throw new Error(`Data contract: malformed manifest block for ${tool}`);
  const block = manifest.slice(start, end + 4);
  if (!block.includes("localOnly: true")) {
    throw new Error(`Data contract: ${tool} is not explicitly local-only.`);
  }
}

console.log(`DATA PROCESSING CONTRACT: PASS — ${publicTools.length} public tools are explicitly local-only.`);
