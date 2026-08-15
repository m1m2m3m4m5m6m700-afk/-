import { createServerFn } from "@tanstack/react-start";
import { desc, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/server/db/client";
import { isDbConfigured } from "@/lib/server/db/config";
import { analyticsEvents, surveyQuestions, surveyResponses, surveys } from "@/lib/server/db/schema";
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
const surveyQuestionTypeSchema = z.enum([
  "single_choice", "multi_choice", "dropdown", "scale", "rating", "nps", "yes_no",
  "text", "textarea", "number", "date", "email", "url", "ranking", "matrix_single",
  "matrix_multi", "consent",
]);
const questionConfigSchema = z.record(z.string(), z.unknown()).default({});
const answerSchema = z.union([z.string(), z.number(), z.boolean(), z.array(z.string()), z.null()]);

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
    const rows = await getDb().select().from(analyticsEvents).where(gte(analyticsEvents.createdAt, since)).orderBy(desc(analyticsEvents.createdAt)).limit(10_000);
    const sessionIds = new Set(rows.map((row) => row.sessionId).filter(Boolean));
    const durations = rows.map((row) => row.durationMs).filter((duration): duration is number => typeof duration === "number" && duration >= 0);
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
      clickEvents: rows.filter((row) => ["tool_click", "category_click", "external_link_click", "download", "copy"].includes(row.eventType)).length,
      averageJourneyMs: durations.length > 0 ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length) : 0,
      topTools: top(rows.map((row) => row.toolId)),
      topIntents: top(rows.map((row) => row.intentId)),
      topPages: top(rows.map((row) => row.path)),
      pathTransitions: top(rows.filter((row) => row.previousPath && row.path).map((row) => `${row.previousPath} → ${row.path}`)),
      locales: top(rows.map((row) => row.locale)),
      eventMix: top(rows.map((row) => row.eventType), 20),
    };
  });

export const getAdminSurveys = createServerFn({ method: "GET" })
  .middleware([adminSessionMiddleware])
  .handler(async ({ context }) => {
    if (!requireAdmin(context)) return { ok: false as const, kind: "not_authenticated" as const };
    if (!isDbConfigured()) return { ok: false as const, kind: "not_configured" as const };
    const rows = await getDb().select({ id: surveys.id, slug: surveys.slug, title: surveys.title, description: surveys.description, active: surveys.active, targetLocale: surveys.targetLocale, maxResponses: surveys.maxResponses, startsAt: surveys.startsAt, endsAt: surveys.endsAt, updatedAt: surveys.updatedAt }).from(surveys).orderBy(desc(surveys.updatedAt)).limit(100);
    return { ok: true as const, surveys: rows };
  });

export const getAdminSurveyResults = createServerFn({ method: "GET" })
  .middleware([adminSessionMiddleware])
  .validator(z.object({ surveyId: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    if (!requireAdmin(context)) return { ok: false as const, kind: "not_authenticated" as const };
    if (!isDbConfigured()) return { ok: false as const, kind: "not_configured" as const };
    const [survey] = await getDb().select().from(surveys).where(eq(surveys.id, data.surveyId)).limit(1);
    if (!survey) return { ok: false as const, kind: "not_found" as const };
    const questions = await getDb().select().from(surveyQuestions).where(eq(surveyQuestions.surveyId, data.surveyId)).orderBy(surveyQuestions.sortOrder);
    const responses = await getDb().select({ answers: surveyResponses.answers, locale: surveyResponses.locale, createdAt: surveyResponses.createdAt }).from(surveyResponses).where(eq(surveyResponses.surveyId, data.surveyId)).orderBy(desc(surveyResponses.createdAt)).limit(10_000);
    const answerSummary = questions.map((question) => {
      const counts = new Map<string, number>();
      for (const response of responses) {
        const value = response.answers[question.id];
        for (const entry of Array.isArray(value) ? value : [value]) {
          if (entry === null || entry === undefined || entry === "") continue;
          const key = String(entry);
          counts.set(key, (counts.get(key) ?? 0) + 1);
        }
      }
      return { questionId: question.id, prompt: question.prompt, type: question.type, config: question.config, totalAnswers: [...counts.values()].reduce((sum, value) => sum + value, 0), choices: [...counts.entries()].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count) };
    });
    return { ok: true as const, survey: { id: survey.id, title: survey.title, active: survey.active }, responses: responses.length, locales: top(responses.map((response) => response.locale)), questions: answerSummary };
  });

export const createAdminSurvey = createServerFn({ method: "POST" })
  .middleware([adminSessionMiddleware])
  .validator(z.object({
    slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/),
    title: z.string().min(2).max(160),
    description: z.string().max(500).optional(),
    targetLocale: z.string().max(16).optional(),
    maxResponses: z.number().int().min(1).max(1_000_000).optional(),
    startsAt: z.coerce.date().optional(),
    endsAt: z.coerce.date().optional(),
  }).refine((value) => !value.startsAt || !value.endsAt || value.endsAt > value.startsAt, { message: "endsAt must be after startsAt" }))
  .handler(async ({ context, data }) => {
    if (!requireAdmin(context)) return { ok: false as const, kind: "not_authenticated" as const };
    if (!isDbConfigured()) return { ok: false as const, kind: "not_configured" as const };
    const [created] = await getDb().insert(surveys).values(data).returning();
    return { ok: true as const, survey: created };
  });

