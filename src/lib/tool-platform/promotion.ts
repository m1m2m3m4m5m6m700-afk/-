import type { PublicToolRegistration, ToolLifecycleState } from "./types";

const promotionOrder: readonly ToolLifecycleState[] = [
  "draft",
  "implemented",
  "verified",
  "public",
];

export const canPromote = (
  current: ToolLifecycleState,
  target: ToolLifecycleState,
): boolean => {
  if (target === "deprecated") return current !== "deprecated";
  const currentIndex = promotionOrder.indexOf(current);
  const targetIndex = promotionOrder.indexOf(target);
  return currentIndex >= 0 && targetIndex === currentIndex + 1;
};

export const assertPublicRegistration = (registration: PublicToolRegistration): void => {
  const { manifest, test } = registration;

  if (manifest.lifecycle !== "public") {
    throw new Error(`Public registration requires lifecycle=public: ${manifest.id}`);
  }
  if (test.toolId !== manifest.id) {
    throw new Error(`Test contract does not match manifest: ${manifest.id}`);
  }
  if (test.route !== `/tools/${manifest.slug}`) {
    throw new Error(`Test route does not match manifest: ${manifest.id}`);
  }
  if (test.requiredChecks.length === 0) {
    throw new Error(`Public tool must have regression checks: ${manifest.id}`);
  }
};
