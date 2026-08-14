/**
 * Server-only AI configuration.
 *
 * Reads everything from environment variables. Never imported by client code —
 * it is only reached transitively through the `createServerFn` handler in
 * `src/lib/ai/rpc/generate.ts`, whose body never ships to the client bundle.
 *
 * Secrets (API keys) are read here and stay in the server process memory. They
 * are never serialized into responses, logs, or the client bundle.
 */

import type { AITaskId } from "./types";

export type AIProviderId = "openai" | "gemini";

export interface AIProviderConfig {
  /** Stable id used by the provider registry. */
  id: AIProviderId;
  /** API key resolved from the environment. Absent when unconfigured. */
  apiKey?: string;
  /** Default model for this provider. */
  defaultModel: string;
  /** Base URL (overridable for proxies / Azure OpenAI / Gemini proxies). */
  baseUrl: string;
}

export interface AIGlobalConfig {
  /** Active provider id. Defaults to "openai"; set FLIXO_AI_PROVIDER=gemini to use Gemini. */
  activeProvider: AIProviderId;
  /** Ordered providers to try when the primary fails (fallback chain). */
  fallbackProviders: Array<AIProviderId>;
  /** Hard ceiling on user input length, in characters. */
  maxInputChars: number;
  /** Default max output tokens when a task does not override it. */
  defaultMaxOutputTokens: number;
  /** Default request timeout in milliseconds. */
  defaultTimeoutMs: number;
  /** Per-task overrides (model + limits). */
  taskOverrides: Partial<Record<AITaskId, { model?: string; maxOutputTokens?: number }>>;
  /** Providers keyed by id (only those with a resolved API key are usable). */
  providers: Record<string, AIProviderConfig>;
}

function readEnv(name: string): string | undefined {
  // process.env is only meaningful on the server. Guard for safety, although
  // this module should never execute in a browser context.
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
  const MODEL_SUFFIX = "_MODEL";
  const TOKENS_SUFFIX = "_MAX_TOKENS";
  // Known task ids → env prefix. Keeps the surface explicit and typed.
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
    const model = readEnv(`${prefix}${MODEL_SUFFIX}`);
    const maxOutputTokens = readInt(`${prefix}${TOKENS_SUFFIX}`, 0) || undefined;
    if (model || maxOutputTokens) {
      overrides[id] = { model, maxOutputTokens };
    }
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
    // gemini-2.5-flash-lite — free-tier eligible. Overridable via GEMINI_MODEL.
    defaultModel: readEnv("GEMINI_MODEL") ?? "gemini-2.5-flash-lite",
    baseUrl: readEnv("GEMINI_BASE_URL") ?? "https://generativelanguage.googleapis.com",
  };

  // Active provider is chosen by FLIXO_AI_PROVIDER. Defaults to "openai" to
  // preserve existing behavior; set to "gemini" to make the chatbot (and the
  // task pipeline) use Gemini Free Tier.
  const providerEnv = readEnv("FLIXO_AI_PROVIDER") ?? "openai";
  const activeProvider: AIProviderId = providerEnv === "gemini" ? "gemini" : "openai";

  // Fallback is DISABLED by default so user content is never silently sent to a
  // second provider. Operators must explicitly set FLIXO_AI_FALLBACK_PROVIDER
  // (e.g. "gemini" or "openai") to enable a single ordered fallback. An empty /
  // unset value means the primary provider's failure is returned as-is.
  const fallbackEnv = readEnv("FLIXO_AI_FALLBACK_PROVIDER");
  let fallbackProviders: Array<AIProviderId> = [];
  if (fallbackEnv === "openai" || fallbackEnv === "gemini") {
    // Never fall back to the same provider that is already primary.
    fallbackProviders = fallbackEnv === activeProvider ? [] : [fallbackEnv];
  }

  cached = {
    activeProvider,
    fallbackProviders,
    maxInputChars: readInt("FLIXO_AI_MAX_INPUT_CHARS", 12000),
    defaultMaxOutputTokens: readInt("FLIXO_AI_DEFAULT_MAX_TOKENS", 800),
    defaultTimeoutMs: readInt("FLIXO_AI_TIMEOUT_MS", 30_000),
    taskOverrides: parseTaskOverrides(),
    providers: { openai, gemini },
  };
  return cached;
}

/** True when at least the active provider has a usable API key. */
export function isAIConfigured(): boolean {
  const config = getAIConfig();
  const active = config.providers[config.activeProvider];
  return Boolean(active?.apiKey);
}

/** Reset the cached config. Intended for tests / local hot reload only. */
export function resetAIConfigCache(): void {
  cached = undefined;
}
