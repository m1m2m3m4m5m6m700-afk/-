import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { rateLimit, RATE_PRESETS } from "@/lib/server/security/csrf";
import { securityRequestMiddleware } from "@/lib/security/requestMiddleware";
import { getDb } from "@/lib/server/db/client";
import { isDbConfigured } from "@/lib/server/db/config";
import { analyticsEvents } from "@/lib/server/db/schema";

const eventSchema = z.object({
  type: z.enum([
    "page_view",
    "search",
    "tool_click",
    "category_click",
    "download",
    "external_link_click",
    "copy",
    "session_start",
    "session_end",
    "tool_start",
    "tool_complete",
    "navigation",
    "survey_response",
  ]),
  sessionId: z.string().min(16).max(128),
  locale: z.string().max(16).optional(),
  intentId: z.string().max(120).optional(),
  toolId: z.string().max(120).optional(),
  category: z.string().max(120).optional(),
  queryHash: z.string().max(128).optional(),
  referrerOrigin: z.string().max(200).optional(),
  path: z.string().max(500).optional(),
  previousPath: z.string().max(500).optional(),
  durationMs: z.number().int().min(0).max(86_400_000).optional(),
  resultCount: z.number().int().min(0).max(100_000).optional(),
});

const collectInput = z.object({
  events: z.array(eventSchema).min(1).max(50),
});

/**
 * First-party analytics collector.
 *
 * Privacy contract: the client sends a rotating session identifier only; this
 * endpoint never reads/stores an IP address, raw referrer URL, raw user-agent,
 * or raw search text. Search text is represented by a client-side hash.
 */
export const collectAnalytics = createServerFn({ method: "POST" })
  .validator(collectInput)
  .middleware([securityRequestMiddleware])
  .handler(async ({ context, data }) => {
    if (!isDbConfigured()) {
      return { ok: false as const, kind: "not_configured" as const };
    }

    const rate = rateLimit(`analytics:${context.clientIp ?? "anon"}`, RATE_PRESETS.analytics ?? RATE_PRESETS.ai);
    if (!rate.allowed) {
      return { ok: false as const, kind: "rate_limited" as const };
    }

    await getDb().insert(analyticsEvents).values(
      data.events.map((event) => ({
        eventType: event.type,
        sessionId: event.sessionId,
        locale: event.locale,
        intentId: event.intentId,
        toolId: event.toolId,
        category: event.category,
        queryHash: event.queryHash,
        referrerOrigin: event.referrerOrigin,
        path: event.path,
        previousPath: event.previousPath,
        durationMs: event.durationMs,
        resultCount: event.resultCount,
      })),
    );

    return { ok: true as const, accepted: data.events.length };
  });
