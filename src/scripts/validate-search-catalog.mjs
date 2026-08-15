import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const searchSource = fs.readFileSync(path.join(root, "src/lib/search.ts"), "utf8");
const toolsSource = fs.readFileSync(path.join(root, "src/data/tools.ts"), "utf8");

const issues = [];

if (!searchSource.includes('tool.status === "ready"')) {
  issues.push("Public search catalog must filter tools by status === ready.");
}

if (!searchSource.includes("searchableToolSlugs")) {
  issues.push("Public search must use the canonical searchableToolSlugs catalog.");
}

if (!searchSource.includes("searchFlixoTools")) {
  issues.push("Public tool search API searchFlixoTools is missing.");
}

if (/searchItems\(\s*tools\b/.test(searchSource)) {
  issues.push("search.ts must not search the full roadmap tools array directly.");
}

const readyCount = (toolsSource.match(/\"ready\"/g) ?? []).length;
const plannedCount = (toolsSource.match(/\"planned\"/g) ?? []).length;
const placeholderCount = (toolsSource.match(/\"placeholder\"/g) ?? []).length;

if (readyCount === 0) issues.push("Tool registry contains no ready tools; cannot build public search catalog.");

const report = {
  ok: issues.length === 0,
  readyCount,
  plannedCount,
  placeholderCount,
  issues,
  policy: "Search may expose only tools marked ready; planned and placeholder tools stay out of public search.",
};

const reportDir = path.join(root, "reports");
fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(
  path.join(reportDir, "search-catalog-report.json"),
  JSON.stringify(report, null, 2) + "\n",
  "utf8",
);

if (issues.length) {
  console.error(`Search catalog validation failed with ${issues.length} issue(s).`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(
  `Search catalog validation passed: ${readyCount} ready entries are eligible; ${plannedCount} planned and ${placeholderCount} placeholder entries are excluded from public search.`,
);
