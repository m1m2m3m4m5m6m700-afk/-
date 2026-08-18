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
  { toolId: "image-compressor", route: "/tools/image-compressor", requiredChecks: strictChecks },
  { toolId: "image-enhancer", route: "/tools/image-enhancer", requiredChecks: strictChecks },
  { toolId: "video-compressor", route: "/tools/video-compressor", requiredChecks: strictChecks },
  { toolId: "video-trimmer", route: "/tools/video-trimmer", requiredChecks: strictChecks },
];
