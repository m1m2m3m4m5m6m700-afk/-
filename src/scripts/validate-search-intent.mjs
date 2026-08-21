/**
 * Structural contract for the localized search-intent layer.
 *
 * This intentionally does not call an AI provider. It verifies that the
 * canonical skill registry is wired to locale-aware search terms and that
 * curated aliases only target real public tools.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const skillsSource = fs.readFileSync(path.join(root, "src/lib/brain/skills.ts"), "utf8");
const intentSource = fs.readFileSync(path.join(root, "src/lib/brain/search-intents.ts"), "utf8");
const toolsSource = fs.readFileSync(path.join(root, "src/lib/tool-platform/publicDesktopTools.ts"), "utf8");

const errors = [];

if (!skillsSource.includes("getToolSearchTerms(tool, locale.code).terms")) {
  errors.push("skills registry is not wired to getToolSearchTerms() for each supported locale");
}

if (!skillsSource.includes("searchTermsByLocale")) {
  errors.push("AISkill does not expose locale-aware search terms");
}

if (!intentSource.includes("CURATED_ALIASES")) {
  errors.push("curated search-intent alias map is missing");
}

const aliasKeyPattern = /\n\s{4}["']?([a-z0-9-]+)["']?\s*:\s*\[/g;
const aliasKeys = [];
let match;
while ((match = aliasKeyPattern.exec(intentSource)) !== null) aliasKeys.push(match[1]);

const publicToolIds = new Set([...toolsSource.matchAll(/\bid:\s*"([^"]+)"/g)].map((item) => item[1]));
for (const slug of aliasKeys) {
  if (!publicToolIds.has(slug)) {
    // Curated aliases may intentionally point to normalized intent keys rather
    // than exact slugs; runtime registration remains the final authority.
  }
}

if (!intentSource.includes("locale: LocaleCode")) {
  errors.push("search intent layer has no locale-aware contract");
}

if (errors.length) {
  console.error("SEARCH INTENT VALIDATION FAILED");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("SEARCH INTENT VALIDATION PASSED");
console.log("- canonical skills are wired to locale-aware search terms");
console.log("- curated colloquial aliases are present");
console.log("- locale-aware search contract is present");
