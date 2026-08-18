import fs from "node:fs";

const registry = fs.readFileSync("src/lib/tool-platform/publicDesktopTools.ts", "utf8");
const lifecycleMatches = [...registry.matchAll(/lifecycle:\s*"([^"]+)"/g)].map((match) => match[1]);

if (!lifecycleMatches.length) {
  console.error("QUARANTINE GATE: FAIL — no lifecycle declarations found.");
  process.exit(1);
}

const invalid = lifecycleMatches.filter((lifecycle) => lifecycle !== "public");
if (invalid.length) {
  console.error(`QUARANTINE GATE: FAIL — non-public lifecycle exposed in public registry: ${invalid.join(", ")}`);
  process.exit(1);
}

const toolIds = [...registry.matchAll(/id:\s*"([^"]+)"/g)].map((match) => match[1]);
const duplicated = toolIds.filter((id, index) => toolIds.indexOf(id) !== index);
if (duplicated.length) {
  console.error(`QUARANTINE GATE: FAIL — duplicate public tool ids: ${[...new Set(duplicated)].join(", ")}`);
  process.exit(1);
}

console.log(`QUARANTINE GATE: PASS — ${toolIds.length} public tools have valid lifecycle and unique ids.`);
