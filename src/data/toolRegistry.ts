import { Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toolRoute, tools, type Tool, type ToolStatus } from "./tools";
import { categories, categoryById, type CategoryId } from "./categories";
import { searchItems } from "@/lib/search";

export interface ToolRegistryItem {
  id: string;
  slug?: string;
  title: string;
  description: string;
  category: CategoryId;
  categoryName: string;
  subcategory: string;
  collection?: string;
  tags: string[];
  keywords: string[];
  synonyms: string[];
  intentKeywords: string[];
  status: ToolStatus;
  popularity: number;
  difficulty: number;
  icon: LucideIcon;
  route?: string;
  searchWeight: number;
  relatedTools: string[];
  similarTools: string[];
  original: Tool;
}

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (value: string): string[] =>
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

const uniq = <T>(values: T[]): T[] => Array.from(new Set(values));

const categorySubcategory = (tool: Tool): string => {
  const tags = tool.tags ?? [];
  switch (tool.categoryId) {
    case "translation":
      if (tool.id.includes("pdf") || tags.includes("pdf")) return "Document Translation";
      if (tool.id.includes("voice") || tags.includes("speech")) return "Speech Translation";
      if (tool.id.includes("image") || tags.includes("ocr")) return "Image Translation";
      if (tool.id.includes("subtitle")) return "Subtitle Translation";
      if (tool.id.includes("website")) return "Website Translation";
      return "Text Translation";
    case "images":
      if (tags.some((tag) => ["convert", "jpg", "png", "webp", "avif"].includes(tag)))
        return "Conversion";
      if (tags.some((tag) => ["background", "remove", "replace", "cutout"].includes(tag)))
        return "AI Editing";
      if (tags.some((tag) => ["upscale", "compress", "sharpen", "blur", "resize"].includes(tag)))
        return "Optimization";
      return "Image Tools";
    case "pdf":
      if (tags.some((tag) => ["merge", "split", "extract", "rotate"].includes(tag)))
        return "PDF Management";
      if (tags.some((tag) => ["convert", "jpg", "docx", "xlsx", "pptx"].includes(tag)))
        return "PDF Conversion";
      return "PDF Tools";
    case "writing":
      return "Writing Assistant";
    case "video":
      if (tags.some((tag) => ["compress", "trim", "merge", "convert", "gif"].includes(tag)))
        return "Video Editing";
      if (tags.some((tag) => ["subtitle", "captions"].includes(tag)))
        return "Captions & Transcription";
      return "Video Tools";
    case "audio":
      return "Audio Processing";
    case "files":
      return "File Utilities";
    case "utilities":
      return "Utility Helpers";
    case "converters":
      return "Converters";
    case "calculators":
      return "Calculators";
    case "web":
      return "Web Utilities";
    case "chrome":
      return "Browser Extensions";
    case "developer":
      return "Developer Tools";
    case "ai":
      return "AI Assistants";
    case "future":
      return "Future Features";
    default:
      return "General";
  }
};

const toolCollection = (tool: Tool): string | undefined => {
  const tags = tool.tags ?? [];
  if (tool.categoryId === "ai" || tags.includes("ai")) return "AI Powered";
  if (tags.includes("generator")) return "Generators";
  if (tags.includes("translate")) return "Translation";
  if (tags.includes("convert")) return "Conversion";
  if (tags.includes("compress") || tags.includes("optimize")) return "Optimization";
  if (tags.includes("analyze")) return "Analysis";
  if (tags.includes("security") || tags.includes("password")) return "Security";
  return undefined;
};

const buildKeywords = (
  tool: Tool,
  categoryName: string,
  subcategory: string,
  collection?: string,
) => {
  const rawKeywords = [
    ...(tool.tags ?? []),
    tool.name,
    tool.slug,
    tool.description,
    categoryName,
    subcategory,
    collection,
  ];
  return uniq(
    rawKeywords
      .filter((value): value is string => typeof value === "string" && value.length > 0)
      .map((value) => normalize(value)),
  ).flatMap((value) => tokenize(value));
};

const buildSynonyms = (tool: Tool) => {
  const base = [tool.name, tool.slug ?? "", ...(tool.tags ?? [])];
  const synonyms = base
    .filter(Boolean)
    .map((value) => normalize(value).replace(/-/g, " "))
    .flatMap((value) => value.split(" ").filter((token) => token.length > 2));
  return uniq(synonyms);
};

const buildIntentKeywords = (
  tool: Tool,
  categoryName: string,
  subcategory: string,
  collection?: string,
) => {
  const extra = [categoryName, subcategory, collection].filter(Boolean) as string[];
  return uniq([
    ...(tool.tags ?? []),
    ...buildSynonyms(tool),
    ...extra.map(normalize).flatMap((value) => tokenize(value)),
  ]);
};

const popularityScore = (tool: Tool): number => {
  if (tool.status === "ready") return 70;
  if (tool.status === "planned") return 40;
  return 15;
};

const difficultyScore = (tool: Tool): number => {
  switch (tool.categoryId) {
    case "developer":
    case "ai":
    case "video":
    case "images":
      return 4;
    case "pdf":
    case "audio":
    case "web":
    case "chrome":
      return 3;
    default:
      return 2;
  }
};

const getToolSignals = (tool: ToolRegistryItem) =>
  uniq(
    [
      tool.title,
      tool.description,
      tool.categoryName,
      tool.subcategory,
      tool.collection ?? "",
      ...tool.tags,
      ...tool.keywords,
      ...tool.synonyms,
      ...tool.intentKeywords,
    ].map(normalize),
  );

