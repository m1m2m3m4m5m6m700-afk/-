/**
 * Shared AI layer types.
 *
 * These types are safe to import from both client and server code — they carry
 * no runtime logic and no secrets. The actual provider implementations, config,
 * and the unified AI service live in server-only modules reached transitively
 * through the `createServerFn` RPC in `src/lib/ai/server/generate.ts`.
 */

/** Identifiers for AI-powered tool tasks. Each maps to a prompt template. */
export type AITaskId =
  | "ai-writer"
  | "article-generator"
  | "blog-generator"
  | "summarizer"
  | "rewrite-text"
  | "grammar-checker"
  | "translator";

/** A single chat message sent to a provider. */
export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** Per-request generation options (cost control + behavior). */
export interface AIGenerateOptions {
  /** Maximum tokens the provider may generate. */
  maxOutputTokens?: number;
  /** Sampling temperature (0–2). Defaults to provider default. */
  temperature?: number;
  /** Hard request timeout in milliseconds. */
  timeoutMs?: number;
  /** Override the model id for this call. */
  model?: string;
  /** Abort signal (composed with the internal timeout). */
  signal?: AbortSignal;
}

/** Successful generation result. */
export interface AIGenerateSuccess {
  ok: true;
  content: string;
  /** Provider that produced the result (for observability). */
  provider: string;
  model: string;
  /** Best-effort token usage when the provider reports it. */
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

/** Machine-readable failure categories surfaced to the client. */
export type AIErrorKind =
  | "not_configured"
  | "input_too_long"
  | "provider_unreachable"
  | "provider_error"
  | "rate_limited"
  | "timeout"
  | "invalid_output"
  | "unknown";

/** Failed generation result. Never carries secrets or raw upstream payloads. */
export interface AIGenerateFailure {
  ok: false;
  kind: AIErrorKind;
  /** Human-facing, safe message (English — surfaced via i18n later). */
  message: string;
  /** Whether retrying the same request could plausibly succeed. */
  retryable: boolean;
}

export type AIGenerateResult = AIGenerateSuccess | AIGenerateFailure;
