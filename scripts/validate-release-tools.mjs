import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root, "src/lib/tool-platform/publicDesktopTools.ts");
const readyToolsPath = path.join(root, "src/lib/tool-runtime/readyTools.ts");
const smokeSpecPath = path.join(root, "tests/relaunched-tools.spec.ts");
const contentFile = path.join(root, "src/data/toolContent.ts");
const seoFile = path.join(root, "src/data/toolSeo.ts");

const read = (file) => readFileSync(file, "utf8");
const manifestSource = read(manifestPath);
const readySource = read(readyToolsPath);
const smokeSource = read(smokeSpecPath);
const contentSource = read(contentFile);
const seoSource = read(seoFile);

const publicTools = [...manifestSource.matchAll(/id:\s*"([^"]+)"[\s\S]*?slug:\s*"([^"]+)"/g)].map((match) => ({ id: match[1], slug: match[2] }));
const imports = [...readySource.matchAll(/from\s+"\.\/tools\/([^"]+)"/g)].map((match) => match[1]);

const errors = [];
if (publicTools.length === 0) errors.push("Public Tool Platform manifest is empty.");
if (imports.length !== publicTools.length) {
  errors.push(`Public runtime count (${imports.length}) does not match manifest count (${publicTools.length}).`);
}

for (const tool of publicTools) {
  const runtimeFile = path.join(root, "src/lib/tool-runtime/tools", `${tool.slug}.tsx`);
  const routeFile = path.join(root, "src/routes/tools", `${tool.slug}.tsx`);
  if (!existsSync(runtimeFile)) errors.push(`${tool.slug}: runtime missing`);
  if (!existsSync(routeFile)) errors.push(`${tool.slug}: route missing`);
  if (!contentSource.includes(`\"${tool.slug}\"`)) errors.push(`${tool.slug}: content registry entry missing`);
  if (!seoSource.includes(`\"${tool.slug}\"`)) errors.push(`${tool.slug}: SEO registry entry missing`);
  if (!smokeSource.includes(`/tools/${tool.slug}`)) errors.push(`${tool.slug}: no operational E2E coverage detected`);
  if (!readySource.includes(`toolId: \"${tool.id}\"`)) errors.push(`${tool.slug}: ready runtime is missing toolId binding`);
}

const report = {
  schemaVersion: 2,
  generatedAt: new Date().toISOString(),
  verifiedPublicRuntimes: publicTools.map((tool) => tool.slug),
  count: publicTools.length,
  requiredEvidence: ["runtime", "route", "content", "seo", "desktop-e2e", "repeatability", "build", "production-audit"],
  status: errors.length ? "failed" : "ready-for-tool-test",
  errors,
};

console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exit(1);
