import { getAIConfig, type AIProviderConfig, type AIProviderId } from "../config";
import { tools } from "@/data/tools";
import { categoryById } from "@/data/categories";
import { isFeatureEnabled } from "@/lib/feature-flags";

interface ChatTurn { role: "user" | "assistant"; content: string }
interface ChatRequestBody { message?: unknown; history?: unknown; locale?: unknown }
interface ChatSuccessBody { reply: string; model: string; provider: string }
interface ChatErrorBody { error: string; retryable: boolean }

const MAX_MESSAGE_CHARS = 4000;
const MAX_TURNS = 20;
const MAX_REPLY_CHARS = 4000;
const MAX_REQUEST_BODY_CHARS = 128_000;
const SUPPORTED_LOCALES = new Set(["en","ar","es","zh-CN","hi","pt","fr","de","ja","ko","tr","it","vi","id","th","pl","nl","sv","uk","ro","el","cs","he","bn","fa","ru","ms"]);
const LOCALE_NAMES: Record<string, string> = { en:"English", ar:"Arabic", es:"Spanish", "zh-CN":"Simplified Chinese", hi:"Hindi", pt:"Portuguese", fr:"French", de:"German", ja:"Japanese", ko:"Korean", tr:"Turkish", it:"Italian", vi:"Vietnamese", id:"Indonesian", th:"Thai", pl:"Polish", nl:"Dutch", sv:"Swedish", uk:"Ukrainian", ro:"Romanian", el:"Greek", cs:"Czech", he:"Hebrew", bn:"Bengali", fa:"Persian", ru:"Russian", ms:"Malay" };

type OpenRouterContent = string | Array<{ type?: string; text?: string }>;
interface GeminiGenerateResponse { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; promptFeedback?: { blockReason?: string }; error?: { message?: string; status?: string } }
interface OpenRouterResponse { choices?: Array<{ message?: { content?: OpenRouterContent } }>; model?: string; error?: { message?: string; code?: number } }
interface OpenAIResponse { choices?: Array<{ message?: { content?: string | null } }>; model?: string; error?: { message?: string } }

const SYSTEM_PROMPT = [
  "You are Flex, the general AI assistant inside Flixo.",
  "Reason, explain, draft, analyze, brainstorm, and propose practical solutions.",
  "Reply in the user's language and match their register when useful, including colloquial language.",
  "Do not invent tools or claim a tool has run unless it actually ran. You may recommend a runtime-ready Flixo tool in prose.",
  "Use supplied Flixo catalog and web-search context accurately.",
].join(" ");

function sanitize(content: string): string { return content.replace(/\u0000/g, "").replace(/\r/g, "").trim(); }
function normalizeLocale(value: unknown): string | null { return typeof value === "string" && SUPPORTED_LOCALES.has(value.trim()) ? value.trim() : null; }
function systemPrompt(locale: string | null): string { return !locale || locale === "en" ? SYSTEM_PROMPT : `${SYSTEM_PROMPT}\nActive interface locale: ${LOCALE_NAMES[locale] ?? locale} (${locale}). Keep the answer in that language unless the user explicitly switches.`; }
function jsonResponse(body: ChatSuccessBody | ChatErrorBody, status = 200): Response { return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } }); }
function notConfigured(): Response { return jsonResponse({ error: "Flex is not configured yet. Add OPENAI_API_KEY, GEMINI_API_KEY, or OPENROUTER_API_KEY in the server environment.", retryable: false }, 503); }

function parseTurns(body: ChatRequestBody): { ok: true; turns: ChatTurn[]; locale: string | null } | { ok: false; response: Response } {
  const message = sanitize(typeof body.message === "string" ? body.message : "");
  if (!message) return { ok: false, response: jsonResponse({ error: "Please send a message to start the conversation.", retryable: false }, 400) };
  if (message.length > MAX_MESSAGE_CHARS) return { ok: false, response: jsonResponse({ error: `Message is too long (max ${MAX_MESSAGE_CHARS} characters).`, retryable: false }, 413) };
  const turns: ChatTurn[] = [];
  if (Array.isArray(body.history)) {
    for (const entry of body.history) {
      if (!entry || typeof entry !== "object") continue;
      const value = entry as Partial<ChatTurn>;
      if ((value.role === "user" || value.role === "assistant") && typeof value.content === "string") {
        const content = sanitize(value.content);
        if (content) turns.push({ role: value.role, content: content.slice(0, MAX_MESSAGE_CHARS) });
      }
    }
    if (turns.length > MAX_TURNS) turns.splice(0, turns.length - MAX_TURNS);
  }
  turns.push({ role: "user", content: message });
  return { ok: true, turns, locale: normalizeLocale(body.locale) };
}

