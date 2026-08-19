import fs from "node:fs/promises";
import path from "node:path";
import { validateGateManifestSchema } from "./validate-gate-manifest-schema.mjs";
import { readAndVerifyGateManifest } from "./verify-gate-manifest.mjs";

async function findFiles(root, name) {
  const out = [];
  async function walk(dir) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.name === name) out.push(full);
    }
  }
  await walk(root);
  return out;
}

const root = process.env.ARTIFACT_ROOT ?? process.argv[2] ?? `.artifacts`;
const expectedCommit = process.env.GITHUB_SHA ?? process.env.EXPECTED_COMMIT ?? null;
const expectedRunId = process.env.GITHUB_RUN_ID ?? process.env.EXPECTED_RUN_ID ?? null;
const manifests = await findFiles(root, "gate-manifest.json");

if (!manifests.length) {
  console.error(`RELEASE VALIDATION: FAIL — no gate manifests found under ${root}`);
  process.exit(1);
}

const failures = [];
for (const manifestPath of manifests) {
  try {
    const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
    const schema = await validateGateManifestSchema(manifest);
    if (!schema.valid) {
      failures.push({ manifestPath, errors: schema.errors });
      continue;
    }
    const evidencePath = path.join(path.dirname(manifestPath), manifest.evidence.file);
    const verified = await readAndVerifyGateManifest(manifestPath, {
      evidencePath,
      expectedCommit,
      expectedRunId,
    });
    if (!verified.valid) failures.push({ manifestPath, errors: verified.errors });
  } catch (error) {
    failures.push({ manifestPath, errors: [error instanceof Error ? error.message : String(error)] });
  }
}

if (failures.length) {
  console.error("RELEASE VALIDATION: FAIL");
  failures.forEach(({ manifestPath, errors }) => {
    console.error(`- ${manifestPath}`);
    errors.forEach((error) => console.error(`  ${error}`));
  });
  process.exit(1);
}

console.log(`RELEASE VALIDATION: PASS — ${manifests.length} Gate Manifest(s) verified.`);
