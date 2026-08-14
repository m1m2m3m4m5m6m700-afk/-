export interface UserIntent {
  rawPrompt: string;
  cleanPrompt: string;
  tokens: string[];
  actionKeywords: string[];
  detectedFileTypes: string[];
  hasUrl: boolean;
  urls: string[];
  hasAttachment: boolean;
  attachmentType?: string;
  languageDetected?: string;
}

const ACTION_VERBS = [
  "translate",
  "compress",
  "enhance",
  "upscale",
  "remove",
  "generate",
  "create",
  "convert",
  "summarize",
  "merge",
  "split",
  "format",
  "transcribe",
  "trim",
  "calculate",
  "draft",
  "fix",
  "proofread",
  "shorten",
  "inspect",
];

const FILE_TYPES = [
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "webp",
  "gif",
  "mp4",
  "mp3",
  "wav",
  "ogg",
  "srt",
  "vtt",
  "json",
  "csv",
  "zip",
  "rar",
  "7z",
  "docx",
  "word",
];

const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

function detectLanguage(text: string): string | undefined {
  if (!text.trim()) return undefined;

  if (/[\u4e00-\u9fff]/u.test(text)) return "zh-CN";
  if (/[\u3040-\u30ff]/u.test(text)) return "ja";
  if (/[\uac00-\ud7af]/u.test(text)) return "ko";
  if (/[\u0900-\u097f]/u.test(text)) return "hi";
  if (/[\u0980-\u09ff]/u.test(text)) return "bn";
  if (/[\u0590-\u05ff]/u.test(text)) return "he";
  if (/[\u0400-\u04ff]/u.test(text)) return "ru";
  if (/[\u0e00-\u0e7f]/u.test(text)) return "th";
  if (/[\u1ea0-\u1eff]/u.test(text)) return "vi";

  // Arabic-script languages need a small distinction because Arabic, Persian,
  // and Urdu share most code points. These additional letters are strong hints.
  if (/[\u067e\u0686\u0698\u06af]/u.test(text)) return "fa";
  if (/[\u0679\u0688\u0691\u06ba\u06c1]/u.test(text)) return "ur";
  if (/[\u0600-\u06ff]/u.test(text)) return "ar";

  return undefined;
}

export function extractIntent(
  rawPrompt: string,
  options?: {
    hasAttachment?: boolean;
    attachmentType?: string;
    url?: string;
    locale?: string;
  },
): UserIntent {
  const cleanPrompt = rawPrompt
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[\u200e\u200f\u061c]/g, "")
    .replace(/[^\p{L}\p{N}\s:/.]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  const tokens = cleanPrompt.split(" ").filter((t) => t.length > 1);

  const actionKeywords = tokens.filter((token) =>
    ACTION_VERBS.some((verb) => token.includes(verb) || verb.includes(token)),
  );

  const detectedFileTypes = FILE_TYPES.filter((type) => cleanPrompt.includes(type));

  const extractedUrls: string[] = rawPrompt.match(URL_REGEX) || [];
  if (options?.url && !extractedUrls.includes(options.url)) {
    extractedUrls.push(options.url);
  }

  return {
    rawPrompt,
    cleanPrompt,
    tokens,
    actionKeywords,
    detectedFileTypes,
    hasUrl: extractedUrls.length > 0,
    urls: extractedUrls,
    hasAttachment: Boolean(options?.hasAttachment),
    attachmentType: options?.attachmentType,
    languageDetected: options?.locale || detectLanguage(rawPrompt),
  };
}
