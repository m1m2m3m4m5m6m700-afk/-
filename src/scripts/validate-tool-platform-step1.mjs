import { readFile } from "node:fs/promises";

const runtimeTypes = await readFile("src/lib/tool-runtime/types.ts", "utf8");
if (runtimeTypes.includes("@/data/tools") || runtimeTypes.includes("Tool[\"id\"]")) {
  throw new Error("Tool runtime types must not depend on the legacy catalog.");
}

const platformTypes = await readFile("src/lib/tool-platform/types.ts", "utf8");
for (const required of ["ToolId", "ToolSlug", "ToolCategoryId", "ToolManifest", "ToolLifecycleState"]) {
  if (!platformTypes.includes(required)) throw new Error(`Missing platform contract: ${required}`);
}

console.log("Tool Platform step 1 contract: PASS");
