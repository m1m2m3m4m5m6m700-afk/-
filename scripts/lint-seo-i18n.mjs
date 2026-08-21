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
const errors = [];
const read = (file) => fs.readFileSync(file, 'utf8');
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const config = read(configPath);
const tools = read(toolsPath);
const seo = read(seoPath);
const route = read(routePath);
const toolIds = [...tools.matchAll(/\bid:\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);

if (locales.length !== 20) errors.push(`[GLOBAL][I18N_MATRIX] Expected 20 locales, found ${locales.length}`);
if (toolIds.length !== 22) errors.push(`[GLOBAL][TOOL_MATRIX] Expected 22 tools, found ${toolIds.length}`);
if (locales.length * toolIds.length !== 440) errors.push(`[GLOBAL][ROUTE_MATRIX] Expected 440 localized tool routes, found ${locales.length * toolIds.length}`);

for (const lang of locales) {
  const file = path.join(localeDir, `${lang}.ts`);
  if (!fs.existsSync(file)) {
    errors.push(`[${lang.toUpperCase()}][I18N_FILE] Missing locale file: ${path.relative(root, file)}`);
    continue;
  }

  const locale = read(file);
  if (!new RegExp(`\\bcode\\s*:\\s*['"]${escapeRegex(lang)}['"]`).test(locale)) {
    errors.push(`[${lang.toUpperCase()}][I18N_CODE] Locale code declaration is missing or incorrect`);
  }

  const expectedDir = rtl.has(lang) ? 'rtl' : 'ltr';
  if (!new RegExp(`\\{\\s*code\\s*:\\s*['"]${escapeRegex(lang)}['"][^}]*?\\bdir\\s*:\\s*['"]${expectedDir}['"]\\s*\\}`).test(config)) {
    errors.push(`[${lang.toUpperCase()}][DIRECTION] Expected dir="${expectedDir}" in language config`);
  }

  for (const tool of toolIds) {
    const key = escapeRegex(tool);
    const match = locale.match(new RegExp(`(?:['"]${key}['"]|${key})\\s*:\\s*\\{\\s*title\\s*:\\s*['"]([^'"]+)['"]\\s*,\\s*description\\s*:\\s*['"]([^'"]+)['"]`));
    if (!match) errors.push(`[${lang.toUpperCase()}][${tool}][I18N_MISSING] Missing translated title/description`);
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

console.log(`✅ SEO/i18n quality gate passed: ${locales.length} locales × ${toolIds.length} tools = ${locales.length * toolIds.length} routes`);
