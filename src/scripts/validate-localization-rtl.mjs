import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const indexPath = path.join(root, "src/lib/i18n/index.tsx");
const homeRoute = path.join(root, "src/routes/$locale/index.tsx");
const toolRoute = path.join(root, "src/routes/$locale/tools/$slug.tsx");

const index = fs.readFileSync(indexPath, "utf8");
const home = fs.readFileSync(homeRoute, "utf8");
const tool = fs.readFileSync(toolRoute, "utf8");

const expectedRtl = ["ar", "he", "fa"];
const expectedLtr = [
  "en", "es", "zh-CN", "hi", "pt", "fr", "de", "ja", "ko", "tr", "it", "vi",
  "id", "th", "pl", "nl", "sv", "uk", "ro", "el", "cs", "bn", "ru", "ms",
];

function localeDirection(locale) {
  const re = new RegExp(`\\{ code: "${locale}", label: [^,]+, dir: "(ltr|rtl)" \\}`);
  return index.match(re)?.[1];
}

const errors = [];
for (const locale of expectedRtl) {
  if (localeDirection(locale) !== "rtl") errors.push(`${locale} must be RTL`);
}
for (const locale of expectedLtr) {
  if (localeDirection(locale) !== "ltr") errors.push(`${locale} must be LTR`);
}

// Validate the actual implementation rather than a variable name used by an older version.
if (
  !index.includes('document.documentElement.setAttribute("dir", locale)') &&
  !index.includes('document.documentElement.setAttribute("dir", dir)')
) {
  errors.push("I18n provider must apply locale direction to <html dir>.");
}
if (!index.includes('document.documentElement.setAttribute("lang", locale)')) {
  errors.push("I18n provider must apply locale language to <html lang>.");
}
if (!home.includes("LocalI18nProvider")) errors.push("Localized home route must mount LocalI18nProvider.");
if (!tool.includes("LocalI18nProvider")) errors.push("Localized tool route must mount LocalI18nProvider.");

if (errors.length) {
  console.error("RTL localization contract failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`RTL localization contract passed: ${expectedRtl.join(", ")} are RTL and ${expectedLtr.length} other locales are LTR.`);
