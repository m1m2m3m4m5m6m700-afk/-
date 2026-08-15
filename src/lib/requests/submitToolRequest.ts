import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDb } from "@/lib/server/db/client";
import { isDbConfigured } from "@/lib/server/db/config";
import { toolRequests } from "@/lib/server/db/schema";

const requestSchema = z.object({
  prompt: z.string().trim().min(1).max(4000),
  locale: z.string().trim().max(16).optional(),
  attachmentName: z.string().trim().max(255).optional(),
  linkUrl: z.string().trim().url().max(2048).optional(),
  confidence: z.number().min(0).max(1).optional(),
  intentId: z.string().trim().max(160).optional(),
});

/**
 * Public write endpoint used only for unmatched Flex requests.
 * No user identity is required; the database record is the admin's backlog
 * for discovering and prioritizing missing tools.
 */
export const submitFlexToolRequest = createServerFn({ method: "POST" })
  .validator(requestSchema)
  .handler(async ({ data }) => {
    if (!isDbConfigured()) {
      return { ok: false as const, kind: "not_configured" as const };
    }

    const metadata = [
      data.locale ? `locale=${data.locale}` : null,
      data.attachmentName ? `attachment=${data.attachmentName}` : null,
      data.linkUrl ? `url=${data.linkUrl}` : null,
      typeof data.confidence === "number" ? `confidence=${data.confidence.toFixed(3)}` : null,
      data.intentId ? `intent=${data.intentId}` : null,
    ].filter(Boolean);

    const [created] = await getDb()
      .insert(toolRequests)
      .values({
        toolName: "Flex unmatched request",
        description: metadata.length > 0 ? `${data.prompt}\n[${metadata.join(", ")}]` : data.prompt,
        requester: "flex",
        status: "pending",
      })
      .returning({ id: toolRequests.id });

    return { ok: true as const, id: created.id };
  });
