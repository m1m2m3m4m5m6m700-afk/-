/**
 * Generated route tree integrity check.
 *
 * The TanStack Vite plugin regenerates src/routeTree.gen.ts during build/dev.
 * This validator catches the dangerous middle state where a route file exists
 * but the committed/generated tree does not contain the route yet.
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const routesDir = path.join(root, "src", "routes");
const generatedPath = path.join(root, "src", "routeTree.gen.ts");

const failures = [];
let routeCount = 0;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (/\.(tsx|ts)$/.test(entry.name) && entry.name !== "__root.tsx") files.push(full);
  }
  return files;
}

function routePathFromFile(file) {
  const relative = path.relative(routesDir, file).replaceAll(path.sep, "/");
  const withoutExt = relative.replace(/\.(tsx|ts)$/, "");
  const segments = withoutExt.split("/");

  if (segments.at(-1) === "index") segments.pop();

  return "/" + segments.filter(Boolean).join("/");
}

function generatedCandidates(route) {
  if (route === "/robots.txt") return ["/robots/txt"];
  if (route === "/") return ["/"];
  return [route, `${route}/`];
}

if (!fs.existsSync(generatedPath)) {
  console.error("Route tree validation failed: src/routeTree.gen.ts is missing.");
  process.exit(1);
}

const generated = fs.readFileSync(generatedPath, "utf8");
for (const file of walk(routesDir)) {
  const route = routePathFromFile(file);
  routeCount += 1;

  const candidates = generatedCandidates(route);
  const present = candidates.some(
    (candidate) => generated.includes(`'${candidate}'`) || generated.includes(`"${candidate}"`),
  );

  if (!present) {
    failures.push({ file: path.relative(root, file), route });
  }
}

console.log(`Route tree validation: checked ${routeCount} route files.`);

if (failures.length) {
  console.error("Generated route tree is stale or incomplete:");
  for (const failure of failures) {
    console.error(`  - ${failure.file} -> ${failure.route}`);
  }
  process.exit(1);
}

console.log("Route tree validation: PASS");
