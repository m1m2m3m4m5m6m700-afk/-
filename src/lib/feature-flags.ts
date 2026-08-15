export type FeatureFlag =
  | "experimentalTools"
  | "webResearch"
  | "toolDiscovery"
  | "firstPartyAnalytics"
  | "publicRoadmapSearch";

const DEFAULTS: Record<FeatureFlag, boolean> = {
  experimentalTools: false,
  webResearch: false,
  toolDiscovery: true,
  firstPartyAnalytics: true,
  publicRoadmapSearch: false,
};

function envFlag(name: string, fallback: boolean): boolean {
  const value = import.meta.env[name] as string | undefined;
  if (value === undefined) return fallback;
  return value === "true";
}

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  const envName = `VITE_FEATURE_${flag.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`)}`.toUpperCase();
  return envFlag(envName, DEFAULTS[flag]);
}

export function getFeatureFlags(): Record<FeatureFlag, boolean> {
  return {
    experimentalTools: isFeatureEnabled("experimentalTools"),
    webResearch: isFeatureEnabled("webResearch"),
    toolDiscovery: isFeatureEnabled("toolDiscovery"),
    firstPartyAnalytics: isFeatureEnabled("firstPartyAnalytics"),
    publicRoadmapSearch: isFeatureEnabled("publicRoadmapSearch"),
  };
}
