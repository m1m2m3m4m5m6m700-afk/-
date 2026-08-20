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

function summarize(registration: PublicToolRegistration) {
  const manifest = registration.manifest;
  return {
    id: manifest.id,
    slug: manifest.slug,
    name: manifest.name,
    category: manifest.category,
    description: manifest.description,
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
    .slice(0, 3)
    .map(({ registration }) => registration);

  const candidates = requested && !ranked.some((item) => item.manifest.id === requested.manifest.id)
    ? [requested, ...ranked]
    : ranked;

  return {
    taskId,
    inputLength: input.length,
    candidateTools: candidates.map(summarize),
    selectedTool: requested?.manifest.slug ?? candidates[0]?.manifest.slug ?? null,
    policy: {
      readOnly: true,
      canInvokeTools: false,
      canWriteDatabase: false,
      autoApply: false,
      requiresHumanReview: true,
    },
  };
}
