/**
 * Client hook for AI generation.
 *
 * Thin wrapper around the server `generate` RPC. Exposes the states every AI
 * tool UI needs (loading / error / empty / result) plus `retry` and `clear`.
 *
 * This module imports only types and the RPC fetcher — no config, no provider
 * code, no keys. It is safe for the client bundle.
 */

import { useCallback, useRef, useState } from "react";
import { generate } from "./server/generate";
import type { AIGenerateFailure, AIGenerateResult, AITaskId } from "./types";

export interface UseAIGenerationState {
  loading: boolean;
  result: AIGenerateResult | null;
  /** Convenience: the successful content, or empty string. */
  content: string;
  /** Convenience: the latest failure, or null when the last run succeeded. */
  error: AIGenerateFailure | null;
}

export interface UseAIGenerationApi extends UseAIGenerationState {
  /** Submit a generation request. Returns the result (also stored in state). */
  run: (input: string) => Promise<AIGenerateResult | null>;
  /** Re-run the last submitted input. */
  retry: () => Promise<AIGenerateResult | null>;
  /** Clear result + error (keeps last input for retry). */
  clear: () => void;
}

export function useAIGeneration(taskId: AITaskId): UseAIGenerationApi {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIGenerateResult | null>(null);
  const lastInputRef = useRef<string>("");

  const execute = useCallback(
    async (input: string): Promise<AIGenerateResult | null> => {
      const trimmed = input.trim();
      if (!trimmed) {
        const empty: AIGenerateResult = {
          ok: false,
          kind: "unknown",
          message: "Please provide some input to process.",
          retryable: false,
        };
        setResult(empty);
        return empty;
      }

      lastInputRef.current = input;
      setLoading(true);
      try {
        const res = await generate({ data: { taskId, input: trimmed } });
        setResult(res);
        return res;
      } catch {
        // Network/RPC failure reaching the server fn itself.
        const failure: AIGenerateResult = {
          ok: false,
          kind: "provider_unreachable",
          message: "Could not reach the Flixo AI service. Please try again.",
          retryable: true,
        };
        setResult(failure);
        return failure;
      } finally {
        setLoading(false);
      }
    },
    [taskId],
  );

  const retry = useCallback(() => {
    if (!lastInputRef.current) return Promise.resolve(null);
    return execute(lastInputRef.current);
  }, [execute]);

  const clear = useCallback(() => {
    setResult(null);
    setLoading(false);
  }, []);

  const content = result?.ok ? result.content : "";
  const error = result && !result.ok ? result : null;

  return { loading, result, content, error, run: execute, retry, clear };
}
