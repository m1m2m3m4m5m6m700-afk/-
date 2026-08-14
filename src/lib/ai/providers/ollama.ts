import type { AIProviderConfig } from "../config";
import type { AIProvider } from "./types";
import type { AIMessage, AIGenerateOptions, AIGenerateResult, AIErrorKind } from "../types";

interface OllamaResponse {
  message?: { content?: string };
  prompt_eval_count?: number;
  eval_count?: number;
}

const failure = (kind: AIErrorKind, message: string, retryable: boolean): AIGenerateResult => ({
  ok: false,
  kind,
  message,
  retryable,
});

/** Local-only provider. It is useful when Flixo is self-hosted on the same machine as Ollama. */
export class OllamaProvider implements AIProvider {
  readonly id = "ollama";
  private readonly config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  isConfigured(): boolean {
    return Boolean(this.config.baseUrl);
  }

  async generate(messages: AIMessage[], options: AIGenerateOptions = {}): Promise<AIGenerateResult> {
    const model = options.model ?? this.config.defaultModel;
    const timeoutMs = options.timeoutMs ?? 60_000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const abortFromCaller = () => controller.abort();
    if (options.signal) {
      if (options.signal.aborted) controller.abort();
      else options.signal.addEventListener("abort", abortFromCaller, { once: true });
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/api/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          options: {
            ...(options.temperature === undefined ? {} : { temperature: options.temperature }),
            ...(options.maxOutputTokens === undefined ? {} : { num_predict: options.maxOutputTokens }),
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        return failure("provider_error", `Ollama returned an error (status ${response.status}).`, response.status >= 500);
      }

      let parsed: OllamaResponse;
      try {
        parsed = (await response.json()) as OllamaResponse;
      } catch {
        return failure("invalid_output", "Ollama returned an unreadable response.", true);
      }

      const content = parsed.message?.content?.trim();
      if (!content) return failure("invalid_output", "Ollama returned an empty response.", true);

      const promptTokens = parsed.prompt_eval_count;
      const completionTokens = parsed.eval_count;
      return {
        ok: true,
        content,
        provider: this.id,
        model,
        usage:
          promptTokens !== undefined || completionTokens !== undefined
            ? {
                promptTokens,
                completionTokens,
                totalTokens:
                  promptTokens !== undefined && completionTokens !== undefined
                    ? promptTokens + completionTokens
                    : undefined,
              }
            : undefined,
      };
    } catch {
      return failure(
        controller.signal.aborted ? "timeout" : "provider_unreachable",
        controller.signal.aborted
          ? "The local AI request timed out. Please try again."
          : "Could not reach local Ollama. Start Ollama and try again.",
        true,
      );
    } finally {
      clearTimeout(timer);
      options.signal?.removeEventListener("abort", abortFromCaller);
    }
  }
}
