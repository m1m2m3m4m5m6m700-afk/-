import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const localeDir = path.join(root, 'src', 'i18n', 'locales');
const configPath = path.join(root, 'src', 'config', 'i18n.ts');
const toolsPath = path.join(root, 'src', 'config', 'tools.ts');
const seoPath = path.join(root, 'src', 'seo', 'localized-seo.ts');
const routePath = path.join(root, 'src', 'routes', '$lang', '$tool.tsx');

const locales = ['en','zh','hi','es','fr','ar','bn','pt','ru','ur','id','de','ja','sw','mr','te','tr','ta','ko','vi'];
const rtl = new Set(['ar', 'ur']);
const read = (file) => fs.readFileSync(file, 'utf8');
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
const errors = [];

const config = read(configPath);
const toolsSource = read(toolsPath);
const seo = read(seoPath);
const route = read(routePath);
const toolIds = [...toolsSource.matchAll(/\\bid:\\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);

if (locales.length !== 20) errors.push(`[GLOBAL][I18N_MATRIX] Expected 20 locales, found ${locales.length}`);
if (toolIds.length !== 22) errors.push(`[GLOBAL][TOOL_MATRIX] Expected 22 tools, found ${toolIds.length}`);
if (locales.length * toolIds.length !== 440) errors.push(`[GLOBAL][ROUTE_MATRIX] Expected 440 localized tool routes, found ${locales.length * toolIds.length}`);

for (const lang of locales) {
  const file = path.join(localeDir, `${lang}.ts`);
  if (!fs.existsSync(file)) {
    errors.push(`[${lang.toUpperCase()}][I18N_FILE] Missing locale file: ${path.relative(root, file)}`);
    continue;
  }

  const text = read(file);
  if (!new RegExp(`\\bcode\\s*:\\s*['"]${escapeRegex(lang)}['"]`).test(text)) {
    errors.push(`[${lang.toUpperCase()}][I18N_CODE] Locale code declaration is missing or incorrect`);
  }

  const expectedDir = rtl.has(lang) ? 'rtl' : 'ltr';
  const languageEntry = new RegExp(`\\{\\s*code\\s*:\\s*['"]${escapeRegex(lang)}['"][^}]*?\\bdir\\s*:\\s*['"]${expectedDir}['"]\\s*\\}`);
  if (!languageEntry.test(config)) {
    errors.push(`[${lang.toUpperCase()}][DIRECTION] Expected dir="${expectedDir}" in language config`);
  }

  for (const tool of toolIds) {
    const key = escapeRegex(tool);
    const translated = new RegExp(`(?:['"]${key}['"]|${key})\\s*:\\s*\\{\\s*title\\s*:\\s*['"]([^'"]+)['"]\\s*,\\s*description\\s*:\\s*['"]([^'"]+)['"]`);
    const match = text.match(translated);
    if (!match) {
      errors.push(`[${lang.toUpperCase()}][${tool}][I18N_MISSING] Missing translated title/description`);
      continue;
    }
    if (!match[1].trim() || !match[2].trim()) errors.push(`[${lang.toUpperCase()}][${tool}][I18N_EMPTY] Empty title or description`);
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
