/**
 * AI layer public surface.
 *
 * Import paths:
 * - Client code (hooks, tool runtimes): import from "@/lib/ai/useAIGeneration"
 *   and "@/lib/ai/types" only. These are safe for the client bundle.
 * - Server-only code: import config / providers / service / prompts directly
 *   from their modules (never re-exported here, so the client can't pull them
 *   in by accident).
 *
 * See AGENTS.md → "AI layer" for the full architecture.
 */

export type {
  AITaskId,
  AIMessage,
  AIGenerateOptions,
  AIGenerateSuccess,
  AIGenerateFailure,
  AIGenerateResult,
  AIErrorKind,
} from "./types";
