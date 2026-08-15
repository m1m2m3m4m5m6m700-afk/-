import { runMegaTool as runBaseMegaTool } from "./megaToolsEngine.mjs";

const HANDLER_ALIASES = Object.freeze({
  metadata: "inspect",
  preview: "poster",
  "split-even": "extract-range",
});

export async function runMegaTool(tool, file) {
  const normalized = HANDLER_ALIASES[tool.handler]
    ? { ...tool, handler: HANDLER_ALIASES[tool.handler] }
    : tool;
  return runBaseMegaTool(normalized, file);
}
