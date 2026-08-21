import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const localeDir = path.join(root, 'src', 'i18n', 'locales');
const seoPath = path.join(root, 'src', 'seo', 'localized-seo.ts');
const routePath = path.join(root, 'src', 'routes', '$lang', '$tool.tsx');
const locales = ['en','zh','hi','es','fr','ar','bn','pt','ru','ur','id','de','ja','sw','mr','te','tr','ta','ko','vi'];
const errors = [];
const read = (file) => fs.readFileSync(file, 'utf8');

const { default: englishLocale } = await import(pathToFileURL(path.join(localeDir, 'en.ts')).href);
const { SUPPORTED_LANGUAGES } = await import(pathToFileURL(path.join(root, 'src', 'config', 'i18n.ts')).href);
const toolIds = Object.keys(englishLocale?.tools ?? {});
const seo = read(seoPath);
const route = read(routePath);

if (locales.length !== 20) errors.push(`[GLOBAL][I18N_MATRIX] Expected 20 locales, found ${locales.length}`);
if (SUPPORTED_LANGUAGES.length !== 20) errors.push(`[GLOBAL][CONFIG_MATRIX] Expected 20 configured languages, found ${SUPPORTED_LANGUAGES.length}`);
if (toolIds.length !== 22) errors.push(`[GLOBAL][TOOL_MATRIX] Expected 22 tools, found ${toolIds.length}`);
if (locales.length * toolIds.length !== 440) errors.push(`[GLOBAL][ROUTE_MATRIX] Expected 440 localized tool routes, found ${locales.length * toolIds.length}`);

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
      errors.push(`[${lang.toUpperCase()}][I18N_EXPORT] Missing default/named export in ${path.relative(root, file)}`);
      continue;
    }
    if (translations.code !== lang) errors.push(`[${lang.toUpperCase()}][I18N_CODE] Expected locale code "${lang}", got "${translations.code}"`);

    const config = SUPPORTED_LANGUAGES.find((language) => language.code === lang);
    if (!config) {
      errors.push(`[${lang.toUpperCase()}][DIRECTION] Language config is missing`);
      continue;
    }
    const expectedDir = ['ar', 'ur'].includes(lang) ? 'rtl' : 'ltr';
    if (config.dir !== expectedDir) errors.push(`[${lang.toUpperCase()}][DIRECTION] Expected dir="${expectedDir}", got "${config.dir}"`);

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

if (!seo.includes('buildHreflangLinks') || !seo.includes("hreflang: 'x-default'")) errors.push('[GLOBAL][HREFLANG] x-default or hreflang builder is missing');
if (!seo.includes("'@type': 'WebApplication'") && !seo.includes("'@type': 'SoftwareApplication'")) errors.push('[GLOBAL][SCHEMA] WebApplication/SoftwareApplication JSON-LD is missing');
for (const key of ['name', 'description', 'inLanguage', 'applicationCategory', 'operatingSystem']) {
  if (!new RegExp(`\\b${key}\\s*:`).test(seo)) errors.push(`[GLOBAL][SCHEMA] Required property missing: ${key}`);
}
if (!route.includes('buildHreflangLinks')) errors.push('[GLOBAL][HEAD] Hreflang links are not injected by the localized route');
if (!route.includes('buildWebApplicationJsonLd')) errors.push('[GLOBAL][HEAD] JSON-LD is not injected by the localized route');
if (!route.includes('getPrivacyMessage')) errors.push('[GLOBAL][PRIVACY] Localized privacy message is missing from tool routes');
if (!route.includes("rel: 'canonical'")) errors.push('[GLOBAL][CANONICAL] Canonical link is missing from the localized route');
if (!route.includes("name: 'description'")) errors.push('[GLOBAL][META] Meta description is missing from the localized route');
if (!route.includes('document.documentElement.lang')) errors.push('[GLOBAL][LANG] Localized route does not set document language');
if (!route.includes('document.documentElement.dir')) errors.push('[GLOBAL][DIR] Localized route does not set document direction');
if (!route.includes('noindex')) errors.push('[GLOBAL][404] Localized invalid-tool path is not marked noindex');

if (errors.length) {
  console.error('❌ SEO/i18n quality gate failed');
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

console.log(`✅ SEO/i18n quality gate passed: ${locales.length} locales × ${toolIds.length} tools = ${locales.length * toolIds.length} routes`);
