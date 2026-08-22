/* global console, process */
import { readFileSync } from 'node:fs';

const toolsSource = readFileSync('src/config/tools.ts', 'utf8');
const seoSource = readFileSync('src/lib/seo/tool-seo.ts', 'utf8');
const routerSource = readFileSync('src/routes/localized-tool.tsx', 'utf8');

const expectedLocales = ['en','ar','es','fr','de','ru','zh','hi','id','ur','ja','pt','it','ko','nl','pl','tr','vi','th','sv'];
const readyToolIds = [...toolsSource.matchAll(/\{ id: '([^']+)',[^\n]*?isReady: true,/g)].map((match) => match[1]);
const seoLocaleKeys = [...seoSource.matchAll(/([a-z]{2}): '/g)].map((match) => match[1]);

if (readyToolIds.length === 0) {
  console.error('No ready tools discovered in src/config/tools.ts');
  process.exit(1);
}

const uniqueReadyTools = new Set(readyToolIds);
if (uniqueReadyTools.size !== readyToolIds.length) {
  console.error('Duplicate ready tool ids detected.');
  process.exit(1);
}

if (seoLocaleKeys.length !== expectedLocales.length || seoLocaleKeys.some((locale, index) => locale !== expectedLocales[index])) {
  console.error('SEO locale label registry must contain the canonical 20-locale order.');
  process.exit(1);
}

if (expectedLocales.some((locale) => !seoSource.includes(`${locale}: '`))) {
  console.error('One or more SEO locale labels are missing.');
  process.exit(1);
}

if (!routerSource.includes("path: '/$locale/$tool'")) {
  console.error('Multilingual tool route is not registered.');
  process.exit(1);
}

if (!routerSource.includes("rel: 'canonical'")) {
  console.error('Canonical link generation is missing.');
  process.exit(1);
}

if (!routerSource.includes("hrefLang: 'x-default'")) {
  console.error('x-default hreflang is missing.');
  process.exit(1);
}

if (!routerSource.includes('application/ld+json')) {
  console.error('Structured data JSON-LD is missing from the localized tool route.');
  process.exit(1);
}

console.log(`SEO validation passed: ${expectedLocales.length} locales, ${readyToolIds.length} ready tools, dynamic localized routing, canonical, hreflang, and JSON-LD present.`);
