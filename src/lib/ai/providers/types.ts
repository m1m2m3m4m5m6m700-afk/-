/**
 * Provider interface — the contract every AI backend must implement.
 *
 * Tools and the AI service never talk to OpenAI / Gemini / Anthropic directly.
 * They call `AIProvider.generate(...)`. Adding a new provider later means
 * implementing this interface and registering it in `./index.ts` — no tool
 * code changes required.
 */

import type { AIMessage, AIGenerateOptions, AIGenerateResult } from "../types";

export interface AIProvider {
  /** Stable id (e.g. "openai"). */
  readonly id: string;
  /** True when the provider has the credentials it needs to run. */
  isConfigured(): boolean;
  /**
   * Run a chat completion.
   *
   * Implementations MUST:
   * - honor `options.timeoutMs` / `options.signal` and abort cleanly,
   * - map upstream errors onto the `AIGenerateResult` failure variants
   *   (timeout / rate_limited / provider_error / provider_unreachable),
   * - never include API keys or raw upstream response bodies in the result,
   * - never log secrets or user-supplied message content.
   */
  generate(messages: AIMessage[], options?: AIGenerateOptions): Promise<AIGenerateResult>;
}
