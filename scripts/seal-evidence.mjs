#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] || ".artifacts/release-tools");
if (!fs.existsSync(root)) {
  console.error(`Evidence directory does not exist: ${root}`);
  process.exit(1);
}

const files = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name !== "evidence-manifest.json") files.push(full);
  }
};
walk(root);
files.sort();

const entries = files.map((file) => ({
  file: path.relative(root, file).replaceAll(path.sep, "/"),
  sha256: crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"),
  bytes: fs.statSync(file).size,
}));

const manifest = {
  schema: "flixo.evidence-manifest.v1",
  commit: process.env.GITHUB_SHA || null,
  run: process.env.GITHUB_RUN_ID || null,
  generatedAt: new Date().toISOString(),
  files: entries,
};

fs.writeFileSync(path.join(root, "evidence-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(JSON.stringify(manifest, null, 2));
