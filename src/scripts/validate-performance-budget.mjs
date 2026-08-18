import { readFile } from "node:fs/promises";

const budget = JSON.parse(await readFile("tests/fixtures/tool-performance-budget.json", "utf8"));
if (budget.schemaVersion !== 1) throw new Error("Performance budget schema mismatch.");
const tools = ["zip-creator", "archive-extractor", "file-splitter", "metadata-viewer"];
for (const tool of tools) {
  const entry = budget.tools?.[tool];
  if (!entry) throw new Error(`Performance budget missing ${tool}.`);
  if (!(entry.pageLoadMs > 0 && entry.operationMs > 0)) throw new Error(`Invalid performance budget: ${tool}.`);
}
console.log(`PERFORMANCE BUDGET CONTRACT: PASS — ${tools.length} certified tools have explicit budgets.`);
