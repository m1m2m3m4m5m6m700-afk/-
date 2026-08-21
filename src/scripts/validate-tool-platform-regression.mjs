import { readFile } from "node:fs/promises";

const registry = await readFile("src/config/tools.ts", "utf8");
const publicRuntime = await readFile("src/lib/tool-platform/publicDesktopTools.ts", "utf8");
const contracts = await readFile("src/lib/tool-platform/testContracts.ts", "utf8");
const tests = await readFile("tests/desktop-tools.spec.ts", "utf8");

const publicTools = [
  ...registry.matchAll(/\n\s+id:\s*"([^"]+)"/g),
].map((match) => match[1]);

if (publicTools.length === 0) {
  throw new Error("Desktop regression contract: canonical tool registry contains no tools.");
}

const readyTools = new Set(
  [...registry.matchAll(/\n\s+id:\s*"([^"]+)",[\s\S]*?\n\s+isReady:\s*true,/g)].map((match) => match[1]),
);

const contractTools = new Set(
  [...contracts.matchAll(/toolId:\s*"([^"]+)"/g)].map((match) => match[1]),
);

const routeAssertions = new Set([
  ...[...tests.matchAll(/openTool\(page,\s*["']([^"']+)["']\)/g)].map((match) => match[1]),
  ...[...tests.matchAll(/page\.goto\(\s*["']\/tools\/([^"']+)["']/g)].map((match) => match[1]),
]);

if (!publicRuntime.includes("TOOLS_REGISTRY")) {
  throw new Error("Desktop regression contract: public runtime is not connected to the canonical registry.");
}

for (const toolId of readyTools) {
  if (!contractTools.has(toolId)) {
    throw new Error(`Desktop regression contract: test contract missing: ${toolId}`);
  }
  if (!routeAssertions.has(toolId)) {
    throw new Error(`Desktop regression contract: E2E route assertion missing: ${toolId}`);
  }
}

console.log(
  `Desktop regression contract: PASS — ${readyTools.size} ready tools are registered, contracted, and routed.`,
);
