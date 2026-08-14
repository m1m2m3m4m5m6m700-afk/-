/**
 * HTTP chat handler — `POST /api/chat`, the real server-side endpoint for
 * Flixo's free Gemini chatbot (Phase 1: structured JSON, non-streaming).
 *
 * Server-only: imported only by `src/server.ts` (the Nitro server entry, where
 * the `/api/chat` path is short-circuited before reaching the TanStack Start
 * SSR handler). It never enters the client bundle — no API key or upstream
 * endpoint is ever shipped to the browser.
 *
 * Contract (request JSON):
 *   {
 *     "message": "...",           // required, the new user turn
 *     "history": [                 // optional, prior turns (no "system" role)
 *       { "role": "user", "content": "..." },
 *       { "role": "assistant", "content": "..." }
 *     ]
 *   }
 *
 * Response (structured JSON):
 *   success: { "reply": "...", "model": "gemini-2.5-flash-lite" }
 *   error:   { "error": "...", "retryable": boolean }
 *
 * Security:
 * - Reads `GEMINI_API_KEY` from the server environment via `getAIConfig()`.
 *   The key is sent only to Google's endpoint (as a `?key=` param) and is
 *   never logged, returned, or serialized.
 * - User message content is sent to Google but never logged here.
 * - Error responses carry safe, generic messages (no upstream bodies, no key).
 * - Cross-origin abuse is prevented at the server-entry layer (same-origin
 *   check), not here — this module is single-purpose and request-shaped.
 *
 * Provider/model: uses the Gemini provider resolved by `getAIConfig()`:
 * `GEMINI_MODEL` (default `gemini-2.5-flash-lite`, free-tier eligible) with
 * the existing `GEMINI_BASE_URL` fallback. No OpenAI / Anthropic.
 */

import { getAIConfig } from "../config";

/** A single chat turn in the request. */
interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  message?: unknown;
  history?: unknown;
}

/** Structured success response body. */
interface ChatSuccessBody {
  reply: string;
  model: string;
}

/** Structured error response body. */
interface ChatErrorBody {
  error: string;
  retryable: boolean;
}

const MAX_MESSAGE_CHARS = 4000;
const MAX_TURNS = 20;
const MAX_REPLY_CHARS = 4000;

/** Gemini `generateContent` response shape (only the fields we read). */
interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
  error?: { message?: string; status?: string };
}

/** System prompt shaping Flixo's chatbot persona. */
const CHAT_SYSTEM_PROMPT =
  "You are Flixo's friendly assistant, embedded as a chatbot on the Flixo " +
  "website (a workspace of free online AI tools — text, image, audio, video, " +
  "PDF, translation, and developer utilities). Help users briefly: explain " +
  "what Flixo can do, suggest a relevant tool, or answer quick questions. " +
  "Keep replies concise and friendly, ideally a few sentences. If a question " +
  "needs a tool, point to Flixo's categories. Never invent facts. Write in the " +
  "user's language when possible.";

/** Map the wire `user`/`assistant` roles to Gemini's `user`/`model` roles. */
function toGeminiRole(role: ChatTurn["role"]): "user" | "model" {
  return role === "assistant" ? "model" : "user";
}

/** Strip NUL bytes and trailing whitespace; collapse CR. */
function sanitizeContent(content: string): string {
  const nul = String.fromCharCode(0);
  return content.split(nul).join("").replace(/\r/g, "").trim();
}

