import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const LOG = `${ROOT}/errors.log.json`;
const MEMORY = `${ROOT}/failure-memory.json`;
const RULES = `${ROOT}/REGRESSION_RULES.json`;

const sha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
if (!/^[0-9a-f]{40}$/i.test(sha)) throw new Error("Missing exact SHA");

const errors = existsSync(LOG) ? JSON.parse(readFileSync(LOG, "utf8")) : [];
const current = errors.filter((entry) => entry.sha === sha && entry.scanner !== "session");
const memory = existsSync(MEMORY) ? JSON.parse(readFileSync(MEMORY, "utf8")) : { version: 1, signatures: {} };
if (!memory.signatures || typeof memory.signatures !== "object") memory.signatures = {};

for (const entry of current) {
  const signature = `${entry.scanner}:${entry.severity}:${entry.message}`.slice(0, 240);
  const item = memory.signatures[signature] ?? { signature, count: 0, firstSeen: entry.timestamp, lastSeen: entry.timestamp, shas: [], scanners: [entry.scanner] };
  item.count += 1;
  item.lastSeen = entry.timestamp;
  if (!item.shas.includes(entry.sha)) item.shas.push(entry.sha);
  if (!item.scanners.includes(entry.scanner)) item.scanners.push(entry.scanner);
  memory.signatures[signature] = item;
}

writeFileSync(MEMORY, JSON.stringify(memory, null, 2) + "\n", "utf8");

if (existsSync(RULES)) {
  const rules = JSON.parse(readFileSync(RULES, "utf8"));
  if (!Array.isArray(rules.rules)) rules.rules = [];
  for (const item of Object.values(memory.signatures)) {
    if (item.count <= 1) continue;
    const id = `advisory-${Buffer.from(item.signature).toString("hex").slice(0, 16)}`;
    if (!rules.rules.some((rule) => rule.id === id)) {
      rules.rules.push({ id, pattern: item.signature.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags: "", guardMode: "advisory", source: "failure-memory" });
    }
  }
  writeFileSync(RULES, JSON.stringify(rules, null, 2) + "\n", "utf8");
}

console.log(JSON.stringify({ sha, currentEntries: current.length, rememberedSignatures: Object.keys(memory.signatures).length }, null, 2));
