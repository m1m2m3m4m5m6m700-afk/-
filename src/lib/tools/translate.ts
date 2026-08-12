import { generate } from "@/lib/ai/server/generate";

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

/** Rough script-based detection, used as a reliable local source hint. */
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
 * Translate text via the existing Flixo AI layer (`translator` task).
 *
 * The signature stays compatible with the Translator UI. The server-side
 * `generate` RPC runs the OpenAI-backed provider chain; on any failure
 * (AI not configured, provider error, network error, empty/invalid output)
 * this throws an Error — it never returns a fake or fallback translation.
 *
 * Note on cancellation: the `generate` server fn does not currently forward
 * an AbortSignal, so `signal` is honored locally (rejects with AbortError as
 * soon as it fires) rather than aborting the upstream request. Wiring the
 * signal end-to-end would require extending the RPC/AI-service contract and
 * is intentionally left out of this change.
 */
export async function translateText(params: {
  text: string;
  from: string;
  to: string;
  signal?: AbortSignal;
}): Promise<TranslationResult> {
  const { text, from, to, signal } = params;

  if (!text.trim()) throw new Error("Enter some text to translate.");
  if (text.length > MAX_CHARS) throw new Error(`Text is limited to ${MAX_CHARS} characters.`);

  const detectedSource = from === AUTO_DETECT ? detectLanguage(text) : from;

  if (detectedSource === to) {
    return { text, detectedSource };
  }

  const input =
    `Translate the following text into ${languageName(to)}. ` +
    `Keep the original meaning, tone, and formatting (including line breaks). ` +
    `Return only the translation with no explanations or quotation marks.\n\n` +
    `Text:\n${text}`;

  const res = await raceWithAbort(generate({ data: { taskId: "translator", input } }), signal);

  if (!res.ok) {
    throw new Error(res.message || "Translation failed. Please try again.");
  }

  const translated = res.content?.trim();
  if (!translated) {
    throw new Error("The translation service returned an empty response. Please try again.");
  }

  return { text: translated, detectedSource };
}

function raceWithAbort<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(new DOMException("Aborted", "AbortError"));
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => {
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (err) => {
        signal.removeEventListener("abort", onAbort);
        reject(err);
      },
    );
  });
}
