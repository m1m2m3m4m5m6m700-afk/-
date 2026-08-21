import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { JsonFailureMemoryStore } from "../lib/ai/diagnostics/failureMemory.js";

const dir = mkdtempSync(join(tmpdir(), "flixo-failure-memory-corruption-"));
const file = join(dir, "memory.json");

try {
  writeFileSync(file, "{ definitely-not-json", "utf8");

  const store = new JsonFailureMemoryStore(file, 10);
  assert.deepEqual(store.recent(), []);

  const files = (await import("node:fs")).readdirSync(dir);
  const quarantine = files.filter((name) => name.startsWith("memory.json.corrupt."));
  assert.equal(quarantine.length, 1);
  assert.ok(readFileSync(join(dir, quarantine[0]), "utf8").includes("definitely-not-json"));

  console.log("FAILURE MEMORY CORRUPTION: PASS");
} finally {
  rmSync(dir, { recursive: true, force: true });
}
