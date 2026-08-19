import { z } from "zod";

export const toolCategoryIdSchema = z.enum([
  "translation",
  "images",
  "pdf",
  "writing",
  "video",
  "audio",
  "files",
  "utilities",
  "converters",
  "calculators",
  "web",
  "chrome",
  "developer",
  "ai",
  "future",
]);

export const toolLifecycleStateSchema = z.enum([
  "draft",
  "implemented",
  "verified",
  "public",
  "deprecated",
]);

export const toolInputKindSchema = z.enum(["file", "files", "text", "url", "none"]);
export const toolOutputKindSchema = z.enum(["download", "preview", "text", "none"]);

export const toolTestCheckSchema = z.enum([
  "render",
  "interaction",
  "output",
  "error",
  "security",
  "performance",
  "mutation",
  "invariant",
  "evidence",
]);

export const toolCertificationLevelSchema = z.enum([
  "uncertified",
  "unit-verified",
  "integration-verified",
  "e2e-verified",
  "security-verified",
  "performance-verified",
  "certified",
]);

export const toolCapabilitiesSchema = z.object({
  input: toolInputKindSchema,
  output: toolOutputKindSchema,
  localOnly: z.boolean(),
  policy: z.object({
    requiresNetwork: z.boolean().default(false),
    requiresStorage: z.boolean().default(false),
    sensitiveInput: z.boolean().default(false),
  }).default({}),
});

export const toolBaseManifestSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  category: toolCategoryIdSchema,
  description: z.string().min(1),
  lifecycle: toolLifecycleStateSchema,
  capabilities: toolCapabilitiesSchema,
  dependencies: z.array(z.string().min(1)).default([]),
});

export const toolTestContractSchema = z.object({
  toolId: z.string().min(1),
  route: z.string().startsWith("/tools/"),
  requiredChecks: z.array(toolTestCheckSchema).min(1),
});

export const toolCertificationRequirementsSchema = z.object({
  level: toolCertificationLevelSchema,
  requiredChecks: z.array(toolTestCheckSchema).min(1),
  requiredEvidence: z.boolean(),
  regressionLocked: z.boolean(),
  dataProcessing: z.enum(["local-only", "browser-and-server"]),
});

export const toolManifestSchema = toolBaseManifestSchema.extend({
  certification: toolCertificationRequirementsSchema,
});
