/**
 * Gemini provider — generateContent via fetch.
 *
 * Server-only. Uses the global `fetch` (available in the nitro node-server
 * runtime). No SDK dependency, so the client bundle never grows and there is
 * no third-party code path to audit.
 *
 * Security:
 * - The API key is read from config and sent only to Google's endpoint (as a
 *   `?key=` query param, per the Generative Language REST API). It is never
 *   returned, logged, or serialized into responses.
 * - User message content is sent to Google but never logged here.
 * - Errors are mapped to safe, generic messages before leaving this module.
 *
 * Gemini REST API (v1beta):
 *   POST {baseUrl}/v1beta/models/{model}:generateContent?key={apiKey}
 *
 * For streaming chat (the Flixo chatbot), see `src/lib/ai/chat/handler.ts`
 * (the `POST /api/chat` server-only handler), which calls
 * `:streamGenerateContent` directly. This provider implements the
 * `AIProvider` interface used by the non-streaming task pipeline.
 */

import type { AIProviderConfig } from "../config";
import type { AIProvider } from "./types";
import type { AIMessage, AIGenerateOptions, AIGenerateResult, AIErrorKind } from "../types";

interface GeminiPart {
  text?: string;
}
interface GeminiContent {
  role?: "user" | "model";
  parts?: GeminiPart[];
}
interface GeminiCandidate {
  content?: GeminiContent;
  finishReason?: string;
}
interface GeminiUsageMetadata {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
}
interface GeminiResponseBody {
  candidates?: GeminiCandidate[];
  usageMetadata?: GeminiUsageMetadata;
  error?: { message?: string; status?: string; code?: number };
}

function toFailure(kind: AIErrorKind, message: string, retryable: boolean): AIGenerateResult {
  return { ok: false, kind, message, retryable };
}

/** Map Gemini's OpenAI-shaped roles to Gemini's `user`/`model` roles. */
function toGeminiRole(role: AIMessage["role"]): "user" | "model" {
  return role === "assistant" ? "model" : "user";
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

export class GeminiProvider implements AIProvider {
  readonly id = "gemini";
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
        "Gemini is not configured. Set GEMINI_API_KEY on the server.",
        false,
      );
    }

    const model = options.model ?? this.config.defaultModel;
    const timeoutMs = options.timeoutMs ?? 30_000;
    const { signal, cleanup } = withTimeout(timeoutMs, options.signal);

    // Gemini separates the system instruction from the conversation history.
    const systemMessages = messages.filter((m) => m.role === "system");
    const conversation = messages.filter((m) => m.role !== "system");
    const systemInstruction: GeminiContent | undefined = systemMessages.length
      ? { parts: [{ text: systemMessages.map((m) => m.content).join("\n\n") }] }
      : undefined;

    const contents: GeminiContent[] = conversation.map((m) => ({
      role: toGeminiRole(m.role),
      parts: [{ text: m.content }],
    }));

    const body: Record<string, unknown> = {
      contents,
      ...(systemInstruction ? { systemInstruction } : {}),
      generationConfig: {
        ...(options.maxOutputTokens ? { maxOutputTokens: options.maxOutputTokens } : {}),
        ...(typeof options.temperature === "number" ? { temperature: options.temperature } : {}),
      },
    };

    const url =
      `${this.config.baseUrl}/v1beta/models/${encodeURIComponent(model)}:generateContent` +
      `?key=${encodeURIComponent(this.config.apiKey as string)}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
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

    const mapped = this.mapErrorStatus(response.status);
    if (mapped) return mapped;

    let parsed: GeminiResponseBody;
    try {
      parsed = (await response.json()) as GeminiResponseBody;
    } catch {
      return toFailure("invalid_output", "The AI provider returned an unreadable response.", true);
    }

    if (parsed.error) {
      return this.mapGeminiError(parsed.error);
    }

    const content = parsed.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? "")
      .join("")
      .trim();
    if (!content) {
      return toFailure("invalid_output", "The AI provider returned an empty response.", true);
    }

    return {
      ok: true,
      content,
      provider: this.id,
      model,
      usage: parsed.usageMetadata
        ? {
            promptTokens: parsed.usageMetadata.promptTokenCount,
            completionTokens: parsed.usageMetadata.candidatesTokenCount,
            totalTokens: parsed.usageMetadata.totalTokenCount,
          }
        : undefined,
    };
  }

  /** Map an HTTP status to a safe failure, or null when the status is OK. */
  private mapErrorStatus(status: number): AIGenerateResult | null {
    if (status === 429) {
      return toFailure(
        "rate_limited",
        "The free-tier quota for the AI provider has been exhausted or rate-limited. Please try again later.",
        true,
      );
    }
    if (status === 403) {
      // 403 from Gemini often means the free-tier quota is used up or the key
      // lacks access — surface it as rate_limited so the UI can show a clear
      // "free quota exhausted" message.
      return toFailure(
        "rate_limited",
        "The free-tier quota for the AI provider has been exhausted or the API key lacks access.",
        true,
      );
    }
    if (status === 401) {
      return toFailure(
        "provider_error",
        "The AI provider rejected the API key. Ask the site admin to check GEMINI_API_KEY.",
        false,
      );
    }
    if (status >= 500) {
      return toFailure(
        "provider_unreachable",
        "The AI provider is temporarily unavailable. Please try again.",
        true,
      );
    }
    if (status >= 400) {
      return toFailure(
        "provider_error",
        `The AI provider returned an error (status ${status}).`,
        false,
      );
    }
    return null;
  }

  private mapGeminiError(error: GeminiResponseBody["error"]): AIGenerateResult {
    const status = error?.status ?? "";
    const message = error?.message ?? "";
    // RESOURCE_EXHAUSTED = free-tier quota used up.
    if (status === "RESOURCE_EXHAUSTED" || /quota|rate/i.test(message)) {
      return toFailure(
        "rate_limited",
        "The free-tier quota for the AI provider has been exhausted. Please try again later.",
        true,
      );
    }
    return toFailure(
      "provider_error",
      "The AI provider returned an error while generating a response.",
      false,
    );
  }
}
