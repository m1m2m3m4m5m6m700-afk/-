import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root, "src/lib/tool-platform/publicDesktopTools.ts");
const source = fs.readFileSync(manifestPath, "utf8");

const ids = [...source.matchAll(/\bid:\s*"([a-z0-9]+(?:-[a-z0-9]+)*)"/g)].map((match) => match[1]);

if (ids.length === 0) {
  throw new Error("No public tool registrations found in publicDesktopTools.ts.");
}

export const READY_TOOL_IDS = Object.freeze([...new Set(ids)]);
export const READY_TOOL_SLUGS = READY_TOOL_IDS;
export const isReadyTool = (value) => READY_TOOL_IDS.includes(value);

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.url.slice(7))) {
  console.log(JSON.stringify({ count: READY_TOOL_IDS.length, ids: READY_TOOL_IDS }, null, 2));
}
