import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const registry = await readFile("src/config/tools.ts", "utf8");
const publicRuntime = await readFile("src/lib/tool-platform/publicDesktopTools.ts", "utf8");
const contracts = await readFile("src/lib/tool-platform/testContracts.ts", "utf8");

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (["node_modules", ".git", "dist", ".output"].includes(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (/\.spec\.(ts|tsx|js|mjs)$/.test(path)) files.push(path);
  }
  return files;
}

const testSources = await Promise.all((await walk("tests")).map((file) => readFile(file, "utf8")));
const tests = testSources.join("\n");

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
  `Desktop regression contract: PASS — ${readyTools.size} ready tools are registered, contracted, and routed across ${testSources.length} E2E files.`,
);
