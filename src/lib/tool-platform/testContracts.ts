import type { ToolCertificationRequirements, ToolTestCheck, ToolTestContract } from "./types";

const strictChecks = ["render", "interaction", "output", "error", "security", "performance", "mutation", "invariant", "evidence"] as const satisfies readonly ToolTestCheck[];

export const certificationRequirements: ToolCertificationRequirements = Object.freeze({
  level: "certified",
  requiredChecks: strictChecks,
  requiredEvidence: true,
  regressionLocked: true,
  dataProcessing: "local-only",
});

/** No public tool contracts exist during the product reset. */
export const publicToolTestContracts: readonly ToolTestContract[] = Object.freeze([]);
