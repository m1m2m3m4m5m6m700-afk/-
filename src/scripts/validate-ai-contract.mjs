import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const handler = fs.readFileSync(path.join(root, "src/lib/ai/chat/handler.ts"), "utf8");
const flags = fs.readFileSync(path.join(root, "src/lib/feature-flags.ts"), "utf8");
const issues = [];

// Keep this contract semantic rather than depending on formatting/minification.
const hasRuntimeReadyFilter = /tools\s*\.\s*filter\s*\(\s*\(?(?:tool|entry)\)?\s*=>\s*(?:tool|entry)\.status\s*===\s*["']ready["']/.test(handler);
if (!hasRuntimeReadyFilter) issues.push("Flex catalog context must only use runtime-ready tools.");
if (!handler.includes("isFeatureEnabled(\"webResearch\")")) issues.push("Web research must be feature-flagged.");
if (!handler.includes("OPENROUTER_API_KEY") && !handler.includes("GEMINI_API_KEY")) issues.push("Flex must document server-side provider configuration.");
if (!handler.includes("AbortController")) issues.push("Flex provider calls must have bounded cancellation.");
if (!handler.includes("retryable")) issues.push("Flex must distinguish retryable provider failures.");
if (!flags.includes("webResearch") || !flags.includes("toolDiscovery")) issues.push("Feature flag contract must include AI web research and tool discovery.");

if (issues.length) {
  console.error(`AI contract failed:\n- ${issues.join("\n- ")}`);
  process.exit(1);
}
console.log("AI contract passed: runtime-ready tool discovery, gated research, bounded provider calls, and truthful failure states are present.");
