import { createServerFn } from "@tanstack/react-start";
import { desc, eq, gte } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/server/db/client";
import { isDbConfigured } from "@/lib/server/db/config";
import { analyticsEvents, surveyQuestions, surveys } from "@/lib/server/db/schema";
import { adminSessionMiddleware } from "../auth/adminSession";

type Aggregate = { key: string; count: number };

function top(values: Iterable<string | null | undefined>, limit = 10): Aggregate[] {
  const counts = new Map<string, number>();
  for (const value of values) {
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

const daysSchema = z.number().int().min(1).max(90).default(30);

function requireAdmin(context: { adminSession?: { role: string } | null }) {
  return Boolean(context.adminSession && context.adminSession.role === "admin");
}

export const getAdminBehaviorOverview = createServerFn({ method: "GET" })
  .middleware([adminSessionMiddleware])
  .validator(z.object({ days: daysSchema }))
  .handler(async ({ context, data }) => {
    if (!requireAdmin(context)) return { ok: false as const, kind: "not_authenticated" as const };
    if (!isDbConfigured()) return { ok: false as const, kind: "not_configured" as const };

    const since = new Date(Date.now() - data.days * 86_400_000);
    const rows = await getDb()
      .select()
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, since))
      .orderBy(desc(analyticsEvents.createdAt))
      .limit(10_000);

    const sessionIds = new Set(rows.map((row) => row.sessionId).filter(Boolean));
    const durations = rows
      .map((row) => row.durationMs)
      .filter((duration): duration is number => typeof duration === "number" && duration >= 0);

    return {
      ok: true as const,
      periodDays: data.days,
      sessions: sessionIds.size,
      sessionStarts: rows.filter((row) => row.eventType === "session_start").length,
      pageViews: rows.filter((row) => row.eventType === "page_view").length,
      searches: rows.filter((row) => row.eventType === "search").length,
      toolStarts: rows.filter((row) => row.eventType === "tool_start").length,
      toolCompletions: rows.filter((row) => row.eventType === "tool_complete").length,
      surveyResponses: rows.filter((row) => row.eventType === "survey_response").length,
      averageJourneyMs:
        durations.length > 0
          ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)
          : 0,
      topTools: top(rows.map((row) => row.toolId)),
      topIntents: top(rows.map((row) => row.intentId)),
      topPages: top(rows.map((row) => row.path)),
      pathTransitions: top(
        rows
          .filter((row) => row.previousPath && row.path)
          .map((row) => `${row.previousPath} → ${row.path}`),
      ),
      locales: top(rows.map((row) => row.locale)),
      eventMix: top(rows.map((row) => row.eventType), 20),
    };
  });

export const getAdminSurveys = createServerFn({ method: "GET" })
  .middleware([adminSessionMiddleware])
  .handler(async ({ context }) => {
    if (!requireAdmin(context)) return { ok: false as const, kind: "not_authenticated" as const };
    if (!isDbConfigured()) return { ok: false as const, kind: "not_configured" as const };

    const rows = await getDb()
      .select({
        id: surveys.id,
        slug: surveys.slug,
        title: surveys.title,
        description: surveys.description,
        active: surveys.active,
        targetLocale: surveys.targetLocale,
        maxResponses: surveys.maxResponses,
        updatedAt: surveys.updatedAt,
      })
      .from(surveys)
      .orderBy(desc(surveys.updatedAt))
      .limit(100);
    return { ok: true as const, surveys: rows };
  });

export const createAdminSurvey = createServerFn({ method: "POST" })
  .middleware([adminSessionMiddleware])
  .validator(
    z.object({
      slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/),
      title: z.string().min(2).max(160),
      description: z.string().max(500).optional(),
      targetLocale: z.string().max(16).optional(),
      maxResponses: z.number().int().min(1).max(1_000_000).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    if (!requireAdmin(context)) return { ok: false as const, kind: "not_authenticated" as const };
    if (!isDbConfigured()) return { ok: false as const, kind: "not_configured" as const };
    const [created] = await getDb().insert(surveys).values(data).returning();
    return { ok: true as const, survey: created };
  });

export const createAdminSurveyQuestion = createServerFn({ method: "POST" })
  .middleware([adminSessionMiddleware])
  .validator(
    z.object({
      surveyId: z.string().uuid(),
      type: z.enum(["single_choice", "multi_choice", "scale", "text"]),
      prompt: z.string().min(2).max(1000),
      options: z.array(z.string().max(200)).max(50).default([]),
      required: z.boolean().default(false),
      sortOrder: z.number().int().min(0).max(500).default(0),
    }),
  )
  .handler(async ({ context, data }) => {
    if (!requireAdmin(context)) return { ok: false as const, kind: "not_authenticated" as const };
    if (!isDbConfigured()) return { ok: false as const, kind: "not_configured" as const };
    const [created] = await getDb().insert(surveyQuestions).values(data).returning();
    return { ok: true as const, question: created };
  });

export const setAdminSurveyActive = createServerFn({ method: "POST" })
  .middleware([adminSessionMiddleware])
  .validator(z.object({ id: z.string().uuid(), active: z.boolean() }))
  .handler(async ({ context, data }) => {
    if (!requireAdmin(context)) return { ok: false as const, kind: "not_authenticated" as const };
    if (!isDbConfigured()) return { ok: false as const, kind: "not_configured" as const };
    await getDb().update(surveys).set({ active: data.active, updatedAt: new Date() }).where(eq(surveys.id, data.id));
    return { ok: true as const };
  });
