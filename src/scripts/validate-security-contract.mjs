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
function readRequired(file) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    issues.push(`Missing security contract file: ${file} (verify the branch/ref contains the expected security surface.)`);
    return "";
  }
  try {
    return fs.readFileSync(fullPath, "utf8");
  } catch (error) {
    issues.push(`Cannot read security contract file: ${file} (${error.message})`);
    return "";
  }
}

const middleware = readRequired(requiredFiles[0]);
const csrf = readRequired(requiredFiles[1]);
readRequired(requiredFiles[2]);
const headers = readRequired(requiredFiles[3]);
const server = readRequired(requiredFiles[4]);
const vite = readRequired(requiredFiles[5]);
const ci = readRequired(requiredFiles[6]);

if (middleware && !middleware.includes("readCsrfCookie")) issues.push("Request middleware must bind the CSRF cookie to server-function context.");
if (csrf && !csrf.includes("timingSafeEqual")) issues.push("CSRF implementation must verify signatures with constant-time comparison.");
if (headers && (!headers.includes("Content-Security-Policy") || !headers.includes("frame-ancestors 'none'"))) {
  issues.push("Every response must carry a CSP with frame-ancestor protection.");
}
for (const header of ["X-Content-Type-Options", "Referrer-Policy", "Strict-Transport-Security", "Cross-Origin-Opener-Policy"]) {
  if (headers && !headers.includes(header)) issues.push(`Security response headers must include ${header}.`);
}
if (server && !server.includes("withSecurityHeaders")) issues.push("Server entry must apply security headers to SSR and API responses.");
if (server && !server.includes("isSameOriginChatRequest")) issues.push("Chat endpoint must enforce same-origin requests.");
if (vite && vite.includes("allowedHosts: true")) issues.push("Vite must never permit every development host.");
if (vite && !vite.includes("VITE_ALLOWED_HOSTS")) issues.push("Vite host allow-list must be configurable explicitly.");
if (ci && !ci.includes("npm run audit:production")) issues.push("CI must perform the production dependency audit.");

if (issues.length) {
  console.error(`Security contract failed:\n- ${issues.join("\n- ")}`);
  process.exit(1);
}
console.log("Security contract passed: file presence, CSRF, security headers, same-origin chat, host allow-list, and dependency-audit gates are verified.");
