/**
 * Server-only Flex chat handler.
 *
 * Flex uses a free-model fleet behind one endpoint:
 * 1) OpenRouter `openrouter/free` — dynamically selects from currently
 *    available free model variants and adapts to request capabilities.
 * 2) Gemini free-tier model as a direct fallback when configured.
 */

import { getAIConfig, type AIProviderConfig } from "../config";

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  message?: unknown;
  history?: unknown;
  locale?: unknown;
}

interface ChatSuccessBody {
  reply: string;
  model: string;
  provider: string;
}

interface ChatErrorBody {
  error: string;
  retryable: boolean;
}

const MAX_MESSAGE_CHARS = 4000;
const MAX_TURNS = 20;
const MAX_REPLY_CHARS = 4000;
const MAX_REQUEST_BODY_CHARS = 128_000;
const SUPPORTED_LOCALES = new Set([
  "en",
  "ar",
  "es",
  "zh-CN",
  "hi",
  "pt",
  "fr",
  "de",
  "ja",
  "ko",
  "tr",
  "it",
  "vi",
  "id",
  "th",
  "pl",
  "nl",
  "sv",
  "uk",
  "ro",
  "el",
  "cs",
  "he",
  "bn",
  "fa",
  "ru",
  "ms",
]);

type OpenRouterContent = string | Array<{ type?: string; text?: string }>;

interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
  promptFeedback?: { blockReason?: string };
  error?: { message?: string; status?: string };
}

interface OpenRouterResponse {
  choices?: Array<{
    message?: { content?: OpenRouterContent };
  }>;
  model?: string;
  error?: { message?: string; code?: number };
}

const CHAT_SYSTEM_PROMPT = [
  "You are Flex, the intelligent assistant inside Flixo, a free online workspace of tools.",
  "Be concise, practical, and honest. Reply in the user's language when possible; for Arabic, use clear modern Arabic unless the user writes in dialect.",
  "You can explain what Flixo can do, recommend the most suitable tool, help the user formulate a task, or answer a short question.",
  "Never claim that a tool, model, feature, or result exists unless it is known from the Flixo context you were given.",
  "When the user asks for a Flixo action, describe the next concrete step rather than pretending the action has already happened.",
].join(" ");

const LOCALE_NAMES: Record<string, string> = {
  en: "English",
  ar: "Arabic",
  es: "Spanish",
  "zh-CN": "Simplified Chinese",
  hi: "Hindi",
  pt: "Portuguese",
  fr: "French",
  de: "German",
  ja: "Japanese",
  ko: "Korean",
  tr: "Turkish",
  it: "Italian",
  vi: "Vietnamese",
  id: "Indonesian",
  th: "Thai",
  pl: "Polish",
  nl: "Dutch",
  sv: "Swedish",
  uk: "Ukrainian",
  ro: "Romanian",
  el: "Greek",
  cs: "Czech",
  he: "Hebrew",
  bn: "Bengali",
  fa: "Persian",
  ru: "Russian",
  ms: "Malay",
};

function sanitizeContent(content: string): string {
  const nul = String.fromCharCode(0);
  return content.split(nul).join("").replace(/\r/g, "").trim();
}

function normalizeLocale(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const locale = value.trim();
  return SUPPORTED_LOCALES.has(locale) ? locale : null;
}

function localizedSystemPrompt(locale: string | null): string {
  if (!locale || locale === "en") return CHAT_SYSTEM_PROMPT;
  const name = LOCALE_NAMES[locale] ?? locale;
  return [
    CHAT_SYSTEM_PROMPT,
    `The active Flixo interface language is ${name} (${locale}). Prefer answering in this language unless the user clearly writes in another language. Keep Flixo's product and tool names accurate rather than inventing translations.`,
  ].join(" ");
}

function jsonResponse(body: ChatSuccessBody | ChatErrorBody, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function notConfiguredResponse(): Response {
  return jsonResponse({
    error:
      "Flex is not configured yet. Add OPENROUTER_API_KEY or GEMINI_API_KEY in the server environment.",
    retryable: false,
  });
}

function parseTurns(
  body: ChatRequestBody,
): { ok: true; turns: ChatTurn[]; locale: string | null } | { ok: false; response: Response } {
  const message = typeof body.message === "string" ? body.message : "";
  const cleanedMessage = sanitizeContent(message);

  if (!cleanedMessage) {
    return {
      ok: false,
      response: jsonResponse({
        error: "Please send a message to start the conversation.",
        retryable: false,
      }),
    };
  }

  if (cleanedMessage.length > MAX_MESSAGE_CHARS) {
    return {
      ok: false,
      response: jsonResponse({
        error: `Message is too long (max ${MAX_MESSAGE_CHARS} characters).`,
        retryable: false,
      }),
    };
  }

  const turns: ChatTurn[] = [];
  if (Array.isArray(body.history)) {
    for (const entry of body.history) {
      if (!entry || typeof entry !== "object") continue;
      const role = (entry as ChatTurn).role;
      const content = (entry as ChatTurn).content;
      if (role !== "user" && role !== "assistant") continue;
      if (typeof content !== "string") continue;
      const cleaned = sanitizeContent(content);
      if (!cleaned) continue;
      turns.push({ role, content: cleaned });
    }
    if (turns.length > MAX_TURNS) turns.splice(0, turns.length - MAX_TURNS);
  }

  turns.push({ role: "user", content: cleanedMessage });
  return { ok: true, turns, locale: normalizeLocale(body.locale) };
}

function toOpenRouterMessages(turns: ChatTurn[], locale: string | null) {
  return [
    { role: "system" as const, content: localizedSystemPrompt(locale) },
    ...turns.map((turn) => ({
      role: turn.role as "user" | "assistant",
      content: turn.content,
    })),
  ];
}

function buildGeminiContents(
  turns: ChatTurn[],
): Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> {
  const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];
  for (const turn of turns) {
    const role = turn.role === "assistant" ? "model" : "user";
    const last = contents[contents.length - 1];
    if (last && last.role === role) {
      last.parts[0].text += `\n\n${turn.content}`;
    } else {
      contents.push({ role, parts: [{ text: turn.content }] });
    }
  }
  return contents;
}

