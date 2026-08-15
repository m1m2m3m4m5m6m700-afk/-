export interface FeatureFlag {
  key: string;
  defaultEnabled: boolean;
  description: string;
  scope: "product" | "tool" | "ai" | "analytics" | "experimental";
}

export const FEATURE_FLAGS = {
  toolDiscoveryV2: {
    key: "toolDiscoveryV2",
    defaultEnabled: true,
    description: "Use the quality-gated tool discovery contract for public search.",
    scope: "product",
  },
  flexWebResearch: {
    key: "flexWebResearch",
    defaultEnabled: false,
    description: "Enable external web research inside Flex when a provider is configured.",
    scope: "ai",
  },
  firstPartyAnalytics: {
    key: "firstPartyAnalytics",
    defaultEnabled: true,
    description: "Enable privacy-first first-party product analytics.",
    scope: "analytics",
  },
  experimentalTools: {
    key: "experimentalTools",
    defaultEnabled: false,
    description: "Expose tools explicitly marked experimental to authorized test cohorts.",
    scope: "experimental",
  },
} as const satisfies Record<string, FeatureFlag>;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;

export function getFeatureFlagDefaults(): Record<FeatureFlagKey, boolean> {
  return Object.fromEntries(
    Object.entries(FEATURE_FLAGS).map(([key, flag]) => [key, flag.defaultEnabled]),
  ) as Record<FeatureFlagKey, boolean>;
}
