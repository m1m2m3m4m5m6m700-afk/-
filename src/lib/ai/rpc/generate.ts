/**
 * Server-side AI generation endpoint.
 *
 * Exposed to the client as a typed RPC via `createServerFn`. The handler body
 * runs only on the server — the client receives a thin fetcher stub, so no
 * provider logic, config, or API keys ever enter the client bundle.
 *
 * Flow:
 *   client (useAIGeneration) → generate() RPC → aiService.generate()
 *     → provider (OpenAI) → safe AIGenerateResult → client
 *
 * Input is validated with zod. The handler returns a discriminated result that
 * the client maps onto loading / error / success UI states.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { aiService } from "../aiService";
import { getAIConfig } from "../config";
import { rateLimit, RATE_PRESETS, verifyCsrf } from "../../server/security/csrf";
import { securityRequestMiddleware } from "../../security/requestMiddleware";
import type { AIGenerateResult, AITaskId } from "../types";

const TASK_IDS = [
  "ai-writer",
  "article-generator",
  "blog-generator",
  "summarizer",
  "rewrite-text",
  "grammar-checker",
  "translator",
] as const satisfies AITaskId[];

const generateInput = z.object({
  taskId: z.enum(TASK_IDS),
  input: z.string().max(getAIConfig().maxInputChars, "Input exceeds the maximum allowed length."),
  csrfToken: z.string().max(500).optional(),
});

/**
 * Generate AI content for a tool task.
 *
 * Protected by the security request middleware (CSRF cookie + client IP),
 * double-submit CSRF verification, and a per-IP token-bucket rate limit. The
 * rate limit runs BEFORE any provider call, so an over-limit client never
 * incurs upstream cost.
 *
 * Usage from the client:
 *   const { result } = await generate({ data: { taskId: "summarizer", input: "..." } });
 */
export const generate = createServerFn({ method: "POST" })
  .validator(generateInput)
  .middleware([securityRequestMiddleware])
  .handler(async ({ context, data }): Promise<AIGenerateResult> => {
    // CSRF: same double-submit pattern as the contact/inbox RPCs.
    if (!verifyCsrf(context.csrfCookie, data.csrfToken ?? null)) {
      return {
        ok: false,
        kind: "unknown",
        message: "Invalid CSRF token. Please refresh and try again.",
        retryable: false,
      };
    }
    // Per-IP rate limit (server-only, no provider call when exceeded).
    const rl = rateLimit(`ai:${context.clientIp ?? "anon"}`, RATE_PRESETS.ai);
    if (!rl.allowed) {
      return {
        ok: false,
        kind: "rate_limited",
        message: "Too many AI requests. Please slow down and try again shortly.",
        retryable: true,
      };
    }
    const result = await aiService.generate(data.taskId, data.input);
    // createServerFn returns the handler value directly to the client fetcher,
    // so `result` here is exactly what the client receives.
    return result;
  });
