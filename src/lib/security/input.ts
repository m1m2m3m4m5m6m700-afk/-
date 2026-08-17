import { z } from "zod";

const safeUrlPattern = /^(https?:\/\/|blob:|data:|\/)/i;

export const toolInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  value: z.unknown(),
  sourceUrl: z.string().trim().max(2048).optional(),
});

export function validateToolInput(input: unknown) {
  const parsed = toolInputSchema.parse(input);
  if (parsed.sourceUrl && !safeUrlPattern.test(parsed.sourceUrl)) {
    throw new Error("Unsafe tool input URL.");
  }
  return parsed;
}
