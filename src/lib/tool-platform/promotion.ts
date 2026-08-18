import type { PublicToolRegistration, ToolLifecycleState, ToolTestCheck } from "./types";

const promotionOrder: readonly ToolLifecycleState[] = [
  "draft",
  "implemented",
  "verified",
  "public",
];

export const canPromote = (current: ToolLifecycleState, target: ToolLifecycleState): boolean => {
  if (target === "deprecated") return current !== "deprecated";
  const currentIndex = promotionOrder.indexOf(current);
  const targetIndex = promotionOrder.indexOf(target);
  return currentIndex >= 0 && targetIndex === currentIndex + 1;
};

const requiredVerificationChecks: readonly ToolTestCheck[] = [
  "render",
  "interaction",
  "output",
  "error",
  "security",
  "performance",
  "mutation",
  "invariant",
  "evidence",
];

export const assertPublicRegistration = (registration: PublicToolRegistration): void => {
  const { manifest, test } = registration;

  if (manifest.lifecycle !== "public") throw new Error(`Public registration requires lifecycle=public: ${manifest.id}`);
  if (manifest.certification.level !== "certified") throw new Error(`Public tool is not certified: ${manifest.id}`);
  if (!manifest.certification.requiredEvidence) throw new Error(`Public tool requires evidence: ${manifest.id}`);
  if (!manifest.certification.regressionLocked) throw new Error(`Public tool must be regression locked: ${manifest.id}`);
  if (manifest.certification.dataProcessing !== "local-only" || !manifest.capabilities.localOnly) {
    throw new Error(`Public desktop tool must be explicitly local-only: ${manifest.id}`);
  }
  if (test.toolId !== manifest.id) throw new Error(`Test contract does not match manifest: ${manifest.id}`);
  if (test.route !== `/tools/${manifest.slug}`) throw new Error(`Test route does not match manifest: ${manifest.id}`);

  for (const requiredCheck of requiredVerificationChecks) {
    if (!test.requiredChecks.includes(requiredCheck)) {
      throw new Error(`Public tool is missing strict verification check ${requiredCheck}: ${manifest.id}`);
    }
  }
};
