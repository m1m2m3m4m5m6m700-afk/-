export interface Language {
  code: string;
  name: string;
  nativeName: string;
  direction: "ltr" | "rtl";
  flag: string;
}

export const LANGUAGES: Language[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    direction: "ltr",
    flag: "🇺🇸",
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    direction: "rtl",
    flag: "🇸🇦",
  },
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    direction: "ltr",
    flag: "🇪🇸",
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    direction: "ltr",
    flag: "🇫🇷",
  },
  {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    direction: "ltr",
    flag: "🇩🇪",
  },
  {
    code: "pt",
    name: "Portuguese",
    nativeName: "Português",
    direction: "ltr",
    flag: "🇧🇷",
  },
  {
    code: "ru",
    name: "Russian",
    nativeName: "Русский",
    direction: "ltr",
    flag: "🇷🇺",
  },
  {
    code: "zh",
    name: "Chinese",
    nativeName: "中文",
    direction: "ltr",
    flag: "🇨🇳",
  },
  {
    code: "ja",
    name: "Japanese",
    nativeName: "日本語",
    direction: "ltr",
    flag: "🇯🇵",
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    direction: "ltr",
    flag: "🇮🇳",
  },
  {
    code: "it",
    name: "Italian",
    nativeName: "Italiano",
    direction: "ltr",
    flag: "🇮🇹",
  },
  {
    code: "nl",
    name: "Dutch",
    nativeName: "Nederlands",
    direction: "ltr",
    flag: "🇳🇱",
  },
  {
    code: "ko",
    name: "Korean",
    nativeName: "한국어",
    direction: "ltr",
    flag: "🇰🇷",
  },
  {
    code: "pl",
    name: "Polish",
    nativeName: "Polski",
    direction: "ltr",
    flag: "🇵🇱",
  },
  {
    code: "uk",
    name: "Ukrainian",
    nativeName: "Українська",
    direction: "ltr",
    flag: "🇺🇦",
  },
  {
    code: "sv",
    name: "Swedish",
    nativeName: "Svenska",
    direction: "ltr",
    flag: "🇸🇪",
  },
  {
    code: "no",
    name: "Norwegian",
    nativeName: "Norsk",
    direction: "ltr",
    flag: "🇳🇴",
  },
  {
    code: "da",
    name: "Danish",
    nativeName: "Dansk",
    direction: "ltr",
    flag: "🇩🇰",
  },
  {
    code: "fi",
    name: "Finnish",
    nativeName: "Suomi",
    direction: "ltr",
    flag: "🇫🇮",
  },
  {
    code: "cs",
    name: "Czech",
    nativeName: "Čeština",
    direction: "ltr",
    flag: "🇨🇿",
  },
  {
    code: "ro",
    name: "Romanian",
    nativeName: "Română",
    direction: "ltr",
    flag: "🇷🇴",
  },
  {
    code: "hu",
    name: "Hungarian",
    nativeName: "Magyar",
    direction: "ltr",
    flag: "🇭🇺",
  },
  {
    code: "el",
    name: "Greek",
    nativeName: "Ελληνικά",
    direction: "ltr",
    flag: "🇬🇷",
  },
  {
    code: "he",
    name: "Hebrew",
    nativeName: "עברית",
    direction: "rtl",
    flag: "🇮🇱",
  },
  {
    code: "id",
    name: "Indonesian",
    nativeName: "Bahasa Indonesia",
    direction: "ltr",
    flag: "🇮🇩",
  },
  {
    code: "ms",
    name: "Malay",
    nativeName: "Bahasa Melayu",
    direction: "ltr",
    flag: "🇲🇾",
  },
  {
    code: "vi",
    name: "Vietnamese",
    nativeName: "Tiếng Việt",
    direction: "ltr",
    flag: "🇻🇳",
  },
  {
    code: "th",
    name: "Thai",
    nativeName: "ไทย",
    direction: "ltr",
    flag: "🇹🇭",
  },
  {
    code: "bn",
    name: "Bengali",
    nativeName: "বাংলা",
    direction: "ltr",
    flag: "🇧🇩",
  },
  {
    code: "ur",
    name: "Urdu",
    nativeName: "اردو",
    direction: "rtl",
    flag: "🇵🇰",
  },
];

export const AUTO_DETECT = "auto";

export const MAX_CHARS = 5000;

export function languageName(code: string) {
  if (code === AUTO_DETECT) return "Auto detect";
  return LANGUAGES.find((l) => l.code === code)?.name ?? code;
}

