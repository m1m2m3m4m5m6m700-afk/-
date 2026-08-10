/**
 * OpenAI provider — chat completions via fetch.
 *
 * Server-only. Uses the global `fetch` (available in the nitro node-server
 * runtime). No SDK dependency, so the client bundle never grows and there is
 * no third-party code path to audit.
 *
 * Security:
 * - The API key is read from config and sent only to OpenAI's endpoint as a
 *   Bearer token. It is never returned, logged, or serialized.
 * - User message content is sent to OpenAI but never logged here.
 * - Errors are mapped to safe, generic messages before leaving this module.
 */

import type { AIProviderConfig } from "../config";
import type { AIProvider } from "./types";
import type { AIMessage, AIGenerateOptions, AIGenerateResult, AIErrorKind } from "../types";

interface OpenAIChoice {
  message?: { content?: string };
}
interface OpenAIUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}
interface OpenAIResponseBody {
  choices?: OpenAIChoice[];
  usage?: OpenAIUsage;
  error?: { message?: string; type?: string; code?: string };
}

function toFailure(kind: AIErrorKind, message: string, retryable: boolean): AIGenerateResult {
  return { ok: false, kind, message, retryable };
}

/** Compose the caller's signal with an internal timeout abort. */
function withTimeout(
  timeoutMs: number,
  external?: AbortSignal,
): {
  signal: AbortSignal;
  cleanup: () => void;
} {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  if (external) {
    if (external.aborted) controller.abort();
    else external.addEventListener("abort", () => controller.abort(), { once: true });
  }
  return { signal: controller.signal, cleanup: () => clearTimeout(timer) };
}

export class OpenAIProvider implements AIProvider {
  readonly id = "openai";
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
        "OpenAI is not configured. Set OPENAI_API_KEY on the server.",
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
        },
        body: JSON.stringify(body),
        signal,
      });
    } catch (error) {
      cleanup();
      if (signal.aborted) {
        return toFailure("timeout", "The AI request timed out. Please try again.", true);
      }
      // Network / DNS / connection refused — never echo the raw error message.
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
        "The AI provider is rate-limiting requests. Please wait a moment and retry.",
        true,
      );
    }

    if (!response.ok) {
      // Inspect the body for a more precise kind, but never forward the raw
      // upstream message to the client.
      let kind: AIErrorKind = "provider_error";
      try {
        const errorBody = (await response.clone().json()) as OpenAIResponseBody;
        if (errorBody.error?.type === "insufficient_quota") kind = "rate_limited";
      } catch {
        // Non-JSON error body — keep the generic kind.
      }
      const retryable = kind === "rate_limited" || response.status >= 500;
      return toFailure(
        kind,
        `The AI provider returned an error (status ${response.status}).`,
        retryable,
      );
    }

    let parsed: OpenAIResponseBody;
    try {
      parsed = (await response.json()) as OpenAIResponseBody;
    } catch {
      return toFailure("invalid_output", "The AI provider returned an unreadable response.", true);
    }

    const content = parsed.choices?.[0]?.message?.content;
    if (!content || content.trim().length === 0) {
      return toFailure("invalid_output", "The AI provider returned an empty response.", true);
    }

    return {
      ok: true,
      content: content.trim(),
      provider: this.id,
      model,
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
