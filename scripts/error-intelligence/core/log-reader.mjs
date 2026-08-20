import fs from 'node:fs';

const PATTERNS = [
  { type: 'TYPECHECK', re: /TS\d{3,5}\b|Type error|type ['"]?.*['"] is not assignable/i, priority: 100 },
  { type: 'DEPENDENCY', re: /npm ERR!|ERESOLVE|Cannot find module|Cannot find package|lockfile|package-lock/i, priority: 95 },
  { type: 'PLAYWRIGHT', re: /Playwright|browserType|page\.|locator\(|Timeout .* exceeded/i, priority: 90 },
  { type: 'BUILD', re: /Build failed|vite .*failed|Module build failed|RollupError/i, priority: 85 },
  { type: 'SECURITY', re: /vulnerability|CVE-\d{4}-\d+|npm audit|CodeQL|secret scanning/i, priority: 80 },
  { type: 'LOCALIZATION', re: /localization|translation|missing key|i18n|fallback/i, priority: 75 },
  { type: 'WORKFLOW', re: /GitHub Actions|workflow|YAML|validate-ci-contract|runner/i, priority: 70 },
];

function extractFile(text) {
  const patterns = [
    /(?:at\s+)?([\w./-]+\.(?:tsx|ts|jsx|js|mjs|json|yml|yaml))(?::(\d+)(?::(\d+))?)/i,
    /(?:file|path)[=:]\s*([^\s]+\.(?:tsx|ts|jsx|js|mjs|json|yml|yaml))/i,
  ];
  for (const re of patterns) {
    const match = text.match(re);
    if (match) return { path: match[1], line: match[2] ? Number(match[2]) : null, column: match[3] ? Number(match[3]) : null };
  }
  return { path: null, line: null, column: null };
}

function extractMessage(text, type) {
  const lines = String(text).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const preferred = lines.find((line) => {
    if (type === 'TYPECHECK') return /TS\d{3,5}\b|Type error|not assignable/i.test(line);
    if (type === 'DEPENDENCY') return /ERESOLVE|Cannot find module|Cannot find package|npm ERR!/i.test(line);
    if (type === 'PLAYWRIGHT') return /Timeout|Playwright|locator\(/i.test(line);
    return /error|failed|failure/i.test(line);
  });
  return (preferred || lines.at(-1) || '').slice(0, 1200);
}

export function readLog(input) {
  const text = typeof input === 'string' ? input : fs.readFileSync(input, 'utf8');
  const matches = PATTERNS.filter((entry) => entry.re.test(text)).sort((a, b) => b.priority - a.priority);
  const type = matches[0]?.type ?? 'UNKNOWN';
  const location = extractFile(text);
  return {
    version: 1,
    errorType: type,
    errorMessage: extractMessage(text, type),
    stackTrace: text.split(/\r?\n/).filter((line) => /\bat\s+.*\.(?:m?js|ts|tsx|js):\d+/.test(line)).slice(0, 20),
    affectedFile: location.path,
    line: location.line,
    column: location.column,
    matchedRules: matches.map((entry) => entry.type),
    sourceChars: text.length,
  };
}

export const READ_LOG_PATTERNS = PATTERNS.map(({ type, priority }) => ({ type, priority }));
