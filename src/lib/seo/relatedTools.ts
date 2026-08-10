import { getToolBySlug, tools, type Tool } from "@/data/tools";
import { getToolSeo } from "@/data/toolSeo";

function tokenize(values: string[]) {
  return new Set(
    values
      .flatMap((value) => value.toLowerCase().split(/[^a-z0-9]+/g))
      .map((token) => token.trim())
      .filter((token) => token.length >= 3),
  );
}

export function getSuggestedRelatedTools(slug: string, limit = 6): Tool[] {
  const current = getToolBySlug(slug) || tools.find((tool) => tool.id === slug);
  if (!current) return [];

  const seo = getToolSeo(slug);
  const currentTokens = tokenize([
    current.name,
    current.description,
    ...(current.tags ?? []),
    ...seo.keywords,
  ]);

  return tools
    .filter(
      (candidate) => candidate.id !== current.id && candidate.slug && candidate.status === "ready",
    )
    .map((candidate) => {
      const candidateSeo = getToolSeo(candidate.slug!);
      const candidateTokens = tokenize([
        candidate.name,
        candidate.description,
        ...(candidate.tags ?? []),
        ...candidateSeo.keywords,
      ]);

      let score = 0;
      if (candidate.categoryId === current.categoryId) score += 5;

      const sharedTags = (candidate.tags ?? []).filter((tag) =>
        (current.tags ?? []).includes(tag),
      ).length;
      score += sharedTags * 3;

      let tokenOverlap = 0;
      candidateTokens.forEach((token) => {
        if (currentTokens.has(token)) tokenOverlap += 1;
      });
      score += Math.min(tokenOverlap, 5);

      if (candidate.status === "ready") score += 0.5;

      return { candidate, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.candidate.name.localeCompare(b.candidate.name))
    .map((entry) => entry.candidate)
    .filter((candidate, index, arr) => arr.findIndex((item) => item.id === candidate.id) === index)
    .slice(0, limit);
}