export const createAdminSurveyQuestion = createServerFn({ method: "POST" })
  .middleware([adminSessionMiddleware])
  .validator(z.object({
    surveyId: z.string().uuid(), type: surveyQuestionTypeSchema, prompt: z.string().min(2).max(2000),
    options: z.array(z.string().min(1).max(300)).max(100).default([]), config: questionConfigSchema,
    required: z.boolean().default(false), sortOrder: z.number().int().min(0).max(500).default(0),
  }))
  .handler(async ({ context, data }) => {
    if (!requireAdmin(context)) return { ok: false as const, kind: "not_authenticated" as const };
    if (!isDbConfigured()) return { ok: false as const, kind: "not_configured" as const };
    if (["single_choice", "multi_choice", "dropdown", "ranking"].includes(data.type) && data.options.length === 0) return { ok: false as const, kind: "invalid_question", message: "This question type requires options." };
    if ((data.type === "matrix_single" || data.type === "matrix_multi") && (!Array.isArray(data.config.rows) || !Array.isArray(data.config.columns) || data.config.rows.length === 0 || data.config.columns.length === 0)) return { ok: false as const, kind: "invalid_question", message: "Matrix questions require rows and columns." };
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

export const getPublicSurvey = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/) }))
  .handler(async ({ data }) => {
    if (!isDbConfigured()) return { ok: false as const, kind: "not_available" as const };
    const now = new Date();
    const [survey] = await getDb().select({ id: surveys.id, slug: surveys.slug, title: surveys.title, description: surveys.description, active: surveys.active, targetLocale: surveys.targetLocale, maxResponses: surveys.maxResponses, startsAt: surveys.startsAt, endsAt: surveys.endsAt }).from(surveys).where(eq(surveys.slug, data.slug)).limit(1);
    if (!survey || !survey.active) return { ok: false as const, kind: "not_found" as const };
    if ((survey.startsAt && now < survey.startsAt) || (survey.endsAt && now > survey.endsAt)) return { ok: false as const, kind: "closed" as const };
    if (survey.maxResponses) {
      const [{ count }] = await getDb().select({ count: sql<number>`count(*)::int` }).from(surveyResponses).where(eq(surveyResponses.surveyId, survey.id));
      if (count >= survey.maxResponses) return { ok: false as const, kind: "closed" as const };
    }
    const questions = await getDb().select({ id: surveyQuestions.id, type: surveyQuestions.type, prompt: surveyQuestions.prompt, options: surveyQuestions.options, config: surveyQuestions.config, required: surveyQuestions.required, sortOrder: surveyQuestions.sortOrder }).from(surveyQuestions).where(eq(surveyQuestions.surveyId, survey.id)).orderBy(surveyQuestions.sortOrder);
    return { ok: true as const, survey, questions };
  });

export const submitPublicSurvey = createServerFn({ method: "POST" })
  .validator(z.object({ surveyId: z.string().uuid(), sessionId: z.string().min(16).max(128).optional(), locale: z.string().max(16).optional(), answers: z.record(z.string().uuid(), answerSchema) }))
  .handler(async ({ data }) => {
    if (!isDbConfigured()) return { ok: false as const, kind: "not_available" as const };
    const now = new Date();
    const [survey] = await getDb().select({ id: surveys.id, active: surveys.active, maxResponses: surveys.maxResponses, startsAt: surveys.startsAt, endsAt: surveys.endsAt }).from(surveys).where(eq(surveys.id, data.surveyId)).limit(1);
    if (!survey || !survey.active) return { ok: false as const, kind: "closed" as const };
    if ((survey.startsAt && now < survey.startsAt) || (survey.endsAt && now > survey.endsAt)) return { ok: false as const, kind: "closed" as const };
    if (survey.maxResponses) {
      const [{ count }] = await getDb().select({ count: sql<number>`count(*)::int` }).from(surveyResponses).where(eq(surveyResponses.surveyId, survey.id));
      if (count >= survey.maxResponses) return { ok: false as const, kind: "closed" as const };
    }
    const questions = await getDb().select({ id: surveyQuestions.id, type: surveyQuestions.type, required: surveyQuestions.required }).from(surveyQuestions).where(eq(surveyQuestions.surveyId, survey.id)).orderBy(surveyQuestions.sortOrder);
    const allowed = new Set(questions.map((question) => question.id));
    for (const [questionId, value] of Object.entries(data.answers)) {
      if (!allowed.has(questionId)) return { ok: false as const, kind: "invalid_answers" as const };
      if (Array.isArray(value) && value.some((entry) => typeof entry !== "string")) return { ok: false as const, kind: "invalid_answers" as const };
    }
    for (const question of questions) {
      if (question.required && (data.answers[question.id] === undefined || data.answers[question.id] === null || data.answers[question.id] === "")) return { ok: false as const, kind: "missing_required" as const, questionId: question.id };
    }
    await getDb().insert(surveyResponses).values({ surveyId: survey.id, sessionId: data.sessionId, locale: data.locale, answers: data.answers });
    return { ok: true as const };
  });
