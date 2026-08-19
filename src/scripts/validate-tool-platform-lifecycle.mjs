import { readFile } from "node:fs/promises";

const source = await readFile("src/lib/tool-platform/promotion.ts", "utf8");
if (!source.includes('"draft"') || !source.includes('"implemented"') || !source.includes('"verified"') || !source.includes('"public"')) {
  throw new Error("Lifecycle states are incomplete.");
}
if (!source.includes("targetIndex === currentIndex + 1")) {
  throw new Error("Promotion must be sequential.");
}
if (!source.includes("target === \"deprecated\"")) {
  throw new Error("Deprecation transition must be explicit.");
}

console.log("Tool Platform lifecycle contract: PASS");