/** Very rough script-based detection, good enough for the mock engine. */
export function detectLanguage(text: string): string {
  const checks: Array<[RegExp, string]> = [
    [/[\u4e00-\u9fff]/, "zh"],
    [/[\u3040-\u30ff]/, "ja"],
    [/[\uac00-\ud7af]/, "ko"],
    [/[\u0600-\u06ff]/, "ar"],
    [/[\u0590-\u05ff]/, "he"],
    [/[\u0900-\u097f]/, "hi"],
    [/[\u0980-\u09ff]/, "bn"],
    [/[\u0400-\u04ff]/, "ru"],
  ];
  for (const [re, code] of checks) if (re.test(text)) return code;

  const lower = ` ${text.toLowerCase()} `;
  const hints: Array<[string[], string]> = [
    [[" el ", " los ", " que ", " pero ", " gracias"], "es"],
    [[" le ", " les ", " est ", " bonjour", " merci"], "fr"],
    [[" der ", " und ", " nicht ", " danke"], "de"],
    [[" il ", " che ", " grazie", " sono "], "it"],
    [[" você", " obrigado", " não "], "pt"],
  ];
  for (const [words, code] of hints) {
    if (words.some((w) => lower.includes(w))) return code;
  }
  return "en";
}

export interface TranslationResult {
  text: string;
  detectedSource: string;
}

/**
 * Mock translation engine. Swap this implementation for a real API call
 * later — the signature is all the UI depends on.
 */
export async function translateText(params: {
  text: string;
  from: string;
  to: string;
  signal?: AbortSignal;
}): Promise<TranslationResult> {
  const { text, from, to, signal } = params;

  await new Promise<void>((resolve, reject) => {
    const id = setTimeout(resolve, 900 + Math.random() * 600);
    signal?.addEventListener("abort", () => {
      clearTimeout(id);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

  if (!text.trim()) throw new Error("Enter some text to translate.");
  if (text.length > MAX_CHARS) throw new Error(`Text is limited to ${MAX_CHARS} characters.`);
  if (/^\s*fail\s*$/i.test(text))
    throw new Error("The translation service is unavailable. Please try again.");

  const detectedSource = from === AUTO_DETECT ? detectLanguage(text) : from;

  if (detectedSource === to) {
    return { text, detectedSource };
  }

  const translated = text
    .split(/(\s+)/)
    .map((token) => (/^\s+$/.test(token) ? token : mockWord(token, to)))
    .join("");

  return { text: translated, detectedSource };
}

const SUFFIX: Record<string, string> = {
  es: "o",
  fr: "e",
  de: "en",
  it: "i",
  pt: "ão",
  nl: "en",
  sv: "et",
  pl: "ski",
  tr: "lar",
  id: "kan",
};

function mockWord(word: string, to: string) {
  const core = word.replace(/[^\p{L}\p{N}']/gu, "");
  if (!core) return word;
  const punct = word.slice(core.length ? word.indexOf(core) + core.length : 0);
  const lead = word.slice(0, word.indexOf(core));

  let out: string;
  if (["ar", "he", "hi", "bn", "ru", "uk", "zh", "ja", "ko"].includes(to)) {
    out = transliterate(core, to);
  } else {
    out = core + (SUFFIX[to] ?? "");
  }
  if (core[0] === core[0]?.toUpperCase()) out = out.charAt(0).toUpperCase() + out.slice(1);
  return lead + out + punct;
}

const SCRIPTS: Record<string, string> = {
  ru: "абвгдеж зийклмнопрстуфхцчшщэюя",
  uk: "абвгдеєжзийклмнопрстуфхцчшщюя",
  ar: "ابتثجحخدذرزسشصضطظعغفقكلمنهوي",
  he: "אבגדהוזחטיכלמנסעפצקרשת",
  hi: "अआइईउऊएऐओऔकखगघचछजझटठडढणतथदधनपफबभमयरलवशषसह",
  bn: "অআইঈউঊএঐওঔকখগঘচছজঝটঠডঢণতথদধনপফবভমযরলশষসহ",
  zh: "语言翻译文本快速智能工具内容世界数据",
  ja: "翻訳言葉文章速いスマート道具内容世界",
  ko: "번역언어문장빠른스마트도구내용세계",
};

function transliterate(word: string, to: string) {
  const alphabet = SCRIPTS[to] ?? "";
  if (!alphabet) return word;
  const chars = [...alphabet];
  let seed = 0;
  for (const ch of word) seed = (seed * 31 + ch.charCodeAt(0)) % 100000;
  const len = ["zh", "ja", "ko"].includes(to)
    ? Math.max(1, Math.ceil(word.length / 3))
    : word.length;
  let out = "";
  for (let i = 0; i < len; i++) {
    seed = (seed * 1103515245 + 12345 + i) % 2147483648;
    out += chars[seed % chars.length];
  }
  return out;
}
