import { readFile } from "node:fs/promises";

const runtimeTypes = await readFile("src/lib/tool-runtime/types.ts", "utf8");
if (runtimeTypes.includes("@/data/tools")) {
  throw new Error("Runtime types must not import the legacy tool catalog.");
}

const runtimeRegistry = await readFile("src/lib/tool-runtime/readyTools.ts", "utf8");
const platformManifest = await readFile("src/lib/tool-platform/publicDesktopTools.ts", "utf8");
const promotion = await readFile("src/lib/tool-platform/promotion.ts", "utf8");

for (const id of ["zip-creator", "archive-extractor", "file-splitter", "metadata-viewer"]) {
  if (!runtimeRegistry.includes(id)) throw new Error(`Runtime missing: ${id}`);
  if (!platformManifest.includes(id)) throw new Error(`Manifest missing: ${id}`);
}

for (const required of ["lifecycle", "capabilities", "ToolTestContract", "assertPublicRegistration"]) {
  const combined = `${platformManifest}\n${promotion}`;
  if (!combined.includes(required)) throw new Error(`Platform contract missing: ${required}`);
}

console.log("Tool Platform architecture contract: PASS");
