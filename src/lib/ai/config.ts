/**
 * Server-only AI configuration.
 * Secrets are read from environment variables and never returned to clients.
 */

import type { AITaskId } from "./types";

export type AIProviderId = "openai" | "gemini" | "groq" | "ollama";

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
  providers: Record<AIProviderId, AIProviderConfig>;
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
    { id: "ai-chat", prefix: "FLIXO_AI_AI_CHAT" },
    { id: "code-assistant", prefix: "FLIXO_AI_CODE_ASSISTANT" },
    { id: "research-assistant", prefix: "FLIXO_AI_RESEARCH_ASSISTANT" },
  ];

  for (const { id, prefix } of tasks) {
    const model = readEnv(`${prefix}_MODEL`);
    const maxOutputTokens = readInt(`${prefix}_MAX_TOKENS`, 0) || undefined;
    if (model || maxOutputTokens) overrides[id] = { model, maxOutputTokens };
  }
  return overrides;
}

let cached: AIGlobalConfig | undefined;

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
  const groq: AIProviderConfig = {
    id: "groq",
    apiKey: readEnv("GROQ_API_KEY"),
    defaultModel: readEnv("GROQ_MODEL") ?? "openai/gpt-oss-20b",
    baseUrl: readEnv("GROQ_BASE_URL") ?? "https://api.groq.com/openai/v1",
  };
  const ollama: AIProviderConfig = {
    id: "ollama",
    defaultModel: readEnv("OLLAMA_MODEL") ?? "qwen3:8b",
    baseUrl: readEnv("OLLAMA_BASE_URL") ?? "http://127.0.0.1:11434",
  };

  const providers: Record<AIProviderId, AIProviderConfig> = { openai, gemini, groq, ollama };
  const requested = readEnv("FLIXO_AI_PROVIDER") as AIProviderId | undefined;
  const freeFirst = readEnv("FLIXO_AI_FREE_FIRST") !== "false";
  const preferred: AIProviderId[] = freeFirst
    ? ["ollama", "gemini", "groq", "openai"]
    : [requested ?? "openai", "gemini", "groq", "ollama"];

  const activeProvider =
    requested && preferred.includes(requested)
      ? requested
      : preferred.find((id) => id === "ollama" || Boolean(providers[id].apiKey)) ?? "openai";

  const configuredFree = (["ollama", "gemini", "groq"] as AIProviderId[]).filter(
    (id) => id !== activeProvider && (id === "ollama" || Boolean(providers[id].apiKey)),
  );
  const explicitFallback = readEnv("FLIXO_AI_FALLBACK_PROVIDER") as AIProviderId | undefined;
  const fallbackProviders = explicitFallback && explicitFallback !== activeProvider
    ? [explicitFallback]
    : freeFirst
      ? configuredFree
      : [];

  cached = {
    activeProvider,
    fallbackProviders,
    maxInputChars: readInt("FLIXO_AI_MAX_INPUT_CHARS", 12000),
    defaultMaxOutputTokens: readInt("FLIXO_AI_DEFAULT_MAX_TOKENS", 800),
    defaultTimeoutMs: readInt("FLIXO_AI_TIMEOUT_MS", 30_000),
    taskOverrides: parseTaskOverrides(),
    providers,
  };
  return cached;
}

export function isAIConfigured(): boolean {
  const config = getAIConfig();
  return Boolean(config.providers[config.activeProvider]?.apiKey) || config.activeProvider === "ollama";
}

export function resetAIConfigCache(): void {
  cached = undefined;
}
