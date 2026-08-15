import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalog = fs.readFileSync(path.join(root, "src/data/megaToolsCatalog.ts"), "utf8");
const mapping = fs.readFileSync(path.join(root, "src/data/capcutVerifiedTools.ts"), "utf8");

const handlers = [...mapping.matchAll(/\"([^\"]+)\"/g)].map((match) => match[1]);
const uniqueHandlers = [...new Set(handlers)];
const supported = new Set();

for (const handler of uniqueHandlers) {
  const escaped = handler.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (new RegExp(`\\[\\"${escaped}\\"`).test(catalog) || new RegExp(`\\[\\"[^\\"]+\\", \\\"${escaped}\\"`).test(catalog)) {
    supported.add(handler);
  }
}

const missing = uniqueHandlers.filter((handler) => !supported.has(handler));
if (missing.length) {
  throw new Error(`CapCut verified capability validation failed. Missing MegaTool handlers: ${missing.join(", ")}`);
}

if (uniqueHandlers.length < 12) {
  throw new Error(`Expected at least 12 verified CapCut-style video capabilities; found ${uniqueHandlers.length}.`);
}

console.log(`CapCut-style verified capability validation passed: ${uniqueHandlers.length} handlers mapped to the MegaTool catalog.`);
