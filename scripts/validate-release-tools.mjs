import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const readyToolsPath = path.join(root, "src/lib/tool-runtime/readyTools.ts");
const desktopSpecPath = path.join(root, "tests/desktop-tools.spec.ts");

const read = (file) => readFileSync(file, "utf8");
const readySource = read(readyToolsPath);
const desktopSource = read(desktopSpecPath);

const imports = [...readySource.matchAll(/from \"\.\/tools\/([^\"]+)\"/g)].map((match) => match[1]);
const readyArray = readySource.match(/export const readyToolRuntimes = \[(.*?)\] as const/s)?.[1] ?? "";
const importedRuntimeNames = [...readySource.matchAll(/import \{\s*([A-Za-z0-9]+Runtime)\s*\}/g)].map((match) => match[1]);
const missingInArray = importedRuntimeNames.filter((name) => !readyArray.includes(name));

const errors = [];
if (imports.length === 0) errors.push("No public runtime imports found in readyTools.ts");
if (missingInArray.length) errors.push(`Imported runtimes missing from readyToolRuntimes: ${missingInArray.join(", ")}`);

for (const slug of imports) {
  const runtimeFile = path.join(root, "src/lib/tool-runtime/tools", `${slug}.tsx`);
  const routeFile = path.join(root, "src/routes/tools", `${slug}.tsx`);
  const contentFile = path.join(root, "src/data/toolContent.ts");
  const seoFile = path.join(root, "src/data/toolSeo.ts");

  if (!existsSync(runtimeFile)) errors.push(`${slug}: runtime missing`);
  if (!existsSync(routeFile)) errors.push(`${slug}: route missing`);
  if (!read(contentFile).includes(`\"${slug}\"`)) errors.push(`${slug}: content registry entry missing`);
  if (!read(seoFile).includes(`\"${slug}\"`)) errors.push(`${slug}: SEO registry entry missing`);
  if (!desktopSource.includes(`/tools/${slug}`)) errors.push(`${slug}: no desktop E2E coverage detected`);
}

const verified = imports.length;
const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  verifiedPublicRuntimes: imports,
  count: verified,
  requiredEvidence: [
    "runtime",
    "route",
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
