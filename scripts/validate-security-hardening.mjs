import { readFile } from "node:fs/promises";
import { access } from "node:fs/promises";

const required = [
  "src/lib/security/rate-limiter.ts",
  "src/lib/security/circuit-breaker.ts",
  "src/lib/security/input.ts",
];

for (const file of required) {
  await access(file);
}

const rateLimiter = await readFile("src/lib/security/rate-limiter.ts", "utf8");
const circuitBreaker = await readFile("src/lib/security/circuit-breaker.ts", "utf8");
const input = await readFile("src/lib/security/input.ts", "utf8");

if (!rateLimiter.includes("class RateLimiter") || !rateLimiter.includes("retryAfterMs")) {
  throw new Error("Rate limiter contract is incomplete");
}
if (!circuitBreaker.includes("class CircuitBreaker") || !circuitBreaker.includes('"half-open"')) {
  throw new Error("Circuit breaker contract is incomplete");
}
if (!input.includes("zod") && !input.includes("z.")) {
  throw new Error("Input validation must use Zod");
}

console.log("Security hardening contracts verified");
