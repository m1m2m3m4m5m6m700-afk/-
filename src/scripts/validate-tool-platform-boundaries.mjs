import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const forbiddenImports = [
  "@/data/toolSeo",
];

const roots = [
  join(root, "src", "lib", "tool-runtime"),
  join(root, "src", "lib", "tool-platform"),
  join(root, "src", "routes", "tools"),
  join(root, "src", "routes", "$locale", "tools"),
];

const violations = [];
const shimUses = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry.name);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path);
    else if (/\.(?:ts|tsx|mjs)$/.test(entry.name)) inspect(path);
  }
}

function inspect(path) {
  const source = readFileSync(path, "utf8");
  for (const importPath of forbiddenImports) {
    if (source.includes(`from \"${importPath}\"`) || source.includes(`from '${importPath}'`)) {
      violations.push(`${relative(root, path)} imports ${importPath}`);
    }
  }
  if (source.includes('from "@/data/tools"') || source.includes("from '@/data/tools'")) {
    shimUses.push(relative(root, path));
  }
}

for (const rootDir of roots) {
  if (statSync(rootDir).isDirectory()) walk(rootDir);
}

if (violations.length > 0) {
  console.error("Tool Platform boundary contract: FAIL");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

try {
  execFileSync(process.execPath, [join(root, "src/scripts/validate-data-boundaries.mjs")], { stdio: "inherit" });
} catch {
  console.error("Data domain boundary contract: FAIL");
  process.exit(1);
}

if (shimUses.length) {
  console.warn(`Tool Platform compatibility shim usage: ${shimUses.length} file(s). Migrate touched consumers to @/lib/data.`);
}

console.log("Tool Platform boundary contract: PASS");
