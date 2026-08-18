import { z } from "zod";

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
});

export const toolBaseManifestSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  lifecycle: toolLifecycleStateSchema,
  capabilities: toolCapabilitiesSchema,
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
