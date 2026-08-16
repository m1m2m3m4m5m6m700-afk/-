#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const outputPath = path.join(rootDir, "FLIXO-AUDIT-SOURCE.txt");

const EXCLUDED_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  "playwright-report",
  "test-results",
  ".output",
  ".vercel",
  ".cache",
]);

const EXCLUDED_FILENAMES = new Set([
  "FLIXO-AUDIT-SOURCE.txt",
]);

const EXCLUDED_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".avif",
  ".ico",
  ".bmp",
  ".tiff",
  ".mp3",
  ".wav",
  ".ogg",
  ".mp4",
  ".webm",
  ".mov",
  ".avi",
  ".mkv",
  ".zip",
  ".gz",
  ".tar",
  ".7z",
  ".rar",
  ".pdf",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function runGit(args) {
  try {
    return execFileSync("git", args, { cwd: rootDir, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

function isExcluded(filePath) {
  const relative = path.relative(rootDir, filePath);
  const parts = relative.split(path.sep);
  const name = parts.at(-1) ?? "";
  const extension = path.extname(name).toLowerCase();

  return (
    parts.some((part) => EXCLUDED_DIRS.has(part)) ||
    EXCLUDED_FILENAMES.has(name) ||
    EXCLUDED_EXTENSIONS.has(extension)
  );
}

async function walk(currentDir, files) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(currentDir, entry.name);
    if (isExcluded(absolutePath)) continue;

    if (entry.isDirectory()) {
      await walk(absolutePath, files);
      continue;
    }

    if (entry.isFile()) files.push(absolutePath);
  }
}

function looksBinary(buffer) {
  const sample = buffer.subarray(0, Math.min(buffer.length, 8192));
  return sample.includes(0);
}

function numbered(content) {
  const lines = content.split(/\r?\n/);
  const width = String(lines.length).length;
  return lines
    .map((line, index) => `${String(index + 1).padStart(width, "0")} | ${line}`)
    .join("\n");
}

async function readTextFile(filePath) {
  const stat = await fs.stat(filePath);
  if (stat.size > MAX_FILE_SIZE) {
    return {
      skipped: true,
      reason: `file larger than ${MAX_FILE_SIZE} bytes`,
      size: stat.size,
    };
  }

  const buffer = await fs.readFile(filePath);
  if (looksBinary(buffer)) {
    return { skipped: true, reason: "binary content", size: stat.size };
  }

  return { skipped: false, content: buffer.toString("utf8"), size: stat.size };
}

async function main() {
  const files = [];
  await walk(rootDir, files);
  files.sort((a, b) => path.relative(rootDir, a).localeCompare(path.relative(rootDir, b)));

  const branch = runGit(["branch", "--show-current"]);
  const commit = runGit(["rev-parse", "HEAD"]);
  const generatedAt = new Date().toISOString();

  const sections = [];
  const skipped = [];
  let includedCount = 0;
  let totalLines = 0;

  sections.push(
    "FLIXO AI TOOLS - COMPLETE SOURCE AUDIT BUNDLE",
    "=".repeat(72),
    `Generated at: ${generatedAt}`,
    `Git branch: ${branch}`,
    `Git commit: ${commit}`,
    `Repository root: ${rootDir}`,
    "",
    "Purpose:",
    "This file is generated for static/manual auditing. It contains every readable text source file in the working tree, with paths and line numbers.",
    "",
    "Excluded by design:",
    "Git metadata, dependencies, build outputs, coverage/test artifacts, generated audit output, common binary/media/archive/font files, and text files larger than the configured safety limit.",
    "",
    `File candidates: ${files.length}`,
    "",
  );

  for (const filePath of files) {
    const relative = path.relative(rootDir, filePath).split(path.sep).join("/");
    const result = await readTextFile(filePath);

    if (result.skipped) {
      skipped.push({ path: relative, ...result });
      continue;
    }

    const hash = createHash("sha256").update(result.content, "utf8").digest("hex");
    const lineCount = result.content.split(/\r?\n/).length;
    includedCount += 1;
    totalLines += lineCount;

    sections.push(
      "\n" + "#".repeat(72),
      `FILE: ${relative}`,
      `SIZE_BYTES: ${result.size}`,
      `SHA256: ${hash}`,
      `LINES: ${lineCount}`,
      "#".repeat(72),
      numbered(result.content),
      "",
    );
  }

  sections.push(
    "\n" + "=".repeat(72),
    "AUDIT BUNDLE SUMMARY",
    "=".repeat(72),
    `Included files: ${includedCount}`,
    `Total source lines: ${totalLines}`,
    `Skipped files: ${skipped.length}`,
  );

  if (skipped.length > 0) {
    sections.push("", "Skipped files:");
    for (const item of skipped) {
      sections.push(`- ${item.path} | ${item.reason} | ${item.size ?? 0} bytes`);
    }
  }

  sections.push(
    "",
    "Recommended audit order:",
    "1. Tool registry / definitions / runtime contracts",
    "2. Routes and UI entry points",
    "3. Validators and CI contracts",
    "4. Tool implementations and tests",
    "5. SEO / i18n / accessibility / security",
    "6. Dead code, placeholders, duplicates, and dependency drift",
    "",
  );

  await fs.writeFile(outputPath, sections.join("\n"), "utf8");
  console.log(`Audit bundle generated: ${path.relative(rootDir, outputPath)}`);
  console.log(`Included files: ${includedCount}`);
  console.log(`Total source lines: ${totalLines}`);
  console.log(`Skipped files: ${skipped.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
