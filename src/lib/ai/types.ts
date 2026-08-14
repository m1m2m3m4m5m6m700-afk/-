/** Shared AI-layer types. Safe for client imports; contains no secrets. */

export type AITaskId =
  | "ai-writer"
  | "article-generator"
  | "blog-generator"
  | "summarizer"
  | "rewrite-text"
  | "grammar-checker"
  | "translator"
  | "ai-chat"
  | "code-assistant"
  | "research-assistant";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIGenerateOptions {
  maxOutputTokens?: number;
  temperature?: number;
  timeoutMs?: number;
  model?: string;
  signal?: AbortSignal;
}

export interface AIGenerateSuccess {
  ok: true;
  content: string;
  provider: string;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export type AIErrorKind =
  | "not_configured"
  | "input_too_long"
  | "provider_unreachable"
  | "provider_error"
  | "rate_limited"
  | "timeout"
  | "invalid_output"
  | "unknown";

export interface AIGenerateFailure {
  ok: false;
  kind: AIErrorKind;
  message: string;
  retryable: boolean;
}

export type AIGenerateResult = AIGenerateSuccess | AIGenerateFailure;
