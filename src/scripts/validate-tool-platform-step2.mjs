import { readFile } from "node:fs/promises";

const runtimeTypes = await readFile("src/lib/tool-runtime/types.ts", "utf8");
if (runtimeTypes.includes("@/data/tools") || runtimeTypes.includes("Tool[\"id\"]")) {
  throw new Error("Runtime identity is still coupled to the legacy catalog.");
}

const manifest = await readFile("src/lib/tool-platform/publicDesktopTools.ts", "utf8");
const runtime = await readFile("src/lib/tool-runtime/readyTools.ts", "utf8");
for (const id of ["zip-creator", "archive-extractor", "file-splitter", "metadata-viewer"]) {
  if (!manifest.includes(id)) throw new Error(`Missing manifest: ${id}`);
  if (!runtime.includes(id)) throw new Error(`Missing runtime binding: ${id}`);
}
if (!manifest.includes('lifecycle: "public"')) throw new Error("Public lifecycle is not declared.");
if (!manifest.includes("capabilities")) throw new Error("Tool capabilities are missing.");

console.log("Tool Platform step 2 contract: PASS");
