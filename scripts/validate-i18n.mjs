import { readFileSync } from 'node:fs';

const source = readFileSync('src/lib/i18n/config.ts', 'utf8');
const expected = ['en','ar','es','fr','de','ru','zh','hi','id','ur','ja','pt','it','ko','nl','pl','tr','vi','th','sv'];
const missing = expected.filter((locale) => !new RegExp(`\\b${locale}:\\s*\\{`).test(source));

if (missing.length > 0) {
  console.error(`Missing locale metadata: ${missing.join(', ')}`);
  process.exit(1);
}

const localeList = source.match(/export const LOCALES = \[([\s\S]*?)\] as const/);
const listed = localeList?.[1]?.match(/'([a-z]{2})'/g)?.map((value) => value.slice(1, -1)) ?? [];

if (listed.length !== expected.length || listed.some((locale, index) => locale !== expected[index])) {
  console.error('LOCALES must contain exactly the canonical 20-locale order.');
  process.exit(1);
}

console.log(`i18n structural validation passed: ${expected.length} locales.`);
