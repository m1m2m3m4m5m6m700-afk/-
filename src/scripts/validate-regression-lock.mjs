import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const baseline = JSON.parse(await readFile("tests/fixtures/tool-certification-baseline.json", "utf8"));
const manifest = await readFile("src/lib/tool-platform/publicDesktopTools.ts", "utf8");
const evidenceDir = path.resolve(".artifacts", "verification-evidence");
const evidenceFiles = await readdir(evidenceDir).catch(() => []);

for (const tool of baseline.certifiedTools) {
  if (!manifest.includes(`id: "${tool}"`)) throw new Error(`Regression lock: certified tool disappeared: ${tool}`);
  if (!evidenceFiles.includes(`${tool}.json`)) throw new Error(`Regression lock: missing evidence artifact for ${tool}`);
}
console.log(`REGRESSION LOCK: PASS — ${baseline.certifiedTools.length} certified tools remain registered and evidenced.`);
