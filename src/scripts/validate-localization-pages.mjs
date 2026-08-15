/**
 * Localization page + dictionary audit.
 *
 * This validator complements validate-localization.mjs:
 * - verifies every supported locale has a registered dictionary file
 * - verifies the shared dictionary registry covers the exact locale inventory
 * - verifies every non-English locale has localized home + tool route families
 * - verifies those routes mount LocalI18nProvider and locale-aware SEO helpers
 * - verifies every non-tool page key in the English master has an explicit
 *   localized override (no silent English fallback for page chrome/content)
 *
 * Tool name/tagline coverage remains owned by validate-localization.mjs.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const i18nIndexPath = path.join(root, "src/lib/i18n/index.tsx");
const dictionaryRegistryPath = path.join(root, "src/lib/i18n/dictionaries.ts");
const englishPath = path.join(root, "src/lib/i18n/locales/en.ts");
const localeDir = path.join(root, "src/lib/i18n/locales");
const localizedHomeRoute = path.join(root, "src/routes/$locale/index.tsx");
const localizedToolRoute = path.join(root, "src/routes/$locale/tools/$slug.tsx");
const homeSeoPath = path.join(root, "src/lib/seo/homePageMetadata.ts");

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function fail(message) {
  throw new Error(message);
}

function extractLocaleCodes(source) {
  const unionMatch = source.match(/export type LocaleCode =([\s\S]*?);/);
  if (!unionMatch) fail("Could not locate LocaleCode union in src/lib/i18n/index.tsx.");
  return [...unionMatch[1].matchAll(/"([A-Za-z0-9-]+)"/g)].map((m) => m[1]);
}

function extractDictionaryRegistryKeys(source) {
  const block = source.match(/export const DICTIONARIES:[\s\S]*?= Object\.freeze\(\{([\s\S]*?)\}\);/);
  if (!block) fail("Could not locate DICTIONARIES registry in src/lib/i18n/dictionaries.ts.");
  return [...block[1].matchAll(/(?:^|,|\n)\s*(?:"([A-Za-z0-9-]+)"|([A-Za-z0-9-]+))\s*,?/g)]
    .map((m) => m[1] ?? m[2])
    .filter(Boolean);
}

function extractExplicitDictionaryKeys(source) {
  const keys = new Set();
  const keyRe = /\n\s*"((?:[^"\\]|\\.)+)"\s*:/g;
  for (const match of source.matchAll(keyRe)) keys.add(match[1]);
  return keys;
}

function isToolKey(key) {
  return key.startsWith("tool.");
}

function getEnglishKeys() {
  const source = read(englishPath);
  return extractExplicitDictionaryKeys(source);
}

function getPageKeys() {
  return [...getEnglishKeys()].filter((key) => !isToolKey(key));
}

function validateLocaleFiles(locales) {
  const missingFiles = [];
  const missingPageKeys = new Map();
  const emptyPageKeys = new Map();
  const untranslatedPageKeys = new Map();
  const enSource = read(englishPath);
  const enValues = new Map();
  const valueRe = /\n\s*"((?:[^"\\]|\\.)+)"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  for (const match of enSource.matchAll(valueRe)) enValues.set(match[1], match[2]);

  const pageKeys = getPageKeys();
  for (const locale of locales.filter((x) => x !== "en")) {
    const file = path.join(localeDir, `${locale}.ts`);
    if (!fs.existsSync(file)) {
      missingFiles.push(locale);
      continue;
    }

    const source = read(file);
    const entries = extractExplicitDictionaryKeys(source);
    const missing = pageKeys.filter((key) => !entries.has(key));
    const empty = [];
    const untranslated = [];

    for (const key of pageKeys) {
      const valueMatch = source.match(new RegExp(`\\n\\s*"${key.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
      if (valueMatch && !valueMatch[1].trim()) empty.push(key);
      if (valueMatch && enValues.get(key) === valueMatch[1] && valueMatch[1].trim()) untranslated.push(key);
    }

    if (missing.length) missingPageKeys.set(locale, missing);
    if (empty.length) emptyPageKeys.set(locale, empty);
    if (untranslated.length) untranslatedPageKeys.set(locale, untranslated);
  }

  return { missingFiles, missingPageKeys, emptyPageKeys, untranslatedPageKeys };
}

function validateRouteSurface(locales) {
  const errors = [];
  const home = read(localizedHomeRoute);
  const tools = read(localizedToolRoute);
  const seo = read(homeSeoPath);

  if (!home.includes("LocalI18nProvider")) errors.push("Localized home route does not mount LocalI18nProvider.");
  if (!home.includes("buildHomeHeadMetadata")) errors.push("Localized home route does not use locale-aware home SEO metadata.");
  if (!tools.includes("LocalI18nProvider")) errors.push("Localized tool route does not mount LocalI18nProvider.");
  if (!tools.includes("buildToolHeadMetadata")) errors.push("Localized tool route does not use locale-aware tool SEO metadata.");

  const missingLocaleSeo = locales.filter((locale) => locale !== "en" && !new RegExp(`\\b${locale.replace("-", "\\-")}\\s*:`).test(seo));
  if (missingLocaleSeo.length) {
    errors.push(`Missing explicit localized homepage SEO copy for: ${missingLocaleSeo.join(", ")}`);
  }

  return errors;
}

function main() {
  const index = read(i18nIndexPath);
  const registry = read(dictionaryRegistryPath);
  const locales = extractLocaleCodes(index);
  const registryLocales = extractDictionaryRegistryKeys(registry);
  const expected = new Set(locales);
  const actualRegistry = new Set(registryLocales);

  const missingRegistry = locales.filter((locale) => !actualRegistry.has(locale));
  const extraRegistry = registryLocales.filter((locale) => !expected.has(locale));
  if (missingRegistry.length || extraRegistry.length) {
    fail(
      [
        "Dictionary registry mismatch.",
        missingRegistry.length ? `Missing: ${missingRegistry.join(", ")}` : null,
        extraRegistry.length ? `Extra: ${extraRegistry.join(", ")}` : null,
      ].filter(Boolean).join(" "),
    );
  }

  const { missingFiles, missingPageKeys, emptyPageKeys } = validateLocaleFiles(locales);
  if (missingFiles.length) fail(`Missing locale dictionary files: ${missingFiles.join(", ")}`);

  const coverageErrors = [];
  for (const [locale, keys] of missingPageKeys) {
    coverageErrors.push(`[${locale}] missing ${keys.length} explicit page translations; first keys: ${keys.slice(0, 8).join(", ")}`);
  }
  for (const [locale, keys] of emptyPageKeys) {
    coverageErrors.push(`[${locale}] empty page translations: ${keys.slice(0, 8).join(", ")}`);
  }
  if (coverageErrors.length) fail(`Localization page dictionary audit failed.\n- ${coverageErrors.join("\n- ")}`);

  const routeErrors = validateRouteSurface(locales);
  if (routeErrors.length) fail(`Localized route audit failed.\n- ${routeErrors.join("\n- ")}`);

  const warnings = [];
  const { untranslatedPageKeys } = validateLocaleFiles(locales);
  for (const [locale, keys] of untranslatedPageKeys) {
    if (keys.length) warnings.push(`[${locale}] ${keys.length} page value(s) are identical to English and should be reviewed.`);
  }

  console.log(`Localization page audit passed: ${locales.length} locales, ${locales.length - 1} localized route families, ${getPageKeys().length} page dictionary keys.`);
  if (warnings.length) {
    console.warn("Advisories:");
    for (const warning of warnings) console.warn(`- ${warning}`);
  }
}

main();
