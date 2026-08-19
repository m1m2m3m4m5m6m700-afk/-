import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const forbiddenImports = [
  "@/data/tools",
  "@/data/toolSeo",
];

const roots = [
  join(root, "src", "lib", "tool-runtime"),
  join(root, "src", "lib", "tool-platform"),
  join(root, "src", "routes", "tools"),
  join(root, "src", "routes", "$locale", "tools"),
];

const violations = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path);
    else if (/\.(?:ts|tsx|mjs)$/.test(entry)) inspect(path);
  }
}

function inspect(path) {
  const source = readFileSync(path, "utf8");
  for (const importPath of forbiddenImports) {
    if (source.includes(`from \"${importPath}\"`) || source.includes(`from '${importPath}'`)) {
      violations.push(`${relative(root, path)} imports ${importPath}`);
    }
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

console.log("Tool Platform boundary contract: PASS");
