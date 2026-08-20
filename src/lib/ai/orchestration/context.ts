/**
 * Read-only orchestration context for AI requests.
 *
 * This adapter deliberately sits between AI/RPC and the Tool Platform. It may
 * describe canonical public tools, but it has no database write authority,
 * cannot invoke tools, and never receives provider secrets.
 */

import {
  getPublicToolRegistrationBySlug,
  publicToolRegistrations,
} from "../../tool-platform/publicDesktopTools";
import type { PublicToolRegistration } from "../../tool-platform/types";

export const AI_CONTEXT_MAX_TOOLS = 3;
export const AI_CONTEXT_MAX_DESCRIPTION_CHARS = 240;
export const AI_CONTEXT_MAX_TOTAL_CHARS = 1200;

export interface AIOrchestrationContext {
  taskId: string;
  inputLength: number;
  candidateTools: readonly {
    id: string;
    slug: string;
    name: string;
    category: string;
    description: string;
    localOnly: boolean;
  }[];
  selectedTool: string | null;
  policy: {
    readOnly: true;
    canInvokeTools: false;
    canWriteDatabase: false;
    autoApply: false;
    requiresHumanReview: true;
  };
}

function truncate(value: string, maxChars: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxChars) return normalized;
  return `${normalized.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}

function summarize(registration: PublicToolRegistration) {
  const manifest = registration.manifest;
  return {
    id: manifest.id,
    slug: manifest.slug,
    name: truncate(manifest.name, 80),
    category: truncate(manifest.category, 80),
    description: truncate(manifest.description, AI_CONTEXT_MAX_DESCRIPTION_CHARS),
    localOnly: manifest.capabilities.localOnly,
  } as const;
}

function rank(text: string, registration: PublicToolRegistration): number {
  const normalized = text.toLowerCase();
  const haystack = [
    registration.manifest.id,
    registration.manifest.slug,
    registration.manifest.name,
    registration.manifest.category,
    registration.manifest.description,
  ].join(" ").toLowerCase();

  let score = 0;
  for (const token of normalized.split(/[^a-z0-9-]+/).filter(Boolean)) {
    if (haystack.includes(token)) score += token.length >= 5 ? 2 : 1;
  }
  return score;
}

function fitTotalContext(candidates: ReturnType<typeof summarize>[]): ReturnType<typeof summarize>[] {
  let total = 0;
  const fitted: ReturnType<typeof summarize>[] = [];

  for (const candidate of candidates) {
    const serialized = `- ${candidate.name} (${candidate.slug}): ${candidate.description}\n`;
    if (fitted.length >= AI_CONTEXT_MAX_TOOLS) break;
    if (total + serialized.length > AI_CONTEXT_MAX_TOTAL_CHARS) break;
    fitted.push(candidate);
    total += serialized.length;
  }

  return fitted;
}

export function buildAIOrchestrationContext(
  taskId: string,
  input: string,
  requestedToolSlug?: string,
): AIOrchestrationContext {
  const requested = requestedToolSlug
    ? getPublicToolRegistrationBySlug(requestedToolSlug)
    : undefined;

  const ranked = [...publicToolRegistrations]
    .map((registration) => ({ registration, score: rank(input, registration) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, AI_CONTEXT_MAX_TOOLS)
    .map(({ registration }) => registration);

  const registrations = requested && !ranked.some((item) => item.manifest.id === requested.manifest.id)
    ? [requested, ...ranked]
    : ranked;

  const candidates = fitTotalContext(registrations.map(summarize));

  return {
    taskId,
    inputLength: input.length,
    candidateTools: candidates,
    selectedTool: requested?.manifest.slug ?? candidates[0]?.slug ?? null,
    policy: {
      readOnly: true,
      canInvokeTools: false,
      canWriteDatabase: false,
      autoApply: false,
      requiresHumanReview: true,
    },
  };
}
