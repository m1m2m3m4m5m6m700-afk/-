import { categories, categoryById, type Category, type CategoryId } from "@/data/categories";
import { getTool, tools, toolsByCategory, type Tool } from "@/data/tools";

/** Result of a classification: either a category match or a fallback. */
export interface ClassificationMatch {
  kind: "match";
  category: Category;
  /** Best tool to send the user to, if the category has one. */
  tool?: Tool;
  /** Confidence 0-1, derived from how many signals matched. */
  confidence: number;
  matchedKeywords: string[];
}

export interface ClassificationFallback {
  kind: "fallback";
  /** Always true — the UI should open the "Request a Tool" flow. */
  requestTool: true;
  matchedKeywords: [];
}

export type ClassificationResult = ClassificationMatch | ClassificationFallback;

/** Extra intent keywords per category, on top of tool names/tags/descriptions. */
const KEYWORDS: Record<CategoryId, string[]> = {
  translation: [
    "translate",
    "translation",
    "language",
    "arabic",
    "english",
    "french",
    "spanish",
    "subtitle",
    "ترجم",
    "ترجمة",
    "لغة",
  ],
  images: [
    "image",
    "photo",
    "picture",
    "logo",
    "upscale",
    "background",
    "png",
    "jpg",
    "صورة",
    "صور",
  ],
  pdf: ["pdf", "document", "merge", "split", "docx", "word", "مستند", "ملف pdf"],
  writing: [
    "write",
    "writing",
    "summarize",
    "summary",
    "rewrite",
    "draft",
    "email",
    "article",
    "blog",
    "grammar",
    "اكتب",
    "لخص",
    "كتابة",
  ],
  video: ["video", "clip", "mp4", "gif", "captions", "trim", "فيديو"],
  audio: ["audio", "sound", "voice", "speech", "transcribe", "mp3", "podcast", "صوت"],
  files: ["file", "zip", "archive", "unzip", "folder", "metadata", "ملفات"],
  utilities: ["qr", "password", "uuid", "random", "diff", "compare", "أداة"],
  converters: [
    "convert",
    "converter",
    "unit",
    "currency",
    "base64",
    "csv",
    "encode",
    "decode",
    "حول",
    "تحويل",
  ],
  calculators: [
    "calculate",
    "calculator",
    "percentage",
    "percent",
    "loan",
    "interest",
    "bmi",
    "احسب",
    "حاسبة",
  ],
  web: ["url", "link", "website", "seo", "meta", "sitemap", "headers", "domain", "موقع"],
  chrome: ["chrome", "extension", "browser", "tab", "productivity", "google chrome", "متصفح"],
  developer: ["json", "regex", "jwt", "cron", "code", "api", "developer", "format", "برمجة", "كود"],
  ai: ["ai", "chat", "assistant", "prompt", "gpt", "insight", "ذكاء"],
  future: ["workflow", "automation", "team", "roadmap", "integration"],
};

const STATUS_RANK: Record<Tool["status"], number> = { ready: 0, planned: 1, placeholder: 2 };

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Every searchable signal for a tool, pre-normalized. */
const toolSignals = (tool: Tool): string[] =>
  [tool.name, ...(tool.tags ?? []), tool.slug ?? "", tool.description]
    .map(normalize)
    .filter(Boolean);

/** Ranks tools inside a category: ready first, then keyword overlap. */
function pickTool(categoryId: CategoryId, text: string): Tool | undefined {
  const candidates = toolsByCategory(categoryId).filter((t) => t.status === "ready");
  if (candidates.length === 0) return undefined;

  const scored = candidates.map((tool) => {
    const hits = toolSignals(tool).filter((signal) => text.includes(signal)).length;
    const nameHit = text.includes(normalize(tool.name)) ? 2 : 0;
    return { tool, score: hits + nameHit };
  });

  scored.sort(
    (a, b) => b.score - a.score || STATUS_RANK[a.tool.status] - STATUS_RANK[b.tool.status],
  );

  const best = scored[0];
  if (best.score > 0) return best.tool;
  // No direct hit — offer the most usable tool in the category.
  return [...candidates].sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status])[0];
}

/**
 * Frontend-only mock classifier. Maps a free-text intent onto a category and
 * a suggested tool, or falls back to the "Request a Tool" flow.
 */
export function classifyIntent(prompt: string): ClassificationResult {
  const text = normalize(prompt);
  if (!text) return { kind: "fallback", requestTool: true, matchedKeywords: [] };

  const scores = categories.map((category) => {
    const matched = new Set<string>();

    for (const keyword of KEYWORDS[category.id]) {
      if (text.includes(normalize(keyword))) matched.add(keyword);
    }
    for (const tool of toolsByCategory(category.id).filter((t) => t.status === "ready")) {
      for (const signal of toolSignals(tool)) {
        if (signal.length > 2 && text.includes(signal)) matched.add(signal);
      }
    }

    return { category, matched: [...matched] };
  });

  scores.sort((a, b) => b.matched.length - a.matched.length || a.category.order - b.category.order);
  const best = scores[0];

  if (!best || best.matched.length === 0) {
    return { kind: "fallback", requestTool: true, matchedKeywords: [] };
  }

  return {
    kind: "match",
    category: best.category,
    tool: pickTool(best.category.id, text),
    confidence: Math.min(1, 0.4 + best.matched.length * 0.2),
    matchedKeywords: best.matched.slice(0, 5),
  };
}

/** Convenience lookups for UI layers. */
export const resolveCategory = (id: CategoryId) => categoryById.get(id);
export const resolveTool = (id: string) => getTool(id);
export const allTools = tools;