function extractOpenRouterText(content: OpenRouterContent | undefined): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content.map((part) => part.text ?? "").join("");
}

async function callOpenRouter(
  provider: AIProviderConfig,
  turns: ChatTurn[],
  locale: string | null,
  signal: AbortSignal,
): Promise<
  | { ok: true; reply: string; model: string }
  | { ok: false; retryable: boolean; blocked?: boolean }
> {
  if (!provider.apiKey) return { ok: false, retryable: false };

  const response = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${provider.apiKey}`,
      "http-referer": "https://flixoai.vercel.app",
      "x-title": "Flixo",
    },
    signal,
    body: JSON.stringify({
      model: provider.defaultModel,
      messages: toOpenRouterMessages(turns, locale),
      temperature: 0.6,
      max_tokens: 1200,
    }),
  });

  if (!response.ok) {
    return {
      ok: false,
      retryable: response.status === 408 || response.status === 429 || response.status >= 500,
    };
  }

  const data = (await response.json()) as OpenRouterResponse;
  if (data.error) return { ok: false, retryable: false };

  const reply = extractOpenRouterText(data.choices?.[0]?.message?.content).trim();
  if (!reply) return { ok: false, retryable: true };

  return {
    ok: true,
    reply: reply.slice(0, MAX_REPLY_CHARS),
    model: data.model ?? provider.defaultModel,
  };
}

async function callGemini(
  provider: AIProviderConfig,
  turns: ChatTurn[],
  locale: string | null,
  signal: AbortSignal,
): Promise<
  | { ok: true; reply: string; model: string }
  | { ok: false; retryable: boolean; blocked?: boolean }
> {
  if (!provider.apiKey) return { ok: false, retryable: false };

  const url =
    `${provider.baseUrl}/v1beta/models/${encodeURIComponent(provider.defaultModel)}:generateContent` +
    `?key=${encodeURIComponent(provider.apiKey)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    signal,
    body: JSON.stringify({
      contents: buildGeminiContents(turns),
      systemInstruction: { parts: [{ text: localizedSystemPrompt(locale) }] },
      generationConfig: { maxOutputTokens: 1200, temperature: 0.6 },
    }),
  });

  if (!response.ok) {
    return {
      ok: false,
      retryable: response.status === 408 || response.status === 429 || response.status >= 500,
    };
  }

  const data = (await response.json()) as GeminiGenerateResponse;
  if (data.promptFeedback?.blockReason) return { ok: false, retryable: false, blocked: true };
  if (data.error) {
    const retryable =
      data.error.status === "RESOURCE_EXHAUSTED" || /quota|rate|unavailable/i.test(data.error.message ?? "");
    return { ok: false, retryable };
  }

  const reply =
    data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim() ?? "";
  if (!reply) return { ok: false, retryable: true };

  return { ok: true, reply: reply.slice(0, MAX_REPLY_CHARS), model: provider.defaultModel };
}

export async function handleChatRequest(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: { allow: "POST" } });
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BODY_CHARS) {
    return jsonResponse({ error: "Request payload is too large.", retryable: false }, 413);
  }

  let body: ChatRequestBody;
  try {
    const rawBody = await request.text();
    if (rawBody.length > MAX_REQUEST_BODY_CHARS) {
      return jsonResponse({ error: "Request payload is too large.", retryable: false }, 413);
    }
    body = JSON.parse(rawBody) as ChatRequestBody;
  } catch {
    return jsonResponse({
      error: "Invalid JSON body. Expected { message, history, locale }.",
      retryable: false,
    });
  }

  const parsed = parseTurns(body);
  if (!parsed.ok) return parsed.response;

  const config = getAIConfig();
  const openrouter = config.providers.openrouter;
  const gemini = config.providers.gemini;
  if (!openrouter?.apiKey && !gemini?.apiKey) return notConfiguredResponse();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.defaultTimeoutMs);

  try {
    const providers: Array<{ name: "openrouter" | "gemini"; config: AIProviderConfig }> = [];
    if (openrouter?.apiKey) providers.push({ name: "openrouter", config: openrouter });
    if (gemini?.apiKey) providers.push({ name: "gemini", config: gemini });

    let lastRetryable = false;
    for (const provider of providers) {
      try {
        const result =
          provider.name === "openrouter"
            ? await callOpenRouter(provider.config, parsed.turns, parsed.locale, controller.signal)
            : await callGemini(provider.config, parsed.turns, parsed.locale, controller.signal);

        if (result.ok) {
          return jsonResponse({
            reply: result.reply,
            model: result.model,
            provider: provider.name,
          });
        }

        if (result.blocked) {
          return jsonResponse({
            error: "The AI provider blocked this request with its safety filters.",
            retryable: false,
          });
        }

        lastRetryable = result.retryable;
        if (!result.retryable) break;
      } catch {
        lastRetryable = true;
      }

      if (controller.signal.aborted) break;
    }

    return jsonResponse(
      {
        error: lastRetryable
          ? "Flex's free AI providers are temporarily unavailable or rate-limited. Please try again shortly."
          : "Flex could not generate a response with the configured free AI providers.",
        retryable: lastRetryable,
      },
      200,
    );
  } finally {
    clearTimeout(timeout);
  }
}
