/**
 * Unified AI service.
 *
 * Single entry point every AI tool calls: `aiService.generate(taskId, input)`.
 *
 * Responsibilities:
 * - resolve the task prompt + per-task model/limits from config,
 * - enforce cost control (max input chars, max output tokens, timeout),
 * - validate / sanitize input before it reaches a provider,
 * - pick the configured provider and fall back ONLY through an explicitly
 *   configured fallback (never silently to a second provider),
 * - map any uncaught error to a safe `AIGenerateResult` failure.
 *
 * Security: this module never logs API keys or user content. Errors surfaced
 * to callers are generic and contain no upstream response bodies.
 *
 * Rate limiting is enforced at the RPC layer (src/lib/ai/rpc/generate.ts) via
 * the shared per-IP token-bucket limiter, BEFORE this service is reached, so
 * an over-limit client never incurs an upstream provider call.
 */

import { getAIConfig, isAIConfigured } from "./config";
import { emitInternalDiagnosticEvent, createInternalDiagnosticEvent } from "./diagnostics/internalDiagnosticEvent";
import { getProviderChain } from "./providers";
import type { AIProvider } from "./providers/types";
import { getTaskPrompt } from "./prompts";
import { buildAIOrchestrationContext } from "./orchestration/context";
import type {
  AITaskId,
  AIGenerateOptions,
  AIGenerateResult,
  AIErrorKind,
  AIMessage,
} from "./types";

function sanitizeInput(input: string): string {
  const nul = String.fromCharCode(0);
  return input
    .split(nul)
    .join("")
    .replace(/\r/g, "")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function fail(kind: AIErrorKind, message: string, retryable: boolean): AIGenerateResult {
  return { ok: false, kind, message, retryable };
}

function withOptionalToolContext(systemPrompt: string, taskId: AITaskId, input: string): string {
  if (process.env.FLIXO_AI_TOOL_CONTEXT !== "1") return systemPrompt;

  const context = buildAIOrchestrationContext(taskId, input);
  if (context.candidateTools.length === 0) return systemPrompt;

  const toolLines = context.candidateTools
    .map((tool) => `- ${tool.name} (${tool.slug}): ${tool.description}`)
    .join("\n");

  return [
    systemPrompt,
    "",
    "Canonical FLIXO tool context (read-only; advisory only):",
    toolLines,
    "Do not invoke tools, modify data, or apply changes based on this context.",
  ].join("\n");
}

class AIService {
  generate(
    taskId: AITaskId,
    rawInput: string,
    callerOptions?: AIGenerateOptions,
  ): Promise<AIGenerateResult> {
    return this.doGenerate(taskId, rawInput, callerOptions);
  }

  private async doGenerate(
    taskId: AITaskId,
    rawInput: string,
    callerOptions?: AIGenerateOptions,
  ): Promise<AIGenerateResult> {
    const config = getAIConfig();

    if (!isAIConfigured()) {
      return fail(
        "not_configured",
        "AI is not configured on this server. Ask the site admin to set an AI provider API key.",
        false,
      );
    }

    const input = sanitizeInput(rawInput);
    if (input.length === 0) {
      return fail("unknown", "Please provide some input to process.", false);
    }
    if (input.length > config.maxInputChars) {
      return fail(
        "input_too_long",
        `Input is too long (max ${config.maxInputChars.toLocaleString()} characters).`,
        false,
      );
    }

    const prompt = getTaskPrompt(taskId);
    const systemPrompt = withOptionalToolContext(prompt.system, taskId, input);
    const override = config.taskOverrides[taskId];
    const messages: AIMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt.buildUserPrompt(input) },
    ];

    const options: AIGenerateOptions = {
      maxOutputTokens: override?.maxOutputTokens ?? prompt.defaultMaxOutputTokens,
      timeoutMs: config.defaultTimeoutMs,
      ...callerOptions,
      model: callerOptions?.model ?? override?.model,
    };

    const chain = getProviderChain();
    if (chain.length === 0) {
      return fail("not_configured", "No AI provider is available.", false);
    }

    let lastFailure: AIGenerateResult = fail(
      "unknown",
      "AI generation failed for an unknown reason.",
      false,
    );

    for (let i = 0; i < chain.length; i += 1) {
      const provider: AIProvider = chain[i];
      if (!provider.isConfigured()) continue;

      const result = await provider.generate(messages, options);
      if (result.ok) return result;
      lastFailure = result;

      emitInternalDiagnosticEvent(
        createInternalDiagnosticEvent({
          occurredAt: new Date().toISOString(),
          taskId,
          layer: "provider",
          provider: provider.id,
          model: options.model ?? config.providers[provider.id]?.defaultModel,
          errorKind: result.kind,
          retryable: result.retryable,
          attempt: i + 1,
          metadata: {
            toolContextEnabled: process.env.FLIXO_AI_TOOL_CONTEXT === "1",
            inputLength: input.length,
          },
        }),
      );

      if (!result.retryable || i === chain.length - 1) break;
    }

    return lastFailure;
  }
}

export const aiService = new AIService();
