/**
 * Provider registry / factory.
 *
 * Server-only. The AI service resolves providers through this module so that
 * adding Gemini or Anthropic later is a one-file change:
 *
 *   1. implement `AIProvider` in `./gemini.ts` (or `./anthropic.ts`),
 *   2. register it here in `PROVIDER_FACTORIES` + `getProvider`.
 *
 * No tool or service code needs to change.
 */

import { getAIConfig, type AIProviderConfig } from "../config";
import type { AIProvider } from "./types";
import { OpenAIProvider } from "./openai";

type ProviderFactory = (config: AIProviderConfig) => AIProvider;

const PROVIDER_FACTORIES: Record<string, ProviderFactory> = {
  openai: (config) => new OpenAIProvider(config),
};

const instances = new Map<string, AIProvider>();

/** Get a provider instance by id. Returns undefined for unknown ids. */
export function getProvider(id: string): AIProvider | undefined {
  const cached = instances.get(id);
  if (cached) return cached;

  const config = getAIConfig().providers[id];
  if (!config) return undefined;

  const factory = PROVIDER_FACTORIES[id];
  if (!factory) return undefined;

  const instance = factory(config);
  instances.set(id, instance);
  return instance;
}

/** All providers in the configured fallback chain, in order. */
export function getProviderChain(): AIProvider[] {
  const config = getAIConfig();
  const ids = [
    config.activeProvider,
    ...config.fallbackProviders.filter((id) => id !== config.activeProvider),
  ];
  const chain: AIProvider[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) continue;
    const provider = getProvider(id);
    if (provider) {
      chain.push(provider);
      seen.add(id);
    }
  }
  return chain;
}
