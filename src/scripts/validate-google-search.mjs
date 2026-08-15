import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function requireText(source, text, label) {
  if (!source.includes(text)) errors.push(`${label}: missing ${text}`);
}

const i18n = read("src/lib/i18n/index.tsx");
const hreflang = read("src/lib/seo/hreflang.ts");
const homeMetadata = read("src/lib/seo/homePageMetadata.ts");
const toolMetadata = read("src/lib/seo/toolPageMetadata.ts");
const structuredData = read("src/lib/seo/structuredData.ts");
const rootRoute = read("src/routes/__root.tsx");
const localizedHome = read("src/routes/$locale/index.tsx");
const robots = read("public/robots.txt");
const admin = read("src/routes/admin.tsx");

// Canonical site identity must stay stable across SEO helpers.
requireText(read("src/lib/seo/site.ts"), 'SITE_URL = "https://flixoai.vercel.app"', "site identity");

// Multilingual crawling contract: explicit locale URLs + reciprocal hreflang + x-default.
for (const token of [
  "hrefLang: l.code",
  'hrefLang: "x-default"',
  "getHomeUrl(l.code)",
  "getToolCanonicalUrl(slug, l.code)",
]) {
  requireText(hreflang, token, "hreflang contract");
}

requireText(homeMetadata, 'rel: "canonical"', "localized home metadata");
requireText(homeMetadata, "buildHomeHreflang()", "localized home metadata");
requireText(toolMetadata, 'rel: "canonical"', "tool metadata");
requireText(toolMetadata, "buildToolHreflang(slug)", "tool metadata");
requireText(toolMetadata, "localizedCopy?.name", "tool localized title");

// Structured data must describe the actual locale instead of hard-coding English.
requireText(structuredData, "getHomeUrl(locale)", "structured data locale URL");
requireText(structuredData, "inLanguage: languageTag", "structured data language");

// Localized pages must have a locale-aware root shell and must not inherit the
// English WebApplication schema as their own page description.
requireText(rootRoute, "getJsonLdData(locale)", "localized root JSON-LD");
requireText(
  rootRoute,
  'locale === "en" ? [buildRootWebApplicationSchema(), ...shared] : shared',
  "localized root schema split",
);
requireText(localizedHome, "buildHomeHeadMetadata(locale)", "localized homepage head");
requireText(localizedHome, "LocalI18nProvider", "localized homepage dictionary provider");

// Private/admin surfaces must never be indexable.
if (!/name:\s*["']robots["']\s*,\s*content:\s*["']noindex, nofollow["']/.test(admin)) {
  errors.push("admin route must declare robots=noindex,nofollow");
}

// Sitemap discovery must remain explicit and canonical.
requireText(robots, "Sitemap: https://flixoai.vercel.app/sitemap.xml", "robots/sitemap");

// Strict dictionary architecture must remain available. Arabic is the first
// promoted locale; later languages are added through the same explicit gate.
requireText(i18n, "STRICT_DICTIONARY_LOCALES", "strict localization gate");
requireText(i18n, 'new Set<LocaleCode>(["ar"])', "Arabic strict localization gate");

if (errors.length) {
  console.error("Google Search implementation validation FAILED:\n- " + errors.join("\n- "));
  process.exit(1);
}

console.log("Google Search implementation validation passed.");
console.log(
  "Checked: canonical domain, multilingual URLs, hreflang, localized metadata, locale-aware structured data, admin noindex, sitemap discovery, and strict localization architecture.",
);
