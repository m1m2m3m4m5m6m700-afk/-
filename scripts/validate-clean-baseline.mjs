import fs from "node:fs";

const source = fs.readFileSync("src/lib/tool-runtime/readyTools.ts", "utf8");
const catalog = fs.readFileSync("src/lib/desktop-tools/verifiedCatalog.ts", "utf8");

const imports = [...source.matchAll(/from\s+"\.\/tools\/([^"]+)"/g)].map((match) => match[1]);
const registered = (source.match(/readyToolRuntimes = \[([\s\S]*?)\]\s+as const/)?.[1] ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

if (imports.length !== registered.length) {
  throw new Error(`Public registry contract mismatch: ${imports.length} runtime import(s) for ${registered.length} registered runtime(s).`);
}

const readyCatalog = [...catalog.matchAll(/status:\s*"ready"[\s\S]*?slug:\s*"([^"]+)"/g)].map((match) => match[1]);
const publicSlugs = new Set(
  [...source.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]),
);

for (const slug of readyCatalog) {
  if (!publicSlugs.has(slug)) {
    throw new Error(`Catalog entry ${slug} is ready but is not represented by a public runtime.`);
  }
}

console.log("Tool promotion baseline contract: PASS");
console.log(`Public runtimes: ${registered.length}`);
console.log("Legacy source remains preserved and may only become public through explicit promotion.");
