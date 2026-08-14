import type { AIProviderConfig } from "../config";
import type { AIProvider } from "./types";
import type { AIMessage, AIGenerateOptions, AIGenerateResult, AIErrorKind } from "../types";

interface GroqResponse {
  choices?: Array<{ message?: { content?: string } }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
}

const failure = (kind: AIErrorKind, message: string, retryable: boolean): AIGenerateResult => ({
  ok: false,
  kind,
  message,
  retryable,
});

export class GroqProvider implements AIProvider {
  readonly id = "groq";
  private readonly config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  isConfigured(): boolean {
    return Boolean(this.config.apiKey);
  }

  async generate(messages: AIMessage[], options: AIGenerateOptions = {}): Promise<AIGenerateResult> {
    if (!this.isConfigured()) {
      return failure("not_configured", "Groq is not configured. Set GROQ_API_KEY on the server.", false);
    }

    const model = options.model ?? this.config.defaultModel;
    const timeoutMs = options.timeoutMs ?? 30_000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const abortFromCaller = () => controller.abort();
    if (options.signal) {
      if (options.signal.aborted) controller.abort();
      else options.signal.addEventListener("abort", abortFromCaller, { once: true });
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: options.maxOutputTokens,
          temperature: options.temperature,
        }),
        signal: controller.signal,
      });

      if (response.status === 429) {
        return failure("rate_limited", "Groq is temporarily rate-limiting requests. Please retry shortly.", true);
      }
      if (!response.ok) {
        return failure(
          "provider_error",
          `Groq returned an error (status ${response.status}).`,
          response.status >= 500,
        );
      }

      let parsed: GroqResponse;
      try {
        parsed = (await response.json()) as GroqResponse;
      } catch {
        return failure("invalid_output", "Groq returned an unreadable response.", true);
      }

      const content = parsed.choices?.[0]?.message?.content?.trim();
      if (!content) return failure("invalid_output", "Groq returned an empty response.", true);

      return {
        ok: true,
        content,
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
    } catch {
      return failure(
        controller.signal.aborted ? "timeout" : "provider_unreachable",
        controller.signal.aborted
          ? "The Groq request timed out. Please try again."
          : "Could not reach Groq. Check the server connection and try again.",
        true,
      );
    } finally {
      clearTimeout(timer);
      options.signal?.removeEventListener("abort", abortFromCaller);
    }
  }
}
