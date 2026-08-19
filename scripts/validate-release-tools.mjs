import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root, "src/lib/tool-platform/publicDesktopTools.ts");
const readyToolsPath = path.join(root, "src/lib/tool-runtime/readyTools.ts");
const testsDirectory = path.join(root, "tests");
const contentFile = path.join(root, "src/data/toolContent.ts");
const seoFile = path.join(root, "src/data/toolSeo.ts");
const dynamicRouteFile = path.join(root, "src/routes/tools/$slug.tsx");
const runtimeDirectory = path.join(root, "src/lib/tool-runtime/tools");

const read = (file) => readFileSync(file, "utf8");
const manifestSource = read(manifestPath);
const readySource = read(readyToolsPath);
const contentSource = read(contentFile);
const seoSource = read(seoFile);

const collectSpecFiles = (directory) => {
  if (!existsSync(directory)) return [];
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectSpecFiles(fullPath));
    else if (/\.(spec|test)\.(tsx?|jsx?)$/.test(entry.name)) files.push(fullPath);
  }
  return files;
};

const smokeSpecFiles = collectSpecFiles(testsDirectory);
const smokeSource = smokeSpecFiles.map(read).join("\n\n");

const publicTools = [...manifestSource.matchAll(/id:\s*"([^"]+)"[\s\S]*?slug:\s*"([^"]+)"/g)].map((match) => ({
  id: match[1],
  slug: match[2],
}));

const runtimeImports = [...readySource.matchAll(/from\s+"\.\/tools\/([^"]+)"/g)].map((match) => match[1]);
const runtimeSources = new Map();
const errors = [];

for (const runtimeFileName of runtimeImports) {
  const runtimePath = path.join(runtimeDirectory, `${runtimeFileName}.tsx`);
  if (!existsSync(runtimePath)) {
    errors.push(`${runtimeFileName}: imported runtime module is missing`);
    continue;
  }
  runtimeSources.set(runtimeFileName, read(runtimePath));
}

const hasDynamicDesktopToolCoverage =
  smokeSource.includes("async function openTool(page: Page, slug: string)") &&
  smokeSource.includes("page.goto(`/tools/${slug}`)");

if (publicTools.length === 0) errors.push("Public Tool Platform manifest is empty.");
if (runtimeImports.length !== publicTools.length) {
  errors.push(`Public runtime count (${runtimeImports.length}) does not match manifest count (${publicTools.length}).`);
}
if (!existsSync(dynamicRouteFile)) errors.push("Dynamic tool route src/routes/tools/$slug.tsx is missing.");
if (!hasDynamicDesktopToolCoverage) {
  errors.push("Browser E2E specs are missing the canonical dynamic public-tool route helper.");
}

for (const tool of publicTools) {
  const runtimeFile = path.join(runtimeDirectory, `${tool.slug}.tsx`);
  const runtimeSource = runtimeSources.get(tool.slug) ?? (existsSync(runtimeFile) ? read(runtimeFile) : "");

  if (!existsSync(runtimeFile)) errors.push(`${tool.slug}: runtime missing`);
  if (!contentSource.includes(`"${tool.slug}"`)) errors.push(`${tool.slug}: content registry entry missing`);
  if (!seoSource.includes(`"${tool.slug}"`)) errors.push(`${tool.slug}: SEO registry entry missing`);

  const hasExplicitCoverage = smokeSource.includes(`openTool(page, "${tool.slug}")`);
  if (!hasExplicitCoverage) errors.push(`${tool.slug}: no operational E2E coverage detected across test specs`);
  if (!runtimeSource.includes(`toolId: "${tool.id}"`)) errors.push(`${tool.slug}: runtime module is missing toolId binding`);
}

const report = {
  schemaVersion: 5,
  generatedAt: new Date().toISOString(),
  verifiedPublicRuntimes: publicTools.map((tool) => tool.slug),
  count: publicTools.length,
  browserSpecCount: smokeSpecFiles.length,
  requiredEvidence: [
    "runtime",
    "dynamic-route",
    "content",
    "seo",
    "desktop-e2e",
    "repeatability",
    "build",
    "production-audit",
  ],
  status: errors.length ? "failed" : "ready-for-tool-test",
  errors,
};

console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exit(1);
