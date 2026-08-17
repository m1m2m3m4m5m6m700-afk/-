import { readFileSync } from "node:fs";

const files = [
  "src/services/cache/CacheProvider.ts",
  "src/services/cache/RedisCacheProvider.ts",
  "src/services/queue/QueueProvider.ts",
  "src/services/queue/BullMqQueueProvider.ts",
  "src/services/runtime/EdgeRuntime.ts",
];

for (const file of files) {
  const source = readFileSync(file, "utf8");
  if (!source.trim()) throw new Error(`Phase 2 contract is empty: ${file}`);
}

const runtimeFiles = [
  "src/services/cache/CacheProvider.ts",
  "src/services/queue/QueueProvider.ts",
  "src/services/runtime/EdgeRuntime.ts",
];

for (const file of runtimeFiles) {
  const source = readFileSync(file, "utf8");
  if (/from\s+[\"'](redis|bull|bullmq)[\"']/.test(source)) {
    throw new Error(`Direct infrastructure dependency detected in runtime contract: ${file}`);
  }
}

console.log("Phase 2 contracts are structurally valid and infrastructure dependencies remain adapter-bound.");
