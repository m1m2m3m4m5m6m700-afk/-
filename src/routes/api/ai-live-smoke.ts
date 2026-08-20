import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "node:crypto";

import { aiService } from "@/lib/ai/aiService";
import type { AITaskId } from "@/lib/ai/types";

const DEFAULT_TASK: AITaskId = "ai-writer";
const MAX_PROMPT_CHARS = 8_000;
const MAX_BODY_CHARS = 16_000;
const REQUIRED_TOKEN_ENV = "FLIXO_AI_SMOKE_TOKEN";
const RATE_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 60;

let windowStartedAt = 0;
let windowRequests = 0;

function constantTimeEquals(expected: string, received: string): boolean {
  const left = Buffer.from(expected, "utf8");
  const right = Buffer.from(received, "utf8");
  return left.length === right.length && timingSafeEqual(left, right);
}

function unauthorized(): Response {
  return Response.json({ error: "Unauthorized." }, { status: 401, headers: { "cache-control": "no-store" } });
}

function rateLimited(): Response {
  return Response.json(
    { error: "Smoke endpoint rate limit exceeded." },
    { status: 429, headers: { "cache-control": "no-store", "retry-after": "60" } },
  );
}

function consumeRateLimit(): boolean {
  const now = Date.now();
  if (now - windowStartedAt >= RATE_WINDOW_MS) {
    windowStartedAt = now;
    windowRequests = 0;
  }
  windowRequests += 1;
  return windowRequests <= MAX_REQUESTS_PER_WINDOW;
}

function isTaskId(value: unknown): value is AITaskId {
  return value === "ai-writer" || value === "article-generator" || value === "blog-generator" || value === "summarizer" || value === "rewrite-text" || value === "grammar-checker" || value === "translator";
}

export const Route = createFileRoute("/api/ai-live-smoke")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const configuredToken = process.env[REQUIRED_TOKEN_ENV]?.trim() ?? "";
        if (!configuredToken) return new Response(null, { status: 404, headers: { "cache-control": "no-store" } });

        const suppliedToken = request.headers.get("x-flixo-ai-smoke-token")?.trim() ?? "";
        if (!constantTimeEquals(configuredToken, suppliedToken)) return unauthorized();
        if (!consumeRateLimit()) return rateLimited();

        const contentLength = Number(request.headers.get("content-length"));
        if (Number.isFinite(contentLength) && contentLength > MAX_BODY_CHARS) {
          return Response.json({ error: "Request body too large." }, { status: 413, headers: { "cache-control": "no-store" } });
        }

        let body: unknown;
        try {
          const raw = await request.text();
          if (raw.length > MAX_BODY_CHARS) {
            return Response.json({ error: "Request body too large." }, { status: 413, headers: { "cache-control": "no-store" } });
          }
          body = JSON.parse(raw) as unknown;
        } catch {
          return Response.json({ error: "Invalid JSON body." }, { status: 400, headers: { "cache-control": "no-store" } });
        }

        if (!body || typeof body !== "object") {
          return Response.json({ error: "Expected a JSON object." }, { status: 400, headers: { "cache-control": "no-store" } });
        }

        const record = body as Record<string, unknown>;
        const prompt = typeof record.prompt === "string" ? record.prompt.trim() : typeof record.input === "string" ? record.input.trim() : "";
        const taskId = isTaskId(record.taskId) ? record.taskId : DEFAULT_TASK;

        if (!prompt) return Response.json({ error: "Missing prompt." }, { status: 400, headers: { "cache-control": "no-store" } });
        if (prompt.length > MAX_PROMPT_CHARS) {
          return Response.json({ error: "Prompt too long." }, { status: 413, headers: { "cache-control": "no-store" } });
        }

        const result = await aiService.generate(taskId, prompt);
        if (!result.ok) {
          return Response.json(
            { ok: false, error: result.message, retryable: result.retryable, kind: result.kind },
            { status: result.retryable ? 503 : 422, headers: { "cache-control": "no-store" } },
          );
        }

        return Response.json(
          {
            ok: true,
            output: result.content,
            content: result.content,
          },
          { headers: { "cache-control": "no-store" } },
        );
      },
    },
  },
});
