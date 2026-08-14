import { createServerFn } from "@tanstack/react-start";
import { and, eq, gte, isNull, lte, or } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/server/db/client";
import { isDbConfigured } from "@/lib/server/db/config";
import { surveyQuestions, surveyResponses, surveys } from "@/lib/server/db/schema";
import { rateLimit, RATE_PRESETS } from "@/lib/server/security/csrf";
import { securityRequestMiddleware } from "@/lib/security/requestMiddleware";

const publicSurveyInput = z.object({ slug: z.string().min(2).max(80) });

export const getActiveSurvey = createServerFn({ method: "GET" })
  .validator(publicSurveyInput)
  .handler(async ({ data }) => {
    if (!isDbConfigured()) return { ok: false as const, kind: "not_configured" as const };
    const now = new Date();
    const [survey] = await getDb()
      .select()
      .from(surveys)
      .where(
        and(
          eq(surveys.slug, data.slug),
          eq(surveys.active, true),
          or(isNull(surveys.startsAt), lte(surveys.startsAt, now)),
          or(isNull(surveys.endsAt), gte(surveys.endsAt, now)),
        ),
      )
      .limit(1);
    if (!survey) return { ok: false as const, kind: "not_found" as const };

    const questions = await getDb()
      .select()
      .from(surveyQuestions)
      .where(eq(surveyQuestions.surveyId, survey.id))
      .orderBy(surveyQuestions.sortOrder);

    return {
      ok: true as const,
      survey: {
        id: survey.id,
        slug: survey.slug,
        title: survey.title,
        description: survey.description,
        targetLocale: survey.targetLocale,
        questions: questions.map((question) => ({
          id: question.id,
          type: question.type,
          prompt: question.prompt,
          options: question.options,
          required: question.required,
        })),
      },
    };
  });

const submitSurveyInput = z.object({
  surveyId: z.string().uuid(),
  sessionId: z.string().min(16).max(128),
  locale: z.string().max(16).optional(),
  answers: z.record(z.string(), z.union([z.string().max(2000), z.array(z.string().max(2000)).max(30), z.number().min(0).max(10_000), z.null()])),
});

export const submitSurvey = createServerFn({ method: "POST" })
  .validator(submitSurveyInput)
  .middleware([securityRequestMiddleware])
  .handler(async ({ context, data }) => {
    if (!isDbConfigured()) return { ok: false as const, kind: "not_configured" as const };
    const rate = rateLimit(`survey:${context.clientIp ?? "anon"}`, RATE_PRESETS.analytics);
    if (!rate.allowed) return { ok: false as const, kind: "rate_limited" as const };

    const [survey] = await getDb()
      .select()
      .from(surveys)
      .where(and(eq(surveys.id, data.surveyId), eq(surveys.active, true)))
      .limit(1);
    if (!survey) return { ok: false as const, kind: "not_found" as const };

    await getDb().insert(surveyResponses).values({
      surveyId: survey.id,
      sessionId: data.sessionId,
      locale: data.locale,
      answers: data.answers,
    });

    return { ok: true as const };
  });
