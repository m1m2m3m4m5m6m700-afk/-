/**
 * Build output smoke test.
 *
 * Runs after `vite build` (already produced `.output/`). Verifies the
 * production bundle is structurally sound and that no server-only secrets
 * or secret-bearing modules leaked into the client asset bundle.
 *
 * Run: `npm run test:build`
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
let checks = 0;

function check(name, condition, detail) {
  checks += 1;
  if (!condition) {
    failures.push({ name, detail });
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  } else {
    console.log(`  ✓ ${name}`);
  }
}

console.log("\nBuild output smoke test\n");

// Vercel Build Output vs Nitro .output may differ; detect actual layout.
const outputExists = fs.existsSync(path.join(root, ".output"));
const vercelOutput = fs.existsSync(path.join(root, ".vercel/output"));
check(
  "Build produced an output directory (.output or .vercel/output)",
  outputExists || vercelOutput,
);

// Collect all client-side JS asset text for secret scanning.
function collectClientJs(base) {
  const out = [];
  if (!fs.existsSync(base)) return out;
  for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
    const full = path.join(base, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectClientJs(full));
    } else if (entry.name.endsWith(".js") || entry.name.endsWith(".mjs")) {
      out.push(full);
    }
  }
  return out;
}

let clientJsFiles = [];
for (const candidate of [
  path.join(root, ".output/public"),
  path.join(root, ".output/static"),
  path.join(root, ".vercel/output/static"),
]) {
  clientJsFiles.push(...collectClientJs(candidate));
}

// Server function bundles are expected to contain these; the CLIENT bundle
// must NOT. Scan only client assets above.
const clientBlob = clientJsFiles.map((f) => fs.readFileSync(f, "utf8")).join("\n");

check(
  "Client bundle contains no literal API host (api.github.com)",
  !/api\.github\.com/.test(clientBlob),
);
check(
  "Client bundle contains no secret env var names",
  !/OPENAI_API_KEY|GITHUB_CLIENT_SECRET|SMTP_PASS|GITHUB_TOKEN|DATABASE_URL/.test(clientBlob),
);
check(
  "Client bundle contains no server-only secret guard import references",
  !/assertNotSecret|secrets-guard|getCachedToken|createHmac/.test(clientBlob),
);
check(
  "Client bundle contains no drizzle-orm import",
  !/from\s*["']drizzle-orm["']/.test(clientBlob) &&
    !/require\(["']drizzle-orm["']\)/.test(clientBlob),
);

// --- Summary ---
console.log("");
if (failures.length === 0) {
  console.log(`Result: PASS ✅  (${checks} build-output assertions)`);
  process.exit(0);
} else {
  console.log(`Result: FAIL ❌  (${failures.length}/${checks} assertions failed)`);
  process.exit(1);
}
