import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const srcRoot = path.join(root, "src");
const legacyRoot = path.join(srcRoot, "data");
const boundaryRoot = path.join(srcRoot, "lib", "data");
const violations = [];
const baselineLegacyImports = [];
const shimUses = [];

const allowedLegacyAdapters = new Set([
  path.normalize(path.join(boundaryRoot, "domains", "content.ts")),
  path.normalize(path.join(boundaryRoot, "domains", "localization.ts")),
  path.normalize(path.join(boundaryRoot, "domains", "seo.ts")),
  path.normalize(path.join(boundaryRoot, "domains", "seo-enterprise.ts")),
  path.normalize(path.join(boundaryRoot, "domains", "blog.ts")),
  path.normalize(path.join(boundaryRoot, "domains", "roadmap.ts")),
  path.normalize(path.join(boundaryRoot, "domains", "knowledge.ts")),
  path.normalize(path.join(boundaryRoot, "domains", "sponsors.ts")),
  path.normalize(path.join(boundaryRoot, "domains", "integrations.ts")),
]);

// Existing architectural debt is tracked, not hidden. New direct legacy imports
// remain blocking so the codebase cannot regress while the debt is migrated.
const baselineFiles = new Set([
  "src/components/landing/Hero.tsx",
  "src/components/landing/SponsorSection.tsx",
  "src/components/seo/ToolStatsWidget.tsx",
  "src/lib/seo/structuredData.ts",
  "src/lib/usePageSeo.ts",
  "src/routes/about.tsx",
  "src/routes/blog/index.tsx",
  "src/routes/categories/$slug.tsx",
  "src/routes/changelog.tsx",
  "src/routes/collections/index.tsx",
  "src/routes/file-types/index.tsx",
  "src/routes/knowledge/index.tsx",
  "src/routes/questions/index.tsx",
  "src/routes/use-cases/index.tsx",
]);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(absolute);
    return /\.(?:ts|tsx|mts|cts|js|mjs)$/.test(entry.name) ? [absolute] : [];
  });
}

const files = walk(srcRoot);
const legacyImportPattern = /(?:from\s*["'](?:@\/)?data\/|import\s*["'](?:@\/)?data\/)/;
const toolsShimPattern = /(?:from\s*["']@\/data\/tools["']|import\s*["']@\/data\/tools["'])/;

for (const file of files) {
  const normalized = path.normalize(file);
  if (normalized.startsWith(`${legacyRoot}${path.sep}`)) continue;
  if (normalized.startsWith(`${boundaryRoot}${path.sep}`) && allowedLegacyAdapters.has(normalized)) continue;

  const source = fs.readFileSync(file, "utf8");
  const relative = path.relative(root, file).replaceAll(path.sep, "/");

  if (toolsShimPattern.test(source)) {
    shimUses.push(relative);
    continue;
  }
  if (!legacyImportPattern.test(source)) continue;

  if (baselineFiles.has(relative)) baselineLegacyImports.push(relative);
  else violations.push(relative);
}

console.log(`DATA BOUNDARY: ${baselineLegacyImports.length} baseline legacy-data import(s) tracked.`);
for (const file of baselineLegacyImports) console.warn(`- baseline: ${file}`);
if (shimUses.length) {
  console.warn(`DATA BOUNDARY: ${shimUses.length} compatibility-shim import(s); migrate touched consumers to @/lib/data.`);
}

if (violations.length) {
  console.error(`DATA BOUNDARY: ${violations.length} NEW direct legacy-data import(s).`);
  for (const file of violations) console.error(`- ${file}`);
  console.error("Import application data through src/lib/data/* instead of src/data/*. Existing baseline debt is advisory; new debt is blocking.");
  process.exit(1);
}

console.log("DATA BOUNDARY: PASS (baseline debt tracked; no new direct legacy imports)");