/** A structured JSON response (200 by default with a structured body). */
function jsonResponse(body: ChatSuccessBody | ChatErrorBody, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

/** Surface a clear "Gemini not configured" message (never a fake reply). */
function notConfiguredResponse(): Response {
  return jsonResponse({
    error: "The chatbot is not configured yet. Ask the site admin to set GEMINI_API_KEY.",
    retryable: false,
  });
}

/** Validate and normalize the raw request body into chat turns. */
function parseTurns(
  body: ChatRequestBody,
): { ok: true; turns: ChatTurn[] } | { ok: false; response: Response } {
  const message = typeof body.message === "string" ? body.message : "";
  if (!sanitizeContent(message)) {
    return {
      ok: false,
      response: jsonResponse({
        error: "Please send a message to start the conversation.",
        retryable: false,
      }),
    };
  }
  if (message.length > MAX_MESSAGE_CHARS) {
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
  turns.push({ role: "user", content: sanitizeContent(message) });
  return { ok: true, turns };
}

/**
 * Build the Gemini `contents` payload, collapsing consecutive same-role
 * messages so the alternation invariant (user/model/user/...) holds.
 */
function buildContents(
  turns: ChatTurn[],
): Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> {
  const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];
  for (const t of turns) {
    const role = toGeminiRole(t.role);
    const last = contents[contents.length - 1];
    if (last && last.role === role) {
      last.parts[0].text += "\n\n" + t.content;
    } else {
      contents.push({ role, parts: [{ text: t.content }] });
    }
  }
  return contents;
}

/** Map a failed upstream HTTP status to a safe error response. */
function upstreamErrorResponse(status: number): Response {
  if (status === 429 || status === 403) {
    return jsonResponse({
      error:
        "The free-tier quota for the AI provider has been exhausted or rate-limited. Please try again later.",
      retryable: true,
    });
  }
  if (status === 401) {
    return jsonResponse({
      error: "The AI provider rejected the API key. Ask the site admin to check GEMINI_API_KEY.",
      retryable: false,
    });
  }
  if (status >= 500) {
    return jsonResponse({
      error: "The AI provider is temporarily unavailable. Please try again.",
      retryable: true,
    });
  }
  return jsonResponse({
    error: `The AI provider returned an error (status ${status}).`,
    retryable: false,
  });
}

/** Map a Gemini error object (from a 200 body) to a safe error response. */
function geminiErrorResponse(error: NonNullable<GeminiGenerateResponse["error"]>): Response {
  const status = error.status ?? "";
  if (status === "RESOURCE_EXHAUSTED" || /quota|rate/i.test(error.message ?? "")) {
    return jsonResponse({
      error: "The free-tier quota for the AI provider has been exhausted. Please try again later.",
      retryable: true,
    });
  }
  return jsonResponse({
    error: "The AI provider returned an error while generating a response.",
    retryable: false,
  });
}

/**
 * Handle `POST /api/chat`.
 *
 * @param request the incoming POST request (already same-origin-checked).
 * @returns a structured JSON `Response` (success or error).
 */
export async function handleChatRequest(request: Request): Promise<Response> {
  // Method guard — the server entry only routes POST here, but defend in depth.
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { allow: "POST" },
    });
  }

  const config = getAIConfig();
  const gemini = config.providers.gemini;
  if (!gemini?.apiKey) return notConfiguredResponse();

  // Parse + validate the JSON body.
  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return jsonResponse({
      error: "Invalid JSON body. Expected { message, history }.",
      retryable: false,
    });
  }
  const parsed = parseTurns(body);
  if (!parsed.ok) return parsed.response;
  const turns = parsed.turns;

  const contents = buildContents(turns);
  if (contents.length === 0 || contents[contents.length - 1].role !== "user") {
    return jsonResponse({
      error: "Please send a message to continue the conversation.",
      retryable: false,
    });
  }

  const model = gemini.defaultModel;
  const url =
    `${gemini.baseUrl}/v1beta/models/${encodeURIComponent(model)}:generateContent` +
    `?key=${encodeURIComponent(gemini.apiKey)}`;

  const payload = JSON.stringify({
    contents,
    systemInstruction: { parts: [{ text: CHAT_SYSTEM_PROMPT }] },
    generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
  });

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: payload,
    });
  } catch {
    return jsonResponse({
      error: "Could not reach the AI provider. Please check your connection and try again.",
      retryable: true,
    });
  }

  if (!upstream.ok) return upstreamErrorResponse(upstream.status);

  let data: GeminiGenerateResponse;
  try {
    data = (await upstream.json()) as GeminiGenerateResponse;
  } catch {
    return jsonResponse({
      error: "The AI provider returned an unreadable response.",
      retryable: true,
    });
  }

  if (data.error) return geminiErrorResponse(data.error);

  if (data.promptFeedback?.blockReason) {
    return jsonResponse({
      error: "The request was blocked by the AI provider's safety filters.",
      retryable: false,
    });
  }

  const reply = (data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "")
    .trim()
    .slice(0, MAX_REPLY_CHARS);

  if (!reply) {
    return jsonResponse({
      error: "The AI provider returned an empty response.",
      retryable: true,
    });
  }

  return jsonResponse({ reply, model });
}
