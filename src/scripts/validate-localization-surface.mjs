/**
 * Localization surface contract.
 *
 * Keeps non-dictionary localization invariants in one small gate:
 * locale registration, dictionary registry, localized routes/SEO, RTL/LTR
 * direction, and terminology profile completeness.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const fail = (message) => failures.push(message);
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const index = read("src/lib/i18n/index.tsx");
const dictionaries = read("src/lib/i18n/dictionaries.ts");
const home = read("src/routes/$locale/index.tsx");
const toolRoute = read("src/routes/$locale/tools/$slug.tsx");
const homeSeo = read("src/lib/seo/homePageMetadata.ts");

const localeCodes = [...index.matchAll(/\{\s*code:\s*"([A-Za-z0-9-]+)",\s*label:[^\n]+?dir:\s*"(ltr|rtl)"/g)].map((m) => ({ code: m[1], dir: m[2] }));
const localeSet = new Set(localeCodes.map(({ code }) => code));
if (!localeSet.has("en")) fail("English locale is missing from the i18n registry.");

const dictionaryRegistry = dictionaries.match(/export const DICTIONARIES:[\s\S]*?= Object\.freeze\(\{([\s\S]*?)\}\);/);
if (!dictionaryRegistry) {
  fail("Could not locate DICTIONARIES registry.");
} else {
  const registered = new Set(
    [...dictionaryRegistry[1].matchAll(/(?:^|,|\n)\s*(?:"([A-Za-z0-9-]+)"|([A-Za-z0-9-]+))\s*,?/g)]
      .map((m) => m[1] ?? m[2])
      .filter(Boolean),
  );
  for (const code of localeSet) if (!registered.has(code)) fail(`Dictionary registry missing locale: ${code}`);
  for (const code of registered) if (!localeSet.has(code)) fail(`Dictionary registry contains unknown locale: ${code}`);
}

for (const { code } of localeCodes) {
  const file = path.join(root, "src/lib/i18n/locales", `${code}.ts`);
  if (!fs.existsSync(file)) fail(`Locale dictionary file missing: ${code}.ts`);
}

if (!home.includes("LocalI18nProvider")) fail("Localized home route missing LocalI18nProvider.");
if (!toolRoute.includes("LocalI18nProvider")) fail("Localized tool route missing LocalI18nProvider.");
if (!home.includes("buildHomeHeadMetadata")) fail("Localized home route is missing locale-aware SEO metadata.");
if (!toolRoute.includes("buildToolHeadMetadata")) fail("Localized tool route is missing locale-aware SEO metadata.");

for (const { code } of localeCodes.filter(({ code }) => code !== "en")) {
  const escaped = code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!new RegExp(`(?:[\"']${escaped}[\"']|\\b${escaped})\\s*:`).test(homeSeo)) {
    fail(`Missing explicit localized homepage SEO copy for: ${code}`);
  }
}

const rtl = new Set(["ar", "he", "fa"]);
for (const { code, dir } of localeCodes) {
  const expected = rtl.has(code) ? "rtl" : "ltr";
  if (dir !== expected) fail(`${code} must be ${expected}.`);
}
if (!index.includes('document.documentElement.setAttribute("dir", locale)') && !index.includes('document.documentElement.setAttribute("dir", dir)')) {
  fail("I18n provider must apply locale direction to <html>.");
}
if (!index.includes('document.documentElement.setAttribute("lang", locale)')) {
  fail("I18n provider must apply locale language to <html lang>.");
}

const profileLocales = ["en", "ar", "es", "fr", "de", "pt", "zh-CN", "hi", "ja", "ko", "it"];
const requiredConcepts = [
  "tool", "tools", "workspace", "assistant", "translate", "translator", "image", "compress", "compressor",
  "resize", "convert", "converter", "merge", "split", "extract", "remove", "generate", "generator", "enhance",
  "crop", "rotate", "watermark", "protect", "unlock", "formatter", "validator", "viewer", "reader", "checker",
  "parser", "calculator", "search", "download", "upload",
];
for (const locale of profileLocales) {
  const file = path.join(root, "src/lib/i18n/glossaries", `${locale}.ts`);
  if (!fs.existsSync(file)) {
    fail(`[${locale}] glossary profile file missing.`);
    continue;
  }
  const source = fs.readFileSync(file, "utf8");
  for (const concept of requiredConcepts) {
    const pattern = new RegExp(`\\b${concept}\\s*:\\s*[\"']([^\"']+)[\"']`);
    const match = source.match(pattern);
    if (!match || !match[1].trim()) fail(`[${locale}] missing/empty glossary term: ${concept}`);
  }
  if (!/evidence\s*:\s*\[[\s\S]*?https?:\/\//.test(source)) fail(`[${locale}] glossary profile is missing evidence URLs.`);
}

if (failures.length) {
  console.error("LOCALIZATION SURFACE CONTRACT: FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`LOCALIZATION SURFACE CONTRACT: PASS (${localeCodes.length} locales; RTL=${[...rtl].join(", ")})`);
