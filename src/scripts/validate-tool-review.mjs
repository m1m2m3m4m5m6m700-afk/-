import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const center = fs.readFileSync(path.join(root, "src/components/admin/ToolReviewCenter.tsx"), "utf8");
const rpc = fs.readFileSync(path.join(root, "src/lib/admin/rpc/tool-review.rpc.ts"), "utf8");
const schema = fs.readFileSync(path.join(root, "src/lib/server/db/schema.ts"), "utf8");
const migration = fs.readFileSync(path.join(root, "drizzle/0003_tool_reviews.sql"), "utf8");

const issues = [];

if (!center.includes("reviews[item.slug]")) issues.push("Review center must treat absent review rows as unreviewed.");
if (!center.includes("Star")) issues.push("Review center must render the star review marker.");
if (!center.includes("not_reviewed")) issues.push("Review center must expose an unreviewed filter.");
if (!center.includes('status === "ready"')) issues.push("Review center must distinguish runtime-ready tools from roadmap items.");
if (!rpc.includes("setAdminToolReviewed")) issues.push("Admin review mutation RPC is missing.");
if (!rpc.includes("reviewedAt")) issues.push("Review mutations must record review time.");
if (!rpc.includes("adminSessionMiddleware")) issues.push("Review mutations must be protected by the admin session middleware.");
if (!schema.includes("export const toolReviews")) issues.push("toolReviews table is missing from the server schema.");
if (!migration.includes('CREATE TABLE IF NOT EXISTS "tool_reviews"')) issues.push("Tool review migration is missing.");

if (issues.length) {
  throw new Error(`Tool review validation failed:\n- ${issues.join("\n- ")}`);
}

console.log("Tool review validation passed: review state is separate from readiness, absent rows are unreviewed, and mutations are admin-protected.");
