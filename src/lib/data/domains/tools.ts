/** Canonical tool-data access layer. No legacy roadmap/tool catalog imports. */
import {
  getPublicToolRegistration,
  getPublicToolRegistrationBySlug,
  publicToolRegistrations,
} from "@/lib/tool-platform/publicDesktopTools";
import type { ToolCategoryId } from "@/lib/tool-platform/categories";
import type { PublicToolRegistration, ToolManifest } from "@/lib/tool-platform/types";

export type Tool = ToolManifest & {
  /** Compatibility-only aliases for older data consumers. */
  readonly categoryId: ToolCategoryId;
  readonly status: "ready";
};

const toTool = (registration: PublicToolRegistration): Tool => ({
  ...registration.manifest,
  categoryId: registration.manifest.category,
  status: "ready",
});

export const tools: readonly Tool[] = Object.freeze(
  publicToolRegistrations.map(toTool),
);

export const toolById = new Map<string, Tool>(tools.map((tool) => [tool.id, tool]));

export const getTool = (id: string): Tool | undefined => {
  return toolById.get(id) ?? getPublicToolRegistration(id)?.manifest && toTool(getPublicToolRegistration(id)!);
};

export const getToolBySlug = (slug: string): Tool | undefined => {
  const registration = getPublicToolRegistrationBySlug(slug);
  return registration ? toTool(registration) : undefined;
};

export const toolsByCategoryMap = new Map<ToolCategoryId, Tool[]>(
  Array.from(new Set(tools.map((tool) => tool.categoryId))).map((categoryId) => [
    categoryId,
    tools.filter((tool) => tool.categoryId === categoryId),
  ]),
);

export const toolsByCategory = (categoryId: ToolCategoryId): Tool[] =>
  toolsByCategoryMap.get(categoryId) ?? [];

export const readyTools = (): Tool[] => [...tools];

export const toolRoute = (tool: Tool): string => `/tools/${tool.slug}`;
