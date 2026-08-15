import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const localesDir = path.join(root, "src/lib/i18n/locales");
const reportDir = path.join(root, "reports");
const reportPath = path.join(reportDir, "localization-agent-report.json");
const instructionPath = path.join(reportDir, "LOCALIZATION_AGENT_TASK.md");

const LOCALES = [
  "ar", "es", "zh-CN", "hi", "pt", "fr", "de", "ja", "ko", "tr",
  "it", "ru", "vi", "id", "th", "pl", "nl", "sv", "uk", "ro", "he", "fa", "bn", "ms", "cs", "el",
];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function parseEntries(source) {
  const entries = {};
  const re = /"((?:[^"\\]|\\.)+)"\s*:\s*(?:"((?:[^"\\]|\\.)*)"|`([\\s\\S]*?)`)/g;
  let match;
  while ((match = re.exec(source))) entries[match[1]] = match[2] ?? match[3] ?? "";
  return entries;
}

function loadDictionary(locale) {
  const file = path.join(localesDir, `${locale}.ts`);
  if (!fs.existsSync(file)) throw new Error(`Missing locale file: ${locale}.ts`);
  return parseEntries(fs.readFileSync(file, "utf8"));
}

const en = loadDictionary("en");
const issues = [];
const byLocale = {};

for (const locale of LOCALES) {
  const dict = loadDictionary(locale);
  const missing = [];
  const englishFallback = [];
  const empty = [];

  for (const key of Object.keys(en)) {
    const value = dict[key];
    if (value === undefined) {
      missing.push(key);
      continue;
    }
    if (!String(value).trim()) empty.push(key);
    if (value === en[key] && !/^\{[^}]+\}$/.test(value)) englishFallback.push(key);
  }

  byLocale[locale] = {
    missing,
    empty,
    englishFallback,
    complete: missing.length === 0 && empty.length === 0 && englishFallback.length === 0,
  };

  for (const key of missing) issues.push({ locale, key, kind: "missing", source: en[key] });
  for (const key of empty) issues.push({ locale, key, kind: "empty", source: en[key] });
  for (const key of englishFallback) issues.push({ locale, key, kind: "english-fallback", source: en[key] });
}

const report = {
  generatedAt: new Date().toISOString(),
  sourceLocale: "en",
  locales: byLocale,
  missingCount: issues.filter((i) => i.kind === "missing").length,
  englishFallbackCount: issues.filter((i) => i.kind === "english-fallback").length,
  emptyCount: issues.filter((i) => i.kind === "empty").length,
  completeLocales: LOCALES.filter((l) => byLocale[l].complete),
  incompleteLocales: LOCALES.filter((l) => !byLocale[l].complete),
  ok: issues.length === 0,
};

fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n", "utf8");

const grouped = new Map();
for (const issue of issues) {
  const list = grouped.get(issue.locale) ?? [];
  list.push(issue);
  grouped.set(issue.locale, list);
}

const lines = [
  "# مهمة وكيل Flixo — استكمال الترجمة",
  "",
  "هذه المهمة تُنشأ تلقائيًا عند وجود نص مفقود أو إنجليزي في أي لغة.",
  "",
  "## القاعدة",
  "لا تستخدم الإنجليزية كحل بديل. أضف المصطلح أو العبارة إلى قاموس اللغة نفسها، ثم راجع الصياغة وفق المصطلحات المحلية.",
  "",
];

if (issues.length === 0) {
  lines.push("✅ لا توجد ترجمات ناقصة أو سقوط إلى الإنجليزية.");
} else {
  for (const locale of LOCALES) {
    const list = grouped.get(locale);
    if (!list?.length) continue;
    lines.push(`## ${locale}`);
    for (const issue of list.slice(0, 200)) {
      lines.push(`- [${issue.kind}] ${issue.key}` + (issue.source ? ` — المصدر: ${issue.source}` : ""));
    }
    if (list.length > 200) lines.push(`- … ${list.length - 200} عنصر إضافي`);
    lines.push("");
  }
}

fs.writeFileSync(instructionPath, lines.join("\n") + "\n", "utf8");

console.log(`Localization agent report: ${reportPath}`);
console.log(`Agent instructions: ${instructionPath}`);
console.log(`Missing: ${report.missingCount}; English fallback: ${report.englishFallbackCount}; Empty: ${report.emptyCount}`);

if (issues.length) process.exit(1);
