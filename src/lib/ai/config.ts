/**
 * Server-only AI configuration.
 *
 * Reads everything from environment variables. Never imported by client code —
 * it is only reached transitively through the `createServerFn` handler in
 * `src/lib/ai/server/generate.ts`, whose body never ships to the client bundle.
 *
 * Secrets (API keys) are read here and stay in the server process memory. They
 * are never serialized into responses, logs, or the client bundle.
 */

import type { AITaskId } from "./types";

export interface AIProviderConfig {
  /** Stable id used by the provider registry. */
  id: "openai";
  /** API key resolved from the environment. Absent when unconfigured. */
  apiKey?: string;
  /** Default model for this provider. */
  defaultModel: string;
  /** Base URL (overridable for proxies / Azure OpenAI). */
  baseUrl: string;
}

export interface AIGlobalConfig {
  /** Active provider id. Falls back to "openai". */
  activeProvider: "openai";
  /** Ordered providers to try when the primary fails (fallback chain). */
  fallbackProviders: Array<AIProviderConfig["id"]>;
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

  cached = {
    activeProvider: "openai",
    fallbackProviders: ["openai"],
    maxInputChars: readInt("FLIXO_AI_MAX_INPUT_CHARS", 12000),
    defaultMaxOutputTokens: readInt("FLIXO_AI_DEFAULT_MAX_TOKENS", 800),
    defaultTimeoutMs: readInt("FLIXO_AI_TIMEOUT_MS", 30_000),
    taskOverrides: parseTaskOverrides(),
    providers: { openai },
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
