import type { LocaleCode } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import type { Tool } from "@/data/tools";

/**
 * Search-intent aliases map natural user language back to one canonical tool.
 *
 * Official UI copy remains professional; colloquial/dialect phrases live only
 * in the discovery layer. This prevents slang from leaking into page copy while
 * still letting users search the way they actually speak.
 */
const CURATED_ALIASES: Partial<Record<LocaleCode, Record<string, string[]>>> = {
  ar: {
    "image-compressor": [
      "ضغط الصور",
      "تصغير الصور",
      "تصغير حجم الصور",
      "تقليل حجم الصورة",
      "الصورة حجمها كبير",
      "حجم الصورة كبير",
      "ازاي اصغر الصورة",
      "ازاي اصغر حجم الصورة",
      "كيف اصغر حجم الصورة",
      "كيف أقلل حجم الصورة",
    ],
    "image-enhancer": [
      "تحسين جودة الصورة",
      "تحسين الصورة",
      "توضيح الصورة",
      "تكبير الصورة",
      "عايز احسن جودة الصورة",
      "عايز اوضح الصورة",
    ],
    "background-remover": [
      "إزالة خلفية الصورة",
      "حذف خلفية الصورة",
      "قص الخلفية",
      "شيل الخلفية",
      "عايز أشيل خلفية الصورة",
    ],
    translator: [
      "ترجمة النص",
      "ترجم الكلام",
      "ترجم لي الكلام",
      "عايز أترجم نص",
      "ترجمة من انجليزي لعربي",
      "ترجمة من عربي لانجليزي",
    ],
    "qr-generator": [
      "عمل qr",
      "انشاء كيو ار",
      "اعمل qr code",
      "اعمل كود qr",
      "تحويل رابط إلى qr",
    ],
    "password-generator": [
      "عمل باسورد قوي",
      "توليد باسورد",
      "كلمة سر قوية",
      "اعمل كلمة مرور",
    ],
    "word-counter": ["عد الكلمات", "حساب عدد الكلمات", "كم كلمة في النص", "عدد حروف النص"],
    "json-formatter": ["تنسيق json", "ترتيب json", "ظبط json", "تنسيق ملف json"],
    calculator: ["احسب", "آلة حاسبة", "حاسبة", "عايز أحسب"],
    "pdf-to-text": ["تحويل pdf إلى نص", "استخراج النص من pdf", "اخراج الكلام من pdf"],
  },
  en: {
    "image-compressor": [
      "compress an image",
      "shrink an image",
      "reduce image size",
      "make image smaller",
      "make this picture smaller",
      "reduce photo file size",
    ],
    "image-enhancer": [
      "improve image quality",
      "make photo clearer",
      "sharpen a photo",
      "increase image resolution",
    ],
    "background-remover": [
      "remove image background",
      "remove photo background",
      "cut out the background",
      "make background transparent",
    ],
    translator: ["translate this", "translate text", "translate some text", "change language"],
    "qr-generator": ["make a qr code", "create qr", "turn a link into a qr code"],
    "password-generator": ["make a strong password", "generate password", "create secure password"],
    "word-counter": ["count words", "how many words", "count characters"],
    "json-formatter": ["format json", "pretty print json", "clean up json"],
  },
};

export interface LocalizedSearchTerms {
  locale: LocaleCode;
  terms: string[];
}

function normalize(value: string): string {
  return value
    .toLocaleLowerCase()
    .normalize("NFKC")
    .replace(/[\u200e\u200f\u061c]/g, "")
    .replace(/[^\p{L}\p{N}\s._/-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function unique(values: string[]): string[] {
  return [...new Set(values.map(normalize).filter(Boolean))];
}

/**
 * Builds search terms for a canonical tool using the current locale dictionary
 * plus curated natural-language aliases. Missing localized terms simply fall
 * back to the canonical English registry; search remains useful without
 * pretending a locale has translations that do not exist.
 */
export function getToolSearchTerms(tool: Tool, locale: LocaleCode): LocalizedSearchTerms {
  const dict = getDictionary(locale);
  const nameKey = `tool.${tool.slug ?? tool.id}.name` as keyof typeof dict;
  const taglineKey = `tool.${tool.slug ?? tool.id}.tagline` as keyof typeof dict;
  const englishName = getDictionary("en")[nameKey];
  const englishTagline = getDictionary("en")[taglineKey];
  const localizedName = dict[nameKey];
  const localizedTagline = dict[taglineKey];
  const aliases = CURATED_ALIASES[locale]?.[tool.slug ?? tool.id] ?? [];

  return {
    locale,
    terms: unique([
      tool.name,
      tool.description,
      ...(tool.tags ?? []),
      englishName,
      englishTagline,
      localizedName,
      localizedTagline,
      ...aliases,
    ].filter((v): v is string => typeof v === "string")),
  };
}

/** Return the strongest exact/phrase aliases for a ready-tool catalogue. */
export function getSearchIntentIndex(tools: Tool[], locales: readonly LocaleCode[]) {
  return locales.flatMap((locale) =>
    tools
      .filter((tool) => tool.status === "ready")
      .map((tool) => ({ toolId: tool.id, slug: tool.slug, ...getToolSearchTerms(tool, locale) })),
  );
}
