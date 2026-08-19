#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const [gate, evidencePathArg] = process.argv.slice(2);
if (!gate || !evidencePathArg) {
  console.error("Usage: node scripts/write-gate-evidence.mjs <gate> <evidence-path>");
  process.exit(1);
}

const evidencePath = path.resolve(evidencePathArg);
if (!fs.existsSync(evidencePath)) {
  console.error(`Evidence file missing: ${evidencePath}`);
  process.exit(1);
}

const evidenceBuffer = fs.readFileSync(evidencePath);
const digest = crypto.createHash("sha256").update(evidenceBuffer).digest("hex");
const outputDir = path.dirname(evidencePath);
const manifestPath = path.join(outputDir, "gate-manifest.json");
const now = new Date().toISOString();
const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

const manifest = {
  schema: "flixo.gate-evidence.v1",
  gate,
  status: "PASS",
  commit: process.env.GITHUB_SHA || null,
  runId: process.env.GITHUB_RUN_ID || null,
  createdAt: now,
  expiresAt,
  evidence: {
    file: path.relative(process.cwd(), evidencePath),
    sha256: digest,
    bytes: evidenceBuffer.length,
  },
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(JSON.stringify(manifest, null, 2));
