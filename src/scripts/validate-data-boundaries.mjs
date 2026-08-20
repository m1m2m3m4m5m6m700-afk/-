import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const srcRoot = path.join(root, "src");
const legacyRoot = path.join(srcRoot, "data");
const boundaryRoot = path.join(srcRoot, "lib", "data");
const violations = [];
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
  if (toolsShimPattern.test(source)) {
    shimUses.push(path.relative(root, file).replaceAll(path.sep, "/"));
    continue;
  }
  if (!legacyImportPattern.test(source)) continue;

  const relative = path.relative(root, file).replaceAll(path.sep, "/");
  violations.push(relative);
}

console.log(`DATA BOUNDARY: ${violations.length} direct legacy-data import(s).`);
for (const file of violations) console.log(`- ${file}`);
if (shimUses.length) {
  console.warn(`DATA BOUNDARY: ${shimUses.length} compatibility-shim import(s); migrate touched consumers to @/lib/data.`);
}

if (violations.length) {
  console.error("Import application data through src/lib/data/* instead of src/data/*.");
  process.exit(1);
}

console.log("DATA BOUNDARY: PASS");
