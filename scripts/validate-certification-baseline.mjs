import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import crypto from "node:crypto";

const root = "baselines";
const failures = [];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (entry.name === "certification-baseline.json") files.push(path);
  }
  return files;
}

const baselineFiles = await walk(root);
if (!baselineFiles.length) {
  console.log(JSON.stringify({ status: "NO_BASELINES", baselines: [] }, null, 2));
  process.exit(0);
}

for (const file of baselineFiles) {
  let baseline;
  try {
    baseline = JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    failures.push(`${file}: invalid JSON (${error instanceof Error ? error.message : String(error)})`);
    continue;
  }

  const required = [
    "schemaVersion", "baselineId", "tool", "version", "status", "verdict",
    "certification", "gates", "quality", "performance", "evidence", "promotion",
  ];
  for (const field of required) if (!(field in baseline)) failures.push(`${file}: missing ${field}`);

  if (baseline.schemaVersion !== 1) failures.push(`${file}: schemaVersion must be 1`);
  if (baseline.status !== "certified" || baseline.verdict !== "CERTIFIED") failures.push(`${file}: baseline must be CERTIFIED`);
  if (baseline.certification?.commit && !/^[0-9a-f]{40}$/.test(baseline.certification.commit)) failures.push(`${file}: invalid certification.commit`);
  if (baseline.promotion?.promotionStatus !== "FROZEN") failures.push(`${file}: promotionStatus must be FROZEN`);
  if (baseline.promotion?.immutable !== true) failures.push(`${file}: immutable must be true`);
  if (baseline.quality?.evidenceComplete !== true) failures.push(`${file}: evidenceComplete must be true`);
  if (baseline.quality?.regressionLocked !== true) failures.push(`${file}: regressionLocked must be true`);

  for (const [gate, evidence] of Object.entries(baseline.gates ?? {})) {
    if (evidence.status !== "success") failures.push(`${file}: gate ${gate} is not success`);
    if (String(evidence.runId) !== String(baseline.certification?.runId)) failures.push(`${file}: gate ${gate} runId mismatch`);
  }

  if (baseline.certification?.certifiedAt && baseline.certification?.expiresAt) {
    if (new Date(baseline.certification.expiresAt) <= new Date(baseline.certification.certifiedAt)) {
      failures.push(`${file}: expiresAt must be later than certifiedAt`);
    }
  }

  const provenancePath = join(file.replace(/certification-baseline\.json$/, ""), "provenance.json");
  try {
    const provenance = JSON.parse(await readFile(provenancePath, "utf8"));
    const content = await readFile(file);
    const digest = crypto.createHash("sha256").update(content).digest("hex");
    if (provenance.baselineFileSha256 !== digest) failures.push(`${file}: provenance baselineFileSha256 mismatch`);
    if (provenance.baselineId !== baseline.baselineId) failures.push(`${file}: provenance baselineId mismatch`);
    if (provenance.sourceRun !== baseline.certification.runId) failures.push(`${file}: provenance sourceRun mismatch`);
    if (provenance.sourceCommit !== baseline.certification.commit) failures.push(`${file}: provenance sourceCommit mismatch`);
    if (provenance.immutable !== true) failures.push(`${file}: provenance immutable must be true`);
  } catch {
    failures.push(`${file}: provenance.json missing or invalid`);
  }
}

const result = {
  schemaVersion: 1,
  status: failures.length ? "FAILED" : "PASS",
  baselineCount: baselineFiles.length,
  baselines: baselineFiles,
  failures,
};

console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
