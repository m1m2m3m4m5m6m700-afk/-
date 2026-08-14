/**
 * Server-side AI generation endpoint.
 *
 * Exposed to the client as a typed RPC via `createServerFn`. The handler body
 * runs only on the server — the client receives a thin fetcher stub, so no
 * provider logic, config, or API keys ever enter the client bundle.
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
  "ai-chat",
  "code-assistant",
  "research-assistant",
] as const satisfies AITaskId[];

const generateInput = z.object({
  taskId: z.enum(TASK_IDS),
  input: z.string().max(getAIConfig().maxInputChars, "Input exceeds the maximum allowed length."),
  csrfToken: z.string().max(500).optional(),
});

export const generate = createServerFn({ method: "POST" })
  .validator(generateInput)
  .middleware([securityRequestMiddleware])
  .handler(async ({ context, data }): Promise<AIGenerateResult> => {
    if (!verifyCsrf(context.csrfCookie, data.csrfToken ?? null)) {
      return {
        ok: false,
        kind: "unknown",
        message: "Invalid CSRF token. Please refresh and try again.",
        retryable: false,
      };
    }

    const rl = rateLimit(`ai:${context.clientIp ?? "anon"}`, RATE_PRESETS.ai);
    if (!rl.allowed) {
      return {
        ok: false,
        kind: "rate_limited",
        message: "Too many AI requests. Please slow down and try again shortly.",
        retryable: true,
      };
    }

    return aiService.generate(data.taskId, data.input);
  });
