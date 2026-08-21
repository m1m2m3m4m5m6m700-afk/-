import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "src/config/tools.ts");
const source = fs.readFileSync(registryPath, "utf8");

const ids = [...source.matchAll(/\{\s*id:\s*"([a-z0-9]+(?:-[a-z0-9]+)*)"[\s\S]*?isReady:\s*(true|false),/g)]
  .filter((match) => match[2] === "true")
  .map((match) => match[1]);

if (ids.length === 0) {
  throw new Error("No ready tools found in src/config/tools.ts.");
}

export const READY_TOOL_IDS = Object.freeze([...new Set(ids)]);
export const READY_TOOL_SLUGS = READY_TOOL_IDS;
export const isReadyTool = (value) => READY_TOOL_IDS.includes(value);

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.url.slice(7))) {
  console.log(JSON.stringify({ count: READY_TOOL_IDS.length, ids: READY_TOOL_IDS }, null, 2));
}
