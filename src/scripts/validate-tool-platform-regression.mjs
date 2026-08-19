import { readFile } from "node:fs/promises";

const registry = await readFile("src/lib/tool-platform/publicDesktopTools.ts", "utf8");
const contracts = await readFile("src/lib/tool-platform/testContracts.ts", "utf8");
const tests = await readFile("tests/desktop-tools.spec.ts", "utf8");

const publicTools = [
  ...registry.matchAll(/\n\s+id:\s*"([^"]+)"/g),
].map((match) => match[1]);

if (publicTools.length === 0) {
  throw new Error("Desktop regression contract: public manifest contains no tools.");
}

const contractTools = new Set(
  [...contracts.matchAll(/toolId:\s*"([^"]+)"/g)].map((match) => match[1]),
);

const routeAssertions = new Set([
  ...[...tests.matchAll(/openTool\(page,\s*["']([^"']+)["']\)/g)].map((match) => match[1]),
  ...[...tests.matchAll(/page\.goto\(\s*["']\/tools\/([^"']+)["']/g)].map((match) => match[1]),
]);

for (const toolId of publicTools) {
  if (!contractTools.has(toolId)) {
    throw new Error(`Desktop regression contract: test contract missing: ${toolId}`);
  }
  if (!routeAssertions.has(toolId)) {
    throw new Error(`Desktop regression contract: E2E route assertion missing: ${toolId}`);
  }
}

console.log(
  `Desktop regression contract: PASS — ${publicTools.length} public tools are registered, contracted, and routed.`,
);
