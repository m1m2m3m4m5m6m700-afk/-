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
const has = (text, pattern) => pattern instanceof RegExp ? pattern.test(text) : text.includes(pattern);

const config = read(configPath);
const tools = read(toolsPath);
const seo = read(seoPath);
const route = read(routePath);

if (locales.length !== 20) errors.push(`[GLOBAL][I18N_MATRIX] Expected 20 locales, found ${locales.length}`);
const toolIds = [...tools.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
if (toolIds.length !== 22) errors.push(`[GLOBAL][TOOL_MATRIX] Expected 22 tools, found ${toolIds.length}`);
if (locales.length * toolIds.length !== 440) errors.push(`[GLOBAL][ROUTE_MATRIX] Expected 440 localized tool routes, found ${locales.length * toolIds.length}`);

for (const lang of locales) {
  const file = path.join(localeDir, `${lang}.ts`);
  if (!fs.existsSync(file)) {
    errors.push(`[${lang.toUpperCase()}][I18N_FILE] Missing locale file: ${path.relative(root, file)}`);
    continue;
  }
  const text = read(file);
  if (!has(text, new RegExp(`code\\s*:\\s*['"]${lang}['"]`))) {
    errors.push(`[${lang.toUpperCase()}][I18N_CODE] Locale code declaration is missing or incorrect`);
  }
  const dir = rtl.has(lang) ? 'rtl' : 'ltr';
  if (!has(config, new RegExp(`code:\s*['"]${lang}['"][\\s\\S]{0,120}?dir:\s*['"]${dir}['"]`))) {
    errors.push(`[${lang.toUpperCase()}][DIRECTION] Expected dir="${dir}" in language config`);
  }

  for (const tool of toolIds) {
    const match = text.match(new RegExp(`['"]${tool.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}['"]\\s*:\\s*\\{\\s*title:\s*['"]([^'"]+)['"]\\s*,\\s*description:\s*['"]([^'"]+)['"]`));
    if (!match) {
      errors.push(`[${lang.toUpperCase()}][${tool}][I18N_MISSING] Missing translated title/description`);
      continue;
    }
    if (!match[1].trim() || !match[2].trim()) errors.push(`[${lang.toUpperCase()}][${tool}][I18N_EMPTY] Empty title or description`);
  }
}

if (!has(seo, 'buildHreflangLinks') || !has(seo, "hreflang: 'x-default'")) errors.push('[GLOBAL][HREFLANG] x-default or hreflang builder is missing');
if (!has(seo, "'@type': 'WebApplication'") && !has(seo, "'@type': 'SoftwareApplication'")) errors.push('[GLOBAL][SCHEMA] WebApplication/SoftwareApplication JSON-LD is missing');
for (const key of ['name', 'description', 'inLanguage', 'applicationCategory', 'operatingSystem']) {
  if (!has(seo, new RegExp(`${key}\\s*:`))) errors.push(`[GLOBAL][SCHEMA] Required property missing: ${key}`);
}
if (!has(route, 'buildHreflangLinks')) errors.push('[GLOBAL][HEAD] Hreflang links are not injected by the localized route');
if (!has(route, 'buildWebApplicationJsonLd')) errors.push('[GLOBAL][HEAD] JSON-LD is not injected by the localized route');
if (!has(route, 'getPrivacyMessage')) errors.push('[GLOBAL][PRIVACY] Localized privacy message is missing from tool routes');
if (!has(route, "rel: 'canonical'")) errors.push('[GLOBAL][CANONICAL] Canonical link is missing from the localized route');
if (!has(route, 'name: \'description\'')) errors.push('[GLOBAL][META] Meta description is missing from the localized route');

if (errors.length) {
  console.error('❌ SEO/i18n quality gate failed');
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

console.log(`✅ SEO/i18n quality gate passed: ${locales.length} locales × ${toolIds.length} tools = ${locales.length * toolIds.length} routes`);
