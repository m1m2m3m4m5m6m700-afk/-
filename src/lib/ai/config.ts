/**
 * Server-only AI configuration.
 *
 * Secrets are read only on the server and never serialized into client output.
 */

import type { AITaskId } from "./types";

export type AIProviderId = "openai" | "gemini" | "openrouter";

export interface AIProviderConfig {
  id: AIProviderId;
  apiKey?: string;
  defaultModel: string;
  baseUrl: string;
}

export interface AIGlobalConfig {
  activeProvider: AIProviderId;
  fallbackProviders: Array<AIProviderId>;
  maxInputChars: number;
  defaultMaxOutputTokens: number;
  defaultTimeoutMs: number;
  taskOverrides: Partial<Record<AITaskId, { model?: string; maxOutputTokens?: number }>>;
  providers: Record<string, AIProviderConfig>;
}

function readEnv(name: string): string | undefined {
  if (typeof process === "undefined") return undefined;
  const value = process.env?.[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function readInt(name: string, fallback: number): number {
  const raw = readEnv(name);
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseTaskOverrides(): AIGlobalConfig["taskOverrides"] {
  const overrides: AIGlobalConfig["taskOverrides"] = {};
  const tasks: Array<{ id: AITaskId; prefix: string }> = [
    { id: "ai-writer", prefix: "FLIXO_AI_AI_WRITER" },
    { id: "article-generator", prefix: "FLIXO_AI_ARTICLE_GENERATOR" },
    { id: "blog-generator", prefix: "FLIXO_AI_BLOG_GENERATOR" },
    { id: "summarizer", prefix: "FLIXO_AI_SUMMARIZER" },
    { id: "rewrite-text", prefix: "FLIXO_AI_REWRITE_TEXT" },
    { id: "grammar-checker", prefix: "FLIXO_AI_GRAMMAR_CHECKER" },
    { id: "translator", prefix: "FLIXO_AI_TRANSLATOR" },
  ];

  for (const { id, prefix } of tasks) {
    const model = readEnv(`${prefix}_MODEL`);
    const maxOutputTokens = readInt(`${prefix}_MAX_TOKENS`, 0) || undefined;
    if (model || maxOutputTokens) overrides[id] = { model, maxOutputTokens };
  }
  return overrides;
}

let cached: AIGlobalConfig | undefined;

/** Resolve and cache the AI config. Server-only. */
export function getAIConfig(): AIGlobalConfig {
  if (cached) return cached;

  const openai: AIProviderConfig = {
    id: "openai",
    apiKey: readEnv("OPENAI_API_KEY"),
    defaultModel: readEnv("OPENAI_MODEL") ?? "gpt-4o-mini",
    baseUrl: readEnv("OPENAI_BASE_URL") ?? "https://api.openai.com/v1",
  };

  const gemini: AIProviderConfig = {
    id: "gemini",
    apiKey: readEnv("GEMINI_API_KEY"),
    defaultModel: readEnv("GEMINI_MODEL") ?? "gemini-2.5-flash-lite",
    baseUrl: readEnv("GEMINI_BASE_URL") ?? "https://generativelanguage.googleapis.com",
  };

  const openrouter: AIProviderConfig = {
    id: "openrouter",
    apiKey: readEnv("OPENROUTER_API_KEY"),
    defaultModel: readEnv("OPENROUTER_FREE_MODEL") ?? "openrouter/free",
    baseUrl: readEnv("OPENROUTER_BASE_URL") ?? "https://openrouter.ai/api/v1",
  };

  const providerEnv = readEnv("FLIXO_AI_PROVIDER") ?? "openai";
  const activeProvider: AIProviderId =
    providerEnv === "gemini" || providerEnv === "openrouter" ? providerEnv : "openai";

  const fallbackEnv = readEnv("FLIXO_AI_FALLBACK_PROVIDER");
  let fallbackProviders: Array<AIProviderId> = [];
  if (fallbackEnv === "openai" || fallbackEnv === "gemini" || fallbackEnv === "openrouter") {
    fallbackProviders = fallbackEnv === activeProvider ? [] : [fallbackEnv];
  }

  cached = {
    activeProvider,
    fallbackProviders,
    maxInputChars: readInt("FLIXO_AI_MAX_INPUT_CHARS", 12000),
    defaultMaxOutputTokens: readInt("FLIXO_AI_DEFAULT_MAX_TOKENS", 800),
    defaultTimeoutMs: readInt("FLIXO_AI_TIMEOUT_MS", 30_000),
    taskOverrides: parseTaskOverrides(),
    providers: { openai, gemini, openrouter },
  };
  return cached;
}

/**
 * AI is available whenever at least one supported provider has credentials.
 * The provider registry decides the execution order, so an unset default
 * provider no longer masks an available OpenRouter/Gemini fallback.
 */
export function isAIConfigured(): boolean {
  const config = getAIConfig();
  return Object.values(config.providers).some((provider) => Boolean(provider.apiKey));
}

export function resetAIConfigCache(): void {
  cached = undefined;
}
