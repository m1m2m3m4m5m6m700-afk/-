#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const slug = process.env.TOOL_SLUG ?? process.argv[2];
if (!slug) {
  console.error("TOOL_SLUG is required (for example: qr-generator).");
  process.exit(2);
}

const root = process.cwd();
const files = {
  manifest: path.join(root, "src/lib/tool-platform/publicDesktopTools.ts"),
  ready: path.join(root, "src/lib/tool-runtime/readyTools.ts"),
  content: path.join(root, "src/data/toolContent.ts"),
  seo: path.join(root, "src/data/toolSeo.ts"),
  tests: path.join(root, "tests/desktop-tools.spec.ts"),
  runtime: path.join(root, "src/lib/tool-runtime/tools", `${slug}.tsx`),
  route: path.join(root, "src/routes/tools/$slug.tsx"),
};

const errors = [];
const read = (file) => (existsSync(file) ? readFileSync(file, "utf8") : "");
const manifest = read(files.manifest);
const ready = read(files.ready);
const content = read(files.content);
const seo = read(files.seo);
const tests = read(files.tests);
const runtime = read(files.runtime);

if (!existsSync(files.runtime)) errors.push(`${slug}: runtime file missing`);
if (!existsSync(files.route)) errors.push("dynamic tool route missing");
if (!manifest.includes(`slug: \"${slug}\"`)) errors.push(`${slug}: manifest registration missing`);
if (!ready.includes(`./tools/${slug}`)) errors.push(`${slug}: ready runtime binding missing`);
if (!content.includes(`\"${slug}\"`)) errors.push(`${slug}: content registry entry missing`);
if (!seo.includes(`\"${slug}\"`)) errors.push(`${slug}: SEO registry entry missing`);
if (!tests.includes(`openTool(page, \"${slug}\")`)) errors.push(`${slug}: operational E2E coverage missing`);
if (!runtime.includes("toolId:")) errors.push(`${slug}: runtime toolId binding missing`);
if (!tests.includes("Certification") && !tests.includes("output correctness")) {
  errors.push(`${slug}: certification/output-correctness coverage marker missing`);
}

const report = {
  schemaVersion: 1,
  slug,
  checkedAt: new Date().toISOString(),
  status: errors.length ? "failed" : "ready",
  checks: {
    manifest: errors.every((e) => !e.includes("manifest")),
    runtime: existsSync(files.runtime),
    readyBinding: ready.includes(`./tools/${slug}`),
    content: content.includes(`\"${slug}\"`),
    seo: seo.includes(`\"${slug}\"`),
    route: existsSync(files.route),
    e2e: tests.includes(`openTool(page, \"${slug}\")`),
  },
  errors,
};

console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exit(1);
