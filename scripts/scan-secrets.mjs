import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOTS = ["src", "scripts", "tests", ".github", "vite.config.ts", "package.json"];
const SKIP = new Set(["node_modules", ".git", "dist", ".output", "coverage", "playwright-report"]);
const MAX_FILE_BYTES = 1_000_000;

const patterns = [
  { name: "OpenAI-style key", regex: /\bsk-[A-Za-z0-9_-]{20,}\b/g },
  { name: "GitHub token", regex: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g },
  { name: "AWS access key", regex: /\bAKIA[0-9A-Z]{16}\b/g },
  {
    name: "Private key",
    regex: /-----BEGIN (?:RSA |EC |OPENSSH |PGP |DSA )?PRIVATE KEY-----\s+[A-Za-z0-9+/=\r\n]{40,}\s+-----END (?:RSA |EC |OPENSSH |PGP |DSA )?PRIVATE KEY-----/g,
  },
  { name: "Generic secret assignment", regex: /\b(?:api[_-]?key|secret|token|password)\s*[:=]\s*["'][^"']{16,}["']/gi },
];

const findings = [];

async function collect(target) {
  const absolute = join(process.cwd(), target);
  try {
    const { stat } = await import("node:fs/promises");
    const info = await stat(absolute);
    if (info.isFile()) {
      if (info.size <= MAX_FILE_BYTES) await scanFile(absolute);
      return;
    }
  } catch {
    return;
  }

  let entries;
  try {
    entries = await readdir(absolute, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (SKIP.has(entry.name)) continue;
    const child = join(absolute, entry.name);
    if (entry.isDirectory()) await collect(relative(process.cwd(), child));
    else if (entry.isFile()) await scanFile(child);
  }
}

async function scanFile(file) {
  let source;
  try {
    source = await readFile(file, "utf8");
  } catch {
    return;
  }
  for (const pattern of patterns) {
    pattern.regex.lastIndex = 0;
    if (pattern.regex.test(source)) {
      findings.push({ file: relative(process.cwd(), file), pattern: pattern.name });
    }
  }
}

for (const root of ROOTS) await collect(root);

const result = {
  status: findings.length ? "findings" : "clean",
  findings,
  scannedAt: new Date().toISOString(),
};

console.log(JSON.stringify(result, null, 2));

if (findings.length) {
  console.error(`SECRETS SCAN FAILED: ${findings.length} potential finding(s).`);
  process.exit(1);
}

console.log("SECRETS SCAN: PASS");
