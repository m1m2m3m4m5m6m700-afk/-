/* eslint-env node */
import { existsSync, readFileSync } from 'node:fs';

const configSource = readFileSync('src/lib/i18n/config.ts', 'utf8');
const expected = ['en','ar','es','fr','de','ru','zh','hi','id','ur','ja','pt','it','ko','nl','pl','tr','vi','th','sv'];

const localeList = configSource.match(/export const LOCALES = \[([\s\S]*?)\] as const/);
const listed = localeList?.[1]?.match(/'([a-z]{2})'/g)?.map((value) => value.slice(1, -1)) ?? [];

if (listed.length !== expected.length || listed.some((locale, index) => locale !== expected[index])) {
  console.error('LOCALES must contain exactly the canonical 20-locale order.');
  process.exit(1);
}

const missingMetadata = expected.filter((locale) => !new RegExp(`\\b${locale}:\\s*\\{`).test(configSource));
if (missingMetadata.length > 0) {
  console.error(`Missing locale metadata: ${missingMetadata.join(', ')}`);
  process.exit(1);
}

const missingFiles = expected.filter((locale) => !existsSync(`src/lib/i18n/locales/${locale}.ts`));
if (missingFiles.length > 0) {
  console.error(`Missing locale files: ${missingFiles.join(', ')}`);
  process.exit(1);
}

console.log(`i18n structural validation passed: ${expected.length} locales, ${expected.length} locale files.`);