function buildGeminiContents(turns: ChatTurn[]): Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> {
  const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];
  for (const turn of turns) {
    const role = turn.role === "assistant" ? "model" : "user";
    const last = contents.at(-1);
    if (last?.role === role) last.parts[0].text += `\n\n${turn.content}`;
    else contents.push({ role, parts: [{ text: turn.content }] });
  }
  return contents;
}

function buildOpenAICompatibleMessages(turns: ChatTurn[], locale: string | null) {
  return [{ role: "system" as const, content: systemPrompt(locale) }, ...turns.map((turn) => ({ role: turn.role, content: turn.content }))];
}

function buildCatalogContext(message: string): string {
  const query = message.toLowerCase();
  const categories = [...categoryById.values()].map((c) => `${c.name}: ${c.description}`).join("\n");
  const words = query.split(/[^\p{L}\p{N}]+/u).filter((word) => word.length >= 3);
  const matches = tools
    .filter((tool) => tool.status === "ready" && Boolean(tool.slug))
    .map((tool) => ({ tool, score: words.reduce((sum, word) => sum + (`${tool.name} ${tool.description} ${tool.slug}`.toLowerCase().includes(word) ? 1 : 0), 0) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
  const lines = matches.length ? matches.map(({ tool }) => `- ${tool.name} (${tool.slug}) — ${tool.description}`).join("\n") : "No close runtime-ready tool match found.";
  return `[Flixo catalog context]\nCategories:\n${categories}\nRelevant runtime-ready tools:\n${lines}`;
}

function shouldWebSearch(message: string): boolean {
  if (!isFeatureEnabled("webResearch")) return false;
  return /(search the web|search online|on the internet|web search|google it|latest|today|current|recent|news|price today|ابحث|الإنترنت|الانترنت|آخر|اليوم|حاليا|حديث|الأخبار|السعر الآن|الاخبار)/i.test(message);
}

async function searchWeb(query: string, signal: AbortSignal): Promise<string> {
  try {
    const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`, { signal, headers: { accept: "application/json", "user-agent": "Flixo/1.0" } });
    if (!response.ok) return "";
    const data = (await response.json()) as { AbstractText?: string; AbstractURL?: string; Heading?: string; RelatedTopics?: Array<{ Text?: string; FirstURL?: string; Topics?: Array<{ Text?: string; FirstURL?: string }> }> };
    const lines: string[] = [];
    if (data.AbstractText) lines.push(`- ${data.Heading ?? "Result"}: ${data.AbstractText}${data.AbstractURL ? ` (${data.AbstractURL})` : ""}`);
    for (const topic of (data.RelatedTopics ?? []).slice(0, 6)) {
      if (topic.Text) lines.push(`- ${topic.Text}${topic.FirstURL ? ` (${topic.FirstURL})` : ""}`);
      for (const nested of (topic.Topics ?? []).slice(0, 2)) if (nested.Text) lines.push(`- ${nested.Text}${nested.FirstURL ? ` (${nested.FirstURL})` : ""}`);
    }
    return lines.length ? `[Fresh web search results for: ${query}]\n${lines.join("\n")}` : "";
  } catch {
    return "";
  }
}

function isRetryableStatus(status: number): boolean { return status === 408 || status === 429 || status >= 500; }

async function callOpenAI(provider: AIProviderConfig, turns: ChatTurn[], locale: string | null, signal: AbortSignal) {
  if (!provider.apiKey) return { ok: false as const, retryable: false, reason: "not_configured" as const };
  const response = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${provider.apiKey}` },
    signal,
    body: JSON.stringify({ model: provider.defaultModel, messages: buildOpenAICompatibleMessages(turns, locale), temperature: 0.6, max_tokens: 1400 }),
  });
  if (!response.ok) return { ok: false as const, retryable: isRetryableStatus(response.status), reason: `http_${response.status}` };
  const data = (await response.json()) as OpenAIResponse;
  const reply = data.choices?.[0]?.message?.content?.trim() ?? "";
  if (!reply) return { ok: false as const, retryable: true, reason: "empty_response" as const };
  return { ok: true as const, reply: reply.slice(0, MAX_REPLY_CHARS), model: data.model ?? provider.defaultModel };
}

async function callOpenRouter(provider: AIProviderConfig, turns: ChatTurn[], locale: string | null, signal: AbortSignal) {
  if (!provider.apiKey) return { ok: false as const, retryable: false, reason: "not_configured" as const };
  const response = await fetch(`${provider.baseUrl}/chat/completions`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${provider.apiKey}`, "http-referer": "https://flixoai.vercel.app", "x-title": "Flixo" }, signal, body: JSON.stringify({ model: provider.defaultModel, messages: buildOpenAICompatibleMessages(turns, locale), temperature: 0.6, max_tokens: 1400 }) });
  if (!response.ok) return { ok: false as const, retryable: isRetryableStatus(response.status), reason: `http_${response.status}` };
  const data = (await response.json()) as OpenRouterResponse;
  const reply = typeof data.choices?.[0]?.message?.content === "string" ? data.choices[0].message.content.trim() : Array.isArray(data.choices?.[0]?.message?.content) ? data.choices[0]!.message!.content.map((part) => part.text ?? "").join("").trim() : "";
  if (!reply) return { ok: false as const, retryable: true, reason: "empty_response" as const };
  return { ok: true as const, reply: reply.slice(0, MAX_REPLY_CHARS), model: data.model ?? provider.defaultModel };
}

async function callGemini(provider: AIProviderConfig, turns: ChatTurn[], locale: string | null, signal: AbortSignal) {
  if (!provider.apiKey) return { ok: false as const, retryable: false, reason: "not_configured" as const };
  const url = `${provider.baseUrl}/v1beta/models/${encodeURIComponent(provider.defaultModel)}:generateContent?key=${encodeURIComponent(provider.apiKey)}`;
  const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, signal, body: JSON.stringify({ contents: buildGeminiContents(turns), systemInstruction: { parts: [{ text: systemPrompt(locale) }] }, generationConfig: { maxOutputTokens: 1400, temperature: 0.6 } }) });
  if (!response.ok) return { ok: false as const, retryable: isRetryableStatus(response.status), reason: `http_${response.status}` };
  const data = (await response.json()) as GeminiGenerateResponse;
  if (data.promptFeedback?.blockReason) return { ok: false as const, retryable: false, blocked: true, reason: "blocked" as const };
  const reply = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim() ?? "";
  if (!reply) return { ok: false as const, retryable: true, reason: "empty_response" as const };
  return { ok: true as const, reply: reply.slice(0, MAX_REPLY_CHARS), model: provider.defaultModel };
}

async function callProvider(name: AIProviderId, provider: AIProviderConfig, turns: ChatTurn[], locale: string | null, signal: AbortSignal) {
  if (name === "openai") return callOpenAI(provider, turns, locale, signal);
  if (name === "gemini") return callGemini(provider, turns, locale, signal);
  return callOpenRouter(provider, turns, locale, signal);
}

function configuredProviderOrder(config: ReturnType<typeof getAIConfig>): AIProviderId[] {
  const order = [config.activeProvider, ...config.fallbackProviders];
  return [...new Set(order)].filter((id) => Boolean(config.providers[id]?.apiKey));
}

function timeoutSignal(timeoutMs: number): { signal: AbortSignal; cleanup: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, cleanup: () => clearTimeout(timer) };
}

export async function handleChatRequest(request: Request): Promise<Response> {
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: { allow: "POST" } });
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BODY_CHARS) return jsonResponse({ error: "Request payload is too large.", retryable: false }, 413);
  let body: ChatRequestBody;
  try {
    const rawBody = await request.text();
    if (rawBody.length > MAX_REQUEST_BODY_CHARS) return jsonResponse({ error: "Request payload is too large.", retryable: false }, 413);
    body = JSON.parse(rawBody) as ChatRequestBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body. Expected { message, history, locale }.", retryable: false }, 400);
  }

  const parsed = parseTurns(body);
  if (!parsed.ok) return parsed.response;
  const config = getAIConfig();
  const providerOrder = configuredProviderOrder(config);
  if (providerOrder.length === 0) return notConfigured();

  const catalog = buildCatalogContext(parsed.turns.at(-1)!.content);
  let fresh = "";
  if (shouldWebSearch(parsed.turns.at(-1)!.content)) {
    const searchTimeout = timeoutSignal(Math.min(config.defaultTimeoutMs, 5000));
    try {
      fresh = await searchWeb(parsed.turns.at(-1)!.content, searchTimeout.signal);
    } finally {
      searchTimeout.cleanup();
    }
  }

  const last = parsed.turns.at(-1)!;
  const augmentedTurns = [...parsed.turns.slice(0, -1), { ...last, content: [last.content, catalog, fresh].filter(Boolean).join("\n\n") }];
  let retryable = false;
  let blocked = false;

  for (const providerId of providerOrder) {
    const provider = config.providers[providerId];
    const call = timeoutSignal(config.defaultTimeoutMs);
    try {
      const result = await callProvider(providerId, provider, augmentedTurns, parsed.locale, call.signal);
      if (result.ok) return jsonResponse({ reply: result.reply, model: result.model, provider: providerId });
      blocked ||= "blocked" in result && result.blocked === true;
      retryable ||= result.retryable;
    } catch (error) {
      retryable = true;
      if (!(error instanceof DOMException && error.name === "AbortError")) console.error(error);
    } finally {
      call.cleanup();
    }
  }

  if (blocked && !retryable) return jsonResponse({ error: "The AI providers blocked this request with their safety filters.", retryable: false }, 400);
  return jsonResponse(
    {
      error: retryable
        ? "Flex's AI providers are temporarily unavailable or rate-limited. Please try again shortly."
        : "Flex could not generate a response with the configured AI providers.",
      retryable,
    },
    retryable ? 503 : 502,
  );
}
