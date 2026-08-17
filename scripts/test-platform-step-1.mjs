import { readFile } from "node:fs/promises";

const source = await readFile("src/lib/tool-platform/types.ts", "utf8");

if (!source.includes('export type ToolLifecycleState = "draft";')) {
  throw new Error("Step 1 contract must expose the draft lifecycle state.");
}
if (!source.includes("export interface ToolManifest")) {
  throw new Error("Step 1 contract must expose ToolManifest.");
}
if (!source.includes("assertToolManifest")) {
  throw new Error("Step 1 contract must expose manifest validation.");
}

console.log("Platform step 1: PASS");
