import { createServerFn } from "@tanstack/react-start";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/server/db/client";
import { isDbConfigured } from "@/lib/server/db/config";
import { toolReviews } from "@/lib/server/db/schema";
import { adminSessionMiddleware } from "../auth/adminSession";

const slugSchema = z.string().min(1).max(160).regex(/^[a-z0-9-]+$/);

function requireAdmin(context: { adminSession?: { role: string } | null }) {
  return Boolean(context.adminSession && context.adminSession.role === "admin");
}

export const getAdminToolReview = createServerFn({ method: "GET" })
  .middleware([adminSessionMiddleware])
  .validator(z.object({ slug: slugSchema }))
  .handler(async ({ context, data }) => {
    if (!requireAdmin(context)) return { ok: false as const, kind: "not_authenticated" as const };
    if (!isDbConfigured()) return { ok: false as const, kind: "not_configured" as const };

    const [row] = await getDb()
      .select({ slug: toolReviews.slug, reviewed: toolReviews.reviewed, reviewedAt: toolReviews.reviewedAt })
      .from(toolReviews)
      .where(eq(toolReviews.slug, data.slug))
      .limit(1);

    return { ok: true as const, review: row ?? { slug: data.slug, reviewed: false, reviewedAt: null } };
  });

export const getAdminToolReviews = createServerFn({ method: "GET" })
  .middleware([adminSessionMiddleware])
  .handler(async ({ context }) => {
    if (!requireAdmin(context)) return { ok: false as const, kind: "not_authenticated" as const };
    if (!isDbConfigured()) return { ok: false as const, kind: "not_configured" as const };

    const rows = await getDb()
      .select({ slug: toolReviews.slug, reviewed: toolReviews.reviewed, reviewedAt: toolReviews.reviewedAt })
      .from(toolReviews)
      .orderBy(asc(toolReviews.slug));

    return { ok: true as const, reviews: rows };
  });

export const setAdminToolReviewed = createServerFn({ method: "POST" })
  .middleware([adminSessionMiddleware])
  .validator(
    z.object({
      slug: slugSchema,
      reviewed: z.boolean(),
    }),
  )
  .handler(async ({ context, data }) => {
    if (!requireAdmin(context)) return { ok: false as const, kind: "not_authenticated" as const };
    if (!isDbConfigured()) return { ok: false as const, kind: "not_configured" as const };

    const reviewedAt = data.reviewed ? new Date() : null;
    await getDb()
      .insert(toolReviews)
      .values({
        slug: data.slug,
        reviewed: data.reviewed,
        reviewedAt,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: toolReviews.slug,
        set: {
          reviewed: data.reviewed,
          reviewedAt,
          updatedAt: new Date(),
        },
      });

    return { ok: true as const, slug: data.slug, reviewed: data.reviewed, reviewedAt };
  });