const compareSimilarity = (a: ToolRegistryItem, b: ToolRegistryItem) => {
  const tagOverlap = a.tags.filter((tag) => b.tags.includes(tag)).length;
  const keywordOverlap = a.keywords.filter((keyword) => b.keywords.includes(keyword)).length;
  const categoryBonus = a.category === b.category ? 1 : 0;
  const statusBonus = b.status === "ready" ? 1 : 0;
  return tagOverlap * 2 + keywordOverlap + categoryBonus + statusBonus;
};

const createRegistryEntry = (tool: Tool): ToolRegistryItem => {
  const category = categoryById?.get(tool.categoryId);
  const categoryName = category?.name ?? tool.categoryId;
  const subcategory = categorySubcategory(tool);
  const collection = toolCollection(tool);

  return {
    id: tool.id,
    slug: tool.slug,
    title: tool.name,
    description: tool.description,
    category: tool.categoryId,
    categoryName,
    subcategory,
    collection,
    tags: tool.tags ?? [],
    keywords: buildKeywords(tool, categoryName, subcategory, collection),
    synonyms: buildSynonyms(tool),
    intentKeywords: buildIntentKeywords(tool, categoryName, subcategory, collection),
    status: tool.status,
    popularity: popularityScore(tool),
    difficulty: difficultyScore(tool),
    icon: category?.icon ?? Sparkles,
    route: toolRoute(tool),
    searchWeight: tool.status === "ready" ? 1.2 : 0.8,
    relatedTools: [],
    similarTools: [],
    original: tool,
  };
};

// Only "ready" tools are exposed publicly. Stub/placeholder/mock tools are
// excluded from search, categories, featured collections, related tools, and
// every other registry-derived surface so they can never reach users.
const registry: ToolRegistryItem[] = tools
  .map(createRegistryEntry)
  .filter((item) => item.status === "ready");

const registryMap = new Map<string, ToolRegistryItem>(registry.map((item) => [item.id, item]));
const registrySlugMap = new Map<string, ToolRegistryItem>(
  registry.filter((item) => item.slug).map((item) => [item.slug as string, item]),
);

const withRelations = registry.map((tool) => {
  const related = registry
    .filter((other) => other.category === tool.category && other.id !== tool.id)
    .sort((a, b) => compareSimilarity(tool, b) - compareSimilarity(tool, a))
    .slice(0, 6)
    .map((item) => item.id);

  const similar = registry
    .filter((other) => other.id !== tool.id)
    .sort((a, b) => compareSimilarity(tool, b) - compareSimilarity(tool, a))
    .slice(0, 6)
    .map((item) => item.id);

  return {
    ...tool,
    relatedTools: related,
    similarTools: similar,
  };
});

export const toolRegistry = withRelations;
export const toolRegistryById = new Map<string, ToolRegistryItem>(
  withRelations.map((tool) => [tool.id, tool]),
);
export const toolRegistryBySlug = new Map<string, ToolRegistryItem>(
  withRelations.filter((tool) => tool.slug).map((tool) => [tool.slug as string, tool]),
);

export const getRegistryToolById = (id: string) => toolRegistryById.get(id);
export const getRegistryToolBySlug = (slug: string) => toolRegistryBySlug.get(slug);

export const toolsByCategoryRegistry = new Map<CategoryId, ToolRegistryItem[]>(
  categories.map((category) => [
    category.id,
    withRelations.filter((tool) => tool.category === category.id),
  ]),
);

export const getRegistryToolsByCategory = (categoryId: CategoryId) =>
  toolsByCategoryRegistry.get(categoryId) ?? [];

export const getRegistryToolsBySubcategory = (subcategory: string) =>
  withRelations.filter((tool) => tool.subcategory === subcategory);

export const searchRegistryTools = (query: string) =>
  searchItems(withRelations, query, {
    getSignals: (tool) => getToolSignals(tool),
    getBoost: (tool) => tool.popularity * tool.searchWeight * 0.01,
    limit: 20,
  });

export const getFeaturedCollections = () => [
  {
    id: "ai-powered",
    title: "AI Powered",
    description: "Tools enhanced by AI for smarter automation and faster workflows.",
    toolIds: withRelations
      .filter((tool) => tool.collection === "AI Powered")
      .map((tool) => tool.id),
  },
  {
    id: "optimizers",
    title: "Optimization Tools",
    description: "Tools for speeding up media, reducing file size, and improving quality.",
    toolIds: withRelations
      .filter((tool) => tool.collection === "Optimization")
      .map((tool) => tool.id),
  },
  {
    id: "conversion",
    title: "Conversion Tools",
    description: "Convert documents, media, and formats with a single click.",
    toolIds: withRelations
      .filter((tool) => tool.collection === "Conversion")
      .map((tool) => tool.id),
  },
];

export const getTrendingTools = () =>
  [...withRelations]
    .filter((tool) => tool.status === "ready")
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 12);

export const getPopularTools = () =>
  [...withRelations]
    .filter((tool) => tool.status === "ready")
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 12);

export const getRecentlyAddedTools = () =>
  [...withRelations]
    .filter((tool) => tool.status === "ready")
    .slice(-12)
    .reverse();

export const getBestForBeginners = () =>
  withRelations.filter((tool) => tool.status === "ready" && tool.difficulty <= 2).slice(0, 12);

export const getProfessionalTools = () =>
  withRelations.filter((tool) => tool.status === "ready" && tool.difficulty >= 4).slice(0, 12);

export const getAIPoweredTools = () =>
  withRelations.filter((tool) => tool.collection === "AI Powered").slice(0, 12);

export const getBrowserBasedTools = () => withRelations.filter((tool) => tool.route).slice(0, 12);

export const getFastTools = () =>
  withRelations
    .filter((tool) => tool.tags.some((tag) => ["fast", "quick", "instant"].includes(tag)))
    .slice(0, 12);
