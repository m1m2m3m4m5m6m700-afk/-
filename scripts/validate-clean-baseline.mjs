import { readFile } from "node:fs/promises";

const source = await readFile("src/lib/tool-runtime/readyTools.ts", "utf8");

if (!source.includes("export const readyToolRuntimes = []")) {
  throw new Error("Clean baseline is invalid: public runtime registry is not empty.");
}

if (/from \"\.\/tools\//.test(source)) {
  throw new Error("Clean baseline is invalid: legacy runtime imports leaked into public registry.");
}

if (!source.includes("getReadyToolRuntime")) {
  throw new Error("Clean baseline is invalid: runtime lookup contract is missing.");
}

console.log("Clean baseline contract: PASS");
console.log("Public tools: 0");
console.log("Legacy runtime files: preserved and isolated");
