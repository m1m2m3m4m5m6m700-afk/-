/**
 * Production localization invariant.
 *
 * Every non-English locale is a complete independent dictionary. This gate
 * rejects inheritance from English (`...en`) and rejects any missing key from
 * the English master dictionary. A failure blocks the test/build pipeline.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const localesDir = path.join(root, "src/lib/i18n/locales");
const indexPath = path.join(root, "src/lib/i18n/index.tsx");

const source = fs.readFileSync(indexPath, "utf8");
const localeCodes = [...source.matchAll(/\{ code: \"([^\"]+)\"/g)].map((m) => m[1]);
const locales = localeCodes.filter((code) => code !== "en");

function parseKeys(text) {
  const keys = new Set();
  const keyRe = /"((?:[^"\\]|\\.)+)"\s*:/g;
  let match;
  while ((match = keyRe.exec(text))) keys.add(match[1]);
  return keys;
}

const englishSource = fs.readFileSync(path.join(localesDir, "en.ts"), "utf8");
const englishKeys = parseKeys(englishSource);
const errors = [];

for (const locale of locales) {
  const filePath = path.join(localesDir, `${locale}.ts`);
  if (!fs.existsSync(filePath)) {
    errors.push(`[${locale}] dictionary file is missing`);
    continue;
  }

  const text = fs.readFileSync(filePath, "utf8");
  if (/\.\.\.en\s*,?/.test(text)) {
    errors.push(`[${locale}] must not inherit from English via ...en`);
  }

  const keys = parseKeys(text);
  const missing = [...englishKeys].filter((key) => !keys.has(key));
  if (missing.length) {
    errors.push(`[${locale}] missing ${missing.length} dictionary keys: ${missing.slice(0, 12).join(", ")}${missing.length > 12 ? " …" : ""}`);
  }
}

console.log(`Strict localization gate: ${locales.length} non-English locales, ${englishKeys.size} master keys.`);
if (errors.length) {
  console.error("LOCALIZATION GATE FAILED");
  for (const error of errors) console.error(`✖ ${error}`);
  process.exit(1);
}
console.log("LOCALIZATION GATE PASSED ✅");
