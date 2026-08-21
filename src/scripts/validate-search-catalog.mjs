import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const searchSource = fs.readFileSync(path.join(root, "src/lib/search.ts"), "utf8");
const platformSource = fs.readFileSync(path.join(root, "src/lib/tool-platform/publicDesktopTools.ts"), "utf8");

const issues = [];
if (!searchSource.includes("publicToolRegistrations")) issues.push("Search catalog must use canonical publicToolRegistrations.");
if (!searchSource.includes("searchableToolSlugs")) issues.push("Search catalog must expose searchableToolSlugs.");
if (!searchSource.includes("searchFlixoTools")) issues.push("Public search API searchFlixoTools is missing.");
if (searchSource.includes("@/data/tools") || searchSource.includes("from \"@/data/tools\"")) issues.push("Search catalog still depends on the deleted legacy tool catalog.");
if (!platformSource.includes("publicToolRegistrations")) issues.push("Canonical public tool registration surface is missing.");

if (issues.length) {
  console.error(`Search catalog validation failed with ${issues.length} issue(s).`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("Search catalog validation passed: canonical tool-platform registry is the only catalog source.");
