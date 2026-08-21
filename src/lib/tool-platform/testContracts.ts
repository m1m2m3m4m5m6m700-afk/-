import type { ToolCertificationRequirements, ToolTestCheck, ToolTestContract } from "./types";
import { toolTestContractSchema } from "./schemas";

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

const rawPublicToolTestContracts = [
  { toolId: "image-compressor", route: "/tools/image-compressor", requiredChecks: strictChecks },
  { toolId: "image-enhancer", route: "/tools/image-enhancer", requiredChecks: strictChecks },
  { toolId: "background-remover", route: "/tools/background-remover", requiredChecks: strictChecks },
  { toolId: "video-compressor", route: "/tools/video-compressor", requiredChecks: strictChecks },
  { toolId: "video-trimmer", route: "/tools/video-trimmer", requiredChecks: strictChecks },
  { toolId: "video-to-gif", route: "/tools/video-to-gif", requiredChecks: strictChecks },
  { toolId: "qr-generator", route: "/tools/qr-generator", requiredChecks: strictChecks },
] as const satisfies readonly ToolTestContract[];

export const publicToolTestContracts: readonly ToolTestContract[] = Object.freeze(
  rawPublicToolTestContracts.map((contract) => toolTestContractSchema.parse(contract)),
);
