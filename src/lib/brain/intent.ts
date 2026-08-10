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

export function extractIntent(
  rawPrompt: string,
  options?: {
    hasAttachment?: boolean;
    attachmentType?: string;
    url?: string;
  },
): UserIntent {
  const cleanPrompt = rawPrompt
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s:/.]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  const tokens = cleanPrompt.split(" ").filter((t) => t.length > 1);

  // Extract Action Verbs
  const actionKeywords = tokens.filter((token) =>
    ACTION_VERBS.some((verb) => token.includes(verb) || verb.includes(token)),
  );

  // Extract File Extensions
  const detectedFileTypes = FILE_TYPES.filter((type) => cleanPrompt.includes(type));

  // Extract URLs
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
  };
}
