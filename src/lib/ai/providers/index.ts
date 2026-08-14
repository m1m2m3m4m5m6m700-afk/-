import { getAIConfig, type AIProviderConfig } from "../config";
import type { AIProvider } from "./types";
import { OpenAIProvider } from "./openai";
import { GeminiProvider } from "./gemini";
import { GroqProvider } from "./groq";
import { OllamaProvider } from "./ollama";

type ProviderFactory = (config: AIProviderConfig) => AIProvider;

const PROVIDER_FACTORIES: Record<string, ProviderFactory> = {
  openai: (config) => new OpenAIProvider(config),
  gemini: (config) => new GeminiProvider(config),
  groq: (config) => new GroqProvider(config),
  ollama: (config) => new OllamaProvider(config),
};

const instances = new Map<string, AIProvider>();

export function getProvider(id: string): AIProvider | undefined {
  const cached = instances.get(id);
  if (cached) return cached;
  const config = getAIConfig().providers[id as keyof ReturnType<typeof getAIConfig>['providers']];
  if (!config) return undefined;
  const factory = PROVIDER_FACTORIES[id];
  if (!factory) return undefined;
  const instance = factory(config);
  instances.set(id, instance);
  return instance;
}

export function getProviderChain(): AIProvider[] {
  const config = getAIConfig();
  const ids = [config.activeProvider, ...config.fallbackProviders.filter((id) => id !== config.activeProvider)];
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
