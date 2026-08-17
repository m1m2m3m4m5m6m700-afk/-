import type { ToolTestContract } from "./types";

const strictChecks = ["render", "interaction", "output", "error"] as const;

export const publicToolTestContracts: readonly ToolTestContract[] = [
  { toolId: "zip-creator", route: "/tools/zip-creator", requiredChecks: strictChecks },
  { toolId: "archive-extractor", route: "/tools/archive-extractor", requiredChecks: strictChecks },
  { toolId: "file-splitter", route: "/tools/file-splitter", requiredChecks: strictChecks },
  { toolId: "metadata-viewer", route: "/tools/metadata-viewer", requiredChecks: strictChecks },
];
