/**
 * Provider registry / factory.
 *
 * Server-only. The AI service resolves providers through this module so that
 * adding a new provider is a one-file registry change.
 */

import { getAIConfig, type AIProviderConfig } from "../config";
import type { AIProvider } from "./types";
import { GeminiProvider } from "./gemini";
import { OpenAIProvider } from "./openai";
import { OpenRouterProvider } from "./openrouter";

type ProviderFactory = (config: AIProviderConfig) => AIProvider;

const PROVIDER_FACTORIES: Record<string, ProviderFactory> = {
  openai: (config) => new OpenAIProvider(config),
  gemini: (config) => new GeminiProvider(config),
  openrouter: (config) => new OpenRouterProvider(config),
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

/**
 * Resolve the configured chain first, then append any configured providers not
 * explicitly named. This keeps the free-first path resilient when the default
 * provider is unset while an OpenRouter/Gemini key is available.
 */
export function getProviderChain(): AIProvider[] {
  const config = getAIConfig();
  const configuredIds = Object.entries(config.providers)
    .filter(([, provider]) => Boolean(provider.apiKey))
    .map(([id]) => id);
  const ids = [
    config.activeProvider,
    ...config.fallbackProviders.filter((id) => id !== config.activeProvider),
    ...configuredIds,
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
