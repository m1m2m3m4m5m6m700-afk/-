import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "src/lib/security/requestMiddleware.ts",
  "src/lib/server/security/csrf.ts",
  "src/lib/server/security/request.ts",
  "vite.config.ts",
  ".github/workflows/ci.yml",
];
const issues = [];
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) issues.push(`Missing security contract file: ${file}`);
}

const middleware = fs.readFileSync(path.join(root, "src/lib/security/requestMiddleware.ts"), "utf8");
const csrf = fs.readFileSync(path.join(root, "src/lib/server/security/csrf.ts"), "utf8");
const vite = fs.readFileSync(path.join(root, "vite.config.ts"), "utf8");
const ci = fs.readFileSync(path.join(root, ".github/workflows/ci.yml"), "utf8");

if (!middleware.includes("readCsrfCookie")) issues.push("Request middleware must bind the CSRF cookie to server-function context.");
if (!csrf.includes("csrf") || !csrf.includes("timingSafeEqual")) issues.push("CSRF implementation must verify signed tokens with constant-time comparison.");
if (vite.includes("allowedHosts: true")) issues.push("Vite must never permit every development host.");
if (!vite.includes("VITE_ALLOWED_HOSTS")) issues.push("Vite host allow-list must be configurable explicitly.");
if (!ci.includes("npm run audit:production")) issues.push("CI must perform the production dependency audit.");

if (issues.length) {
  console.error(`Security contract failed:\n- ${issues.join("\n- ")}`);
  process.exit(1);
}
console.log("Security contract passed: CSRF, host allow-list, and dependency-audit gates are present.");
