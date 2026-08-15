import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "src/lib/security/requestMiddleware.ts",
  "src/lib/server/security/csrf.ts",
  "src/lib/server/security/request.ts",
  "src/lib/security-headers.ts",
  "src/server.ts",
  "vite.config.ts",
  ".github/workflows/ci.yml",
];
const issues = [];
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) issues.push(`Missing security contract file: ${file}`);
}

const middleware = fs.readFileSync(path.join(root, "src/lib/security/requestMiddleware.ts"), "utf8");
const csrf = fs.readFileSync(path.join(root, "src/lib/server/security/csrf.ts"), "utf8");
const headers = fs.readFileSync(path.join(root, "src/lib/security-headers.ts"), "utf8");
const server = fs.readFileSync(path.join(root, "src/server.ts"), "utf8");
const vite = fs.readFileSync(path.join(root, "vite.config.ts"), "utf8");
const ci = fs.readFileSync(path.join(root, ".github/workflows/ci.yml"), "utf8");

if (!middleware.includes("readCsrfCookie")) issues.push("Request middleware must bind the CSRF cookie to server-function context.");
if (!csrf.includes("timingSafeEqual")) issues.push("CSRF implementation must verify signatures with constant-time comparison.");
if (!headers.includes("Content-Security-Policy") || !headers.includes("frame-ancestors 'none'")) issues.push("Every response must carry a CSP with frame-ancestor protection.");
for (const header of ["X-Content-Type-Options", "Referrer-Policy", "Strict-Transport-Security", "Cross-Origin-Opener-Policy"]) {
  if (!headers.includes(header)) issues.push(`Security response headers must include ${header}.`);
}
if (!server.includes("withSecurityHeaders")) issues.push("Server entry must apply security headers to SSR and API responses.");
if (!server.includes("isSameOriginChatRequest")) issues.push("Chat endpoint must enforce same-origin requests.");
if (vite.includes("allowedHosts: true")) issues.push("Vite must never permit every development host.");
if (!vite.includes("VITE_ALLOWED_HOSTS")) issues.push("Vite host allow-list must be configurable explicitly.");
if (!ci.includes("npm run audit:production")) issues.push("CI must perform the production dependency audit.");

if (issues.length) {
  console.error(`Security contract failed:\n- ${issues.join("\n- ")}`);
  process.exit(1);
}
console.log("Security contract passed: CSRF, security headers, same-origin chat, host allow-list, and dependency-audit gates are present.");
