/**
 * Validates the ten production-language terminology profiles.
 * This checks profile completeness, non-empty terms, required source evidence,
 * and one-to-one concept coverage. It does not pretend that linguistic quality
 * can be proven mechanically; native review remains the final quality gate.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const locales = ["en", "ar", "es", "fr", "de", "pt", "zh-CN", "hi", "ja", "ko", "it"];
const requiredConcepts = [
  "tool", "tools", "workspace", "assistant", "translate", "translator", "image", "compress", "compressor",
  "resize", "convert", "converter", "merge", "split", "extract", "remove", "generate", "generator", "enhance",
  "crop", "rotate", "watermark", "protect", "unlock", "formatter", "validator", "viewer", "reader", "checker",
  "parser", "calculator", "search", "download", "upload",
];

const errors = [];
for (const locale of locales) {
  const file = path.join(root, "src/lib/i18n/glossaries", `${locale}.ts`);
  if (!fs.existsSync(file)) {
    errors.push(`[${locale}] glossary file missing`);
    continue;
  }
  const source = fs.readFileSync(file, "utf8");
  for (const concept of requiredConcepts) {
    const pattern = new RegExp(`\\b${concept}\\s*:\\s*[\"']([^\"']+)[\"']`);
    const match = source.match(pattern);
    if (!match || !match[1].trim()) errors.push(`[${locale}] missing/empty term: ${concept}`);
  }
  if (!/evidence\s*:\s*\[[\s\S]*?https?:\/\//.test(source)) {
    errors.push(`[${locale}] missing evidence URLs`);
  }
}

if (errors.length) {
  console.error(`Terminology profile validation failed with ${errors.length} issue(s).\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log(`Terminology profile validation passed for ${locales.length} languages.`);
