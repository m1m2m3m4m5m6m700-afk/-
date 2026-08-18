import type { ToolCertificationRequirements, ToolTestCheck, ToolTestContract } from "./types";

const strictChecks = [
  "render",
  "interaction",
  "output",
  "error",
  "security",
  "performance",
  "mutation",
  "invariant",
  "evidence",
] as const satisfies readonly ToolTestCheck[];

export const certificationRequirements: ToolCertificationRequirements = Object.freeze({
  level: "certified",
  requiredChecks: strictChecks,
  requiredEvidence: true,
  regressionLocked: true,
  dataProcessing: "local-only",
});

export const publicToolTestContracts: readonly ToolTestContract[] = [
  { toolId: "zip-creator", route: "/tools/zip-creator", requiredChecks: strictChecks },
  { toolId: "archive-extractor", route: "/tools/archive-extractor", requiredChecks: strictChecks },
  { toolId: "file-splitter", route: "/tools/file-splitter", requiredChecks: strictChecks },
  { toolId: "metadata-viewer", route: "/tools/metadata-viewer", requiredChecks: strictChecks },
];
