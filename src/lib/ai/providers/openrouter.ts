/**
 * OpenRouter provider — OpenAI-compatible chat completions via fetch.
 *
 * Server-only. Supports the configured free model fleet, including
 * `openrouter/free`, without exposing provider credentials to the client.
 */

import type { AIProviderConfig } from "../config";
import type { AIProvider } from "./types";
import type { AIMessage, AIGenerateOptions, AIGenerateResult, AIErrorKind } from "../types";

interface OpenRouterResponseBody {
  choices?: Array<{ message?: { content?: string | Array<{ text?: string }> } }>;
  model?: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  error?: { message?: string; code?: number };
}

type OpenRouterContent = string | Array<{ text?: string }> | undefined;

function toFailure(kind: AIErrorKind, message: string, retryable: boolean): AIGenerateResult {
  return { ok: false, kind, message, retryable };
}

function withTimeout(
  timeoutMs: number,
  external?: AbortSignal,
): { signal: AbortSignal; cleanup: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  if (external) {
    if (external.aborted) controller.abort();
    else external.addEventListener("abort", () => controller.abort(), { once: true });
  }
  return { signal: controller.signal, cleanup: () => clearTimeout(timer) };
}

function extractText(content: OpenRouterContent): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content.map((part) => part.text ?? "").join("");
}

export class OpenRouterProvider implements AIProvider {
  readonly id = "openrouter";
  private readonly config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  isConfigured(): boolean {
    return Boolean(this.config.apiKey);
  }

  async generate(
    messages: AIMessage[],
    options: AIGenerateOptions = {},
  ): Promise<AIGenerateResult> {
    if (!this.isConfigured()) {
      return toFailure(
        "not_configured",
        "OpenRouter is not configured. Set OPENROUTER_API_KEY on the server.",
        false,
      );
    }

    const model = options.model ?? this.config.defaultModel;
    const timeoutMs = options.timeoutMs ?? 30_000;
    const { signal, cleanup } = withTimeout(timeoutMs, options.signal);

    const body = {
      model,
      messages,
      max_tokens: options.maxOutputTokens,
      temperature: options.temperature,
    };

    let response: Response;
    try {
      response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${this.config.apiKey}`,
          "http-referer": "https://flixoai.vercel.app",
          "x-title": "Flixo",
        },
        body: JSON.stringify(body),
        signal,
      });
    } catch (error) {
      cleanup();
      if (signal.aborted) {
        return toFailure("timeout", "The AI request timed out. Please try again.", true);
      }
      void error;
      return toFailure(
        "provider_unreachable",
        "Could not reach the AI provider. Check your connection and try again.",
        true,
      );
    } finally {
      cleanup();
    }

    if (response.status === 429) {
      return toFailure(
        "rate_limited",
        "The free AI provider is rate-limiting requests. Please try again shortly.",
        true,
      );
    }

    if (!response.ok) {
      let retryable = response.status >= 500;
      try {
        const errorBody = (await response.clone().json()) as OpenRouterResponseBody;
        const message = errorBody.error?.message ?? "";
        retryable = retryable || /rate|quota|temporar|unavailable|timeout/i.test(message);
      } catch {
        // Keep status-based retryability.
      }
      return toFailure(
        retryable ? "provider_unreachable" : "provider_error",
        retryable
          ? "The free AI provider is temporarily unavailable. Please try again."
          : `The AI provider returned an error (status ${response.status}).`,
        retryable,
      );
    }

    let parsed: OpenRouterResponseBody;
    try {
      parsed = (await response.json()) as OpenRouterResponseBody;
    } catch {
      return toFailure("invalid_output", "The AI provider returned an unreadable response.", true);
    }

    const content = extractText(parsed.choices?.[0]?.message?.content).trim();
    if (!content) {
      return toFailure("invalid_output", "The AI provider returned an empty response.", true);
    }

    return {
      ok: true,
      content,
      provider: this.id,
      model: parsed.model ?? model,
      usage: parsed.usage
        ? {
            promptTokens: parsed.usage.prompt_tokens,
            completionTokens: parsed.usage.completion_tokens,
            totalTokens: parsed.usage.total_tokens,
          }
        : undefined,
    };
  }
}
