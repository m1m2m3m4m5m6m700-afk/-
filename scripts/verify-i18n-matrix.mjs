import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const localeDir = path.join(root, 'src', 'i18n', 'locales');
const seoPath = path.join(root, 'src', 'seo', 'localized-seo.ts');
const routePath = path.join(root, 'src', 'routes', '$lang', '$tool.tsx');
const { ROUTE_CONTRACT_440, ROUTE_CONTRACT_SIZE } = await import(pathToFileURL(path.join(root, 'src', 'config', 'routes-contract.ts')).href);
const { SUPPORTED_LANGUAGES } = await import(pathToFileURL(path.join(root, 'src', 'config', 'i18n.ts')).href);
const { default: englishLocale } = await import(pathToFileURL(path.join(localeDir, 'en.ts')).href);
const locales = SUPPORTED_LANGUAGES.map((language) => language.code);
const errors = [];
const read = (file) => fs.readFileSync(file, 'utf8');
const toolIds = Object.keys(englishLocale?.tools ?? {});
const seo = read(seoPath);
const route = read(routePath);

if (locales.length !== 20) errors.push(`[GLOBAL][I18N_MATRIX] Expected 20 locales, found ${locales.length}`);
if (toolIds.length !== 22) errors.push(`[GLOBAL][TOOL_MATRIX] Expected 22 tools, found ${toolIds.length}`);
if (ROUTE_CONTRACT_440.length !== ROUTE_CONTRACT_SIZE || ROUTE_CONTRACT_440.length !== 440) errors.push(`[GLOBAL][ROUTE_MATRIX] Expected 440 contract entries, found ${ROUTE_CONTRACT_440.length}`);

for (const lang of locales) {
  const file = path.join(localeDir, `${lang}.ts`);
  if (!fs.existsSync(file)) {
    errors.push(`[${lang.toUpperCase()}][I18N_FILE] Missing locale file: ${path.relative(root, file)}`);
    continue;
  }
  try {
    const module = await import(pathToFileURL(file).href);
    const translations = module.default ?? module[lang];
    if (!translations) {
      errors.push(`[${lang.toUpperCase()}][I18N_EXPORT] Missing locale export`);
      continue;
    }
    if (translations.code !== lang) errors.push(`[${lang.toUpperCase()}][I18N_CODE] Expected code ${lang}, got ${translations.code}`);
    for (const toolId of toolIds) {
      const translation = translations.tools?.[toolId];
      if (!translation?.title?.trim() || !translation?.description?.trim()) {
        errors.push(`[${lang.toUpperCase()}][${toolId}][I18N_MISSING] Missing translated title/description`);
      }
    }
  } catch (error) {
    errors.push(`[${lang.toUpperCase()}][I18N_IMPORT] Failed to import locale module: ${error instanceof Error ? error.message : String(error)}`);
  }
}

for (const routeEntry of ROUTE_CONTRACT_440) {
  if (routeEntry.expectedStatus !== 200 || !routeEntry.path.startsWith(`/${routeEntry.lang}/`)) {
    errors.push(`[ROUTE_CONTRACT][${routeEntry.path}] Invalid route contract entry`);
  }
}
if (!seo.includes('buildHreflangLinks') || !seo.includes("hreflang: 'x-default'")) errors.push('[GLOBAL][HREFLANG] x-default or hreflang builder is missing');
if (!seo.includes("'@type': 'WebApplication'") && !seo.includes("'@type': 'SoftwareApplication'")) errors.push('[GLOBAL][SCHEMA] WebApplication/SoftwareApplication JSON-LD is missing');
for (const key of ['name', 'description', 'inLanguage', 'applicationCategory', 'operatingSystem']) {
  if (!new RegExp(`\\b${key}\\s*:`).test(seo)) errors.push(`[GLOBAL][SCHEMA] Required property missing: ${key}`);
}
for (const required of ['buildHreflangLinks', 'buildWebApplicationJsonLd', 'getPrivacyMessage', 'document.documentElement.lang', 'document.documentElement.dir', 'noindex']) {
  if (!route.includes(required)) errors.push(`[GLOBAL][ROUTE] Required SEO/runtime signal missing: ${required}`);
}
if (!route.includes("rel: 'canonical'")) errors.push('[GLOBAL][CANONICAL] Canonical link is missing from the localized route');

if (errors.length) {
  console.error('❌ SEO/i18n quality gate failed');
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

console.log(`✅ SEO/i18n quality gate passed: ${locales.length} locales × ${toolIds.length} tools = ${ROUTE_CONTRACT_440.length} routes`);
