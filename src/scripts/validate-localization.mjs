/**
 * Primary localization gate.
 *
 * Covers dictionary coverage/staleness only. Surface concerns such as locale
 * registration, RTL direction, localized routing/SEO, and glossary profiles
 * live in validate-localization-surface.mjs so responsibilities stay clear.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { READY_TOOL_IDS } from "./ready-tool-scope.mjs";

const root = process.cwd();
const updateBaseline = process.argv.includes("--update-baseline");
const baselinePath = path.join(root, "src/lib/i18n/translation-source-baseline.json");
const localeDir = path.join(root, "src/lib/i18n/locales");

function loadText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function parseLocaleCodes() {
  const source = loadText("src/lib/i18n/index.tsx");
  const codes = [...source.matchAll(/\{\s*code:\s*"([A-Za-z0-9-]+)"/g)].map((match) => match[1]);
  if (!codes.length) throw new Error("No locale codes found in src/lib/i18n/index.tsx.");
  return [...new Set(codes)];
}

function parseDictionary(source) {
  const entries = new Map();
  const duplicates = new Set();
  const keyPattern = /"((?:[^"\\]|\\.)+)"\s*:\s*(?:"((?:[^"\\]|\\.)*)"|`([\s\S]*?)`)/g;
  for (const match of source.matchAll(keyPattern)) {
    const key = match[1];
    const value = match[2] ?? match[3] ?? "";
    if (entries.has(key)) duplicates.add(key);
    entries.set(key, value.replace(/\\"/g, '"').replace(/\\n/g, "\n"));
  }
  return { entries, duplicates };
}

function loadLocale(locale) {
  const file = path.join(localeDir, `${locale}.ts`);
  if (!fs.existsSync(file)) throw new Error(`Missing locale dictionary: ${locale}.ts`);
  return parseDictionary(fs.readFileSync(file, "utf8"));
}

function hash(value) {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex").slice(0, 16);
}

function placeholders(value) {
  return new Set([...String(value).matchAll(/\{(\w+)\}/g)].map((match) => match[1]));
}

function loadBaseline() {
  if (!fs.existsSync(baselinePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(baselinePath, "utf8"));
  } catch {
    return {};
  }
}

function main() {
  const locales = parseLocaleCodes();
  const nonEnglishLocales = locales.filter((locale) => locale !== "en");
  const english = loadLocale("en").entries;
  const keys = READY_TOOL_IDS.flatMap((slug) => [`tool.${slug}.name`, `tool.${slug}.tagline`]);
  const errors = [];
  const warnings = [];
  const baseline = loadBaseline();
  const currentHashes = {};

  for (const key of keys) {
    const value = english.get(key);
    if (value === undefined) errors.push(`[en] missing master key: ${key}`);
    else if (!String(value).trim()) errors.push(`[en] empty master key: ${key}`);
    else currentHashes[key] = hash(value);
  }

  const newKeys = keys.filter((key) => !baseline[key]);
  const changedKeys = keys.filter((key) => baseline[key] && baseline[key] !== currentHashes[key]);

  if (updateBaseline) {
    fs.writeFileSync(baselinePath, `${JSON.stringify(currentHashes, null, 2)}\n`, "utf8");
    console.log(`Localization baseline updated: ${keys.length} source keys.`);
    return;
  }

  for (const locale of nonEnglishLocales) {
    const { entries, duplicates } = loadLocale(locale);
    const toolDuplicates = [...duplicates].filter((key) => key.startsWith("tool."));
    if (toolDuplicates.length) errors.push(`[${locale}] duplicate keys: ${toolDuplicates.slice(0, 8).join(", ")}`);

    for (const key of keys) {
      const source = english.get(key);
      const value = entries.get(key);
      if (value === undefined) {
        errors.push(`[${locale}] missing key: ${key}`);
        continue;
      }
      if (!String(value).trim()) {
        errors.push(`[${locale}] empty translation: ${key}`);
        continue;
      }
      if (value === source) warnings.push(`[${locale}] value identical to English: ${key}`);

      const expected = placeholders(source);
      const actual = placeholders(value);
      for (const placeholder of expected) {
        if (!actual.has(placeholder)) {
          errors.push(`[${locale}] placeholder mismatch: ${key} missing {${placeholder}}`);
          break;
        }
      }
    }
  }

  if (newKeys.length) warnings.push(`New English keys not in baseline: ${newKeys.slice(0, 8).join(", ")}${newKeys.length > 8 ? " …" : ""}`);
  if (changedKeys.length) warnings.push(`Changed English source keys: ${changedKeys.slice(0, 8).join(", ")}${changedKeys.length > 8 ? " …" : ""}`);

  console.log(`Localization gate: ${READY_TOOL_IDS.length} ready tools × ${nonEnglishLocales.length} non-English locales.`);
  console.log(`Errors=${errors.length} Advisories=${warnings.length}`);
  for (const warning of warnings.slice(0, 20)) console.warn(`- ${warning}`);

  if (errors.length) {
    console.error("LOCALIZATION GATE: FAIL");
    for (const error of errors.slice(0, 40)) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log("LOCALIZATION GATE: PASS");
}

main();
