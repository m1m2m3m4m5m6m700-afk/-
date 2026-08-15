/**
 * Localization page + dictionary audit.
 *
 * This validator complements validate-localization.mjs:
 * - verifies every supported locale has a registered dictionary file
 * - verifies the shared dictionary registry covers the exact locale inventory
 * - verifies every non-English locale has localized home + tool route families
 * - verifies those routes mount LocalI18nProvider and locale-aware SEO helpers
 * - verifies page keys resolve for every locale without empty translations
 * - treats the intentional `...en` dictionary spread as the supported fallback
 *   for keys that do not have an explicit localized override
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

function extractExplicitDictionaryEntries(source) {
  const entries = new Map();
  const entryRe = /\n\s*"((?:[^"\\]|\\.)+)"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
  for (const match of source.matchAll(entryRe)) entries.set(match[1], match[2]);
  return entries;
}

function isToolKey(key) {
  return key.startsWith("tool.");
}

function getEnglishEntries() {
  return extractExplicitDictionaryEntries(read(englishPath));
}

function getPageEntries() {
  return new Map([...getEnglishEntries()].filter(([key]) => !isToolKey(key)));
}

function validateLocaleFiles(locales) {
  const missingFiles = [];
  const missingResolvedPageKeys = new Map();
  const emptyPageKeys = new Map();
  const untranslatedPageKeys = new Map();
  const fallbackPageKeys = new Map();

  const enEntries = getPageEntries();

  for (const locale of locales.filter((x) => x !== "en")) {
    const file = path.join(localeDir, `${locale}.ts`);
    if (!fs.existsSync(file)) {
      missingFiles.push(locale);
      continue;
    }

    const source = read(file);
    const entries = extractExplicitDictionaryEntries(source);
    const missing = [];
    const empty = [];
    const untranslated = [];
    const fallback = [];

    for (const [key, enValue] of enEntries) {
      const value = entries.get(key);
      if (value === undefined) {
        // Locale dictionaries intentionally spread `...en`, so this key still
        // resolves at runtime. Track it as an advisory rather than a failure.
        fallback.push(key);
        continue;
      }
      if (!value.trim()) {
        empty.push(key);
        continue;
      }
      if (value === enValue) untranslated.push(key);
    }

    // A locale file must either provide an explicit value or inherit from the
    // English master. Because every supported locale is typed as `Dictionary`
    // and uses `...en`, a resolved-key gap indicates a real runtime problem.
    if (!source.includes("...en")) {
      for (const key of enEntries.keys()) {
        if (!entries.has(key)) missing.push(key);
      }
    }

    if (missing.length) missingResolvedPageKeys.set(locale, missing);
    if (empty.length) emptyPageKeys.set(locale, empty);
    if (untranslated.length) untranslatedPageKeys.set(locale, untranslated);
    if (fallback.length) fallbackPageKeys.set(locale, fallback);
  }

  return {
    missingFiles,
    missingResolvedPageKeys,
    emptyPageKeys,
    untranslatedPageKeys,
    fallbackPageKeys,
  };
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

  const missingLocaleSeo = locales.filter(
    (locale) => locale !== "en" && !new RegExp(`\\b${locale.replace("-", "\\-")}\\s*:`).test(seo),
  );
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

  const {
    missingFiles,
    missingResolvedPageKeys,
    emptyPageKeys,
    untranslatedPageKeys,
    fallbackPageKeys,
  } = validateLocaleFiles(locales);
  if (missingFiles.length) fail(`Missing locale dictionary files: ${missingFiles.join(", ")}`);

  const coverageErrors = [];
  for (const [locale, keys] of missingResolvedPageKeys) {
    coverageErrors.push(`[${locale}] missing resolved page translations; first keys: ${keys.slice(0, 8).join(", ")}`);
  }
  for (const [locale, keys] of emptyPageKeys) {
    coverageErrors.push(`[${locale}] empty page translations: ${keys.slice(0, 8).join(", ")}`);
  }
  if (coverageErrors.length) fail(`Localization page dictionary audit failed.\n- ${coverageErrors.join("\n- ")}`);

  const routeErrors = validateRouteSurface(locales);
  if (routeErrors.length) fail(`Localized route audit failed.\n- ${routeErrors.join("\n- ")}`);

  const warnings = [];
  for (const [locale, keys] of fallbackPageKeys) {
    if (keys.length) {
      warnings.push(`[${locale}] ${keys.length} page key(s) inherit English via ...en (intentional fallback).`);
    }
  }
  for (const [locale, keys] of untranslatedPageKeys) {
    if (keys.length) {
      warnings.push(`[${locale}] ${keys.length} explicit page value(s) are identical to English and should be reviewed.`);
    }
  }

  console.log(
    `Localization page audit passed: ${locales.length} locales, ${locales.length - 1} localized route families, ${getPageEntries().size} page dictionary keys.`,
  );
  if (warnings.length) {
    console.warn("Advisories:");
    for (const warning of warnings) console.warn(`- ${warning}`);
  }
}

main();
