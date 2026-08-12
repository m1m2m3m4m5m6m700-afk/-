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
import type { AITaskId } from "../types";

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
});

/**
 * Generate AI content for a tool task.
 *
 * Usage from the client:
 *   const { result } = await generate({ data: { taskId: "summarizer", input: "..." } });
 */
export const generate = createServerFn({ method: "POST" })
  .validator(generateInput)
  .handler(async ({ data }) => {
    const result = await aiService.generate(data.taskId, data.input);
    // createServerFn returns the handler value directly to the client fetcher,
    // so `result` here is exactly what the client receives.
    return result;
  });
