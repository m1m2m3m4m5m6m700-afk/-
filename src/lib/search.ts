import { publicToolRegistrations } from "@/lib/tool-platform/publicDesktopTools";
import type { PublicToolRegistration } from "@/lib/tool-platform/types";
import { verifiedDesktopTools } from "@/lib/desktop-tools/verifiedCatalog";

export type SearchResult<T> = {
  item: T;
  score: number;
  matchedTerms: string[];
};

export type PublicSearchTool = PublicToolRegistration["manifest"] & {
  readonly tags?: readonly string[];
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^ -\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

export const tokenize = (value: string): string[] =>
  normalize(value)
    .split(" ")
    .filter((token) => token.length > 1)
    .map((token) => singularize(token));

const singularize = (token: string): string => {
  if (token.endsWith("ies")) return `${token.slice(0, -3)}y`;
  if (token.endsWith("es")) return token.slice(0, -2);
  if (token.endsWith("s") && token.length > 3) return token.slice(0, -1);
  return token;
};

const scoreSignal = (queryToken: string, signal: string): number => {
  if (!signal) return 0;
  if (signal === queryToken) return 4;
  if (signal.startsWith(queryToken) || queryToken.startsWith(signal)) return 3;
  if (signal.includes(queryToken)) return 2;

  const distance = levenshteinDistance(queryToken, signal);
  if (distance <= 1) return 1.5;
  if (distance <= 2) return 1;
  return 0;
};

const getSignalScore = (queryToken: string, signals: string[]): number =>
  signals.reduce((best, signal) => Math.max(best, scoreSignal(queryToken, signal)), 0);

const uniq = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

const verifiedById = new Map(
  verifiedDesktopTools.map((tool) => [
    tool.id,
    {
      ...tool,
      lifecycle: "public" as const,
      capabilities: {
        input: "file" as const,
        output: "download" as const,
        localOnly: true,
        policy: { requiresNetwork: false, requiresStorage: false, sensitiveInput: false },
      },
      dependencies: [],
      certification: publicToolRegistrations[0]?.manifest.certification,
    },
  ] as const),
);

const registeredTools = publicToolRegistrations.map(({ manifest }) => manifest as PublicSearchTool);
const mergedTools = registeredTools.map((tool) => verifiedById.get(tool.id) ?? tool);

for (const verifiedTool of verifiedDesktopTools) {
  if (!mergedTools.some((tool) => tool.id === verifiedTool.id)) {
    mergedTools.push(verifiedById.get(verifiedTool.id)!);
  }
}

export const searchableTools: readonly PublicSearchTool[] = Object.freeze(
  mergedTools.filter((tool) => tool.lifecycle === "public" && Boolean(tool.slug)),
);

export const searchableToolSlugs: readonly string[] = Object.freeze(
  searchableTools.map((tool) => tool.slug),
);

export function searchItems<T>(
  items: T[],
  query: string,
  options: {
    getSignals: (item: T) => string[];
    getBoost?: (item: T) => number;
    limit?: number;
  },
): SearchResult<T>[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  return items
    .map((item) => {
      const rawSignals = options.getSignals(item).map(normalize).filter(Boolean);
      const signals = uniq(rawSignals.flatMap((signal) => tokenize(signal)));
      const scores = tokens.map((token) => getSignalScore(token, signals));
      const baseScore = scores.reduce((sum, score) => sum + score, 0);
      const boost = options.getBoost?.(item) ?? 0;
      const score = baseScore + boost;
      const matchedTerms = tokens.filter((token) =>
        signals.some((signal) => signal.includes(token)),
      );

      return { item, score, matchedTerms };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, options.limit ?? 20);
}

export function searchFlixoTools(query: string, limit = 20): SearchResult<PublicSearchTool>[] {
  return searchItems(searchableTools as PublicSearchTool[], query, {
    getSignals: (tool) => [
      tool.name,
      tool.description,
      tool.slug,
    ],
    limit,
  });
}

export function searchToolSlugs(query: string, slugs: string[] = [...searchableToolSlugs]): SearchResult<string>[] {
  const allowed = new Set(searchableToolSlugs);
  const publicSlugs = slugs.filter((slug) => allowed.has(slug));
  return searchItems(publicSlugs, query, {
    getSignals: (slug) => [slug.replace(/-/g, " ")],
  });
}

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem("flixo_recent_searches");
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.slice(0, 20) : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(query: string): void {
  if (typeof window === "undefined" || !query.trim()) return;
  try {
    const existing = getRecentSearches().filter((item) => item !== query);
    window.localStorage.setItem(
      "flixo_recent_searches",
      JSON.stringify([query, ...existing].slice(0, 20)),
    );
  } catch {
    // ignore storage errors
  }
}

export function getPopularSearches(): string[] {
  return [
    "translate this pdf",
    "remove image background",
    "compress mp4",
    "generate qr code",
    "summarize article",
  ];
}
