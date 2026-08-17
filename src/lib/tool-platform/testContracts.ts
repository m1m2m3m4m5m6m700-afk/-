import type { ToolTestContract } from "./types";

export const publicToolTestContracts: readonly ToolTestContract[] = [
  { toolId: "zip-creator", route: "/tools/zip-creator", requiredChecks: ["render", "interaction", "output"] },
  { toolId: "archive-extractor", route: "/tools/archive-extractor", requiredChecks: ["render", "interaction", "output"] },
  { toolId: "file-splitter", route: "/tools/file-splitter", requiredChecks: ["render", "interaction", "output"] },
  { toolId: "metadata-viewer", route: "/tools/metadata-viewer", requiredChecks: ["render", "interaction", "output"] },
];
