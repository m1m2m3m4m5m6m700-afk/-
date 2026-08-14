import "./lib/error-capture";

import { consumeLastCapturedError, runWithErrorCapture } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { withSecurityHeaders } from "./lib/security-headers";
import { handleChatRequest } from "./lib/ai/chat/handler";

type ServerEntry = {
  fetch: (
    request: Request,
    options?: { context?: { nonce?: string } },
  ) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

function createCspNonce(): string {
  return globalThis.crypto.randomUUID().replaceAll("-", "");
}

// Google Search Console ownership verification. The matching file also lives in
// public/ (served as a static asset when the host's filesystem handler matches),
// but the .html extension can fall through to the SPA catch-all on some hosts.
// Short-circuit the exact verification path here so the raw file body is always
// returned with HTTP 200, regardless of static-file routing.
const GOOGLE_VERIFICATION_PATH = "/googlea627784b48ceca91.html";
const GOOGLE_VERIFICATION_BODY = "google-site-verification: googlea627784b48ceca91.html";

// Real HTTP endpoint for Flixo's free Gemini chatbot. Short-circuited here
// (the Nitro server entry, before the TanStack Start SSR handler) so it is a
// genuine `POST /api/chat` route rather than a `createServerFn` RPC. The Gemini
// call + `GEMINI_API_KEY` stay server-side (the handler lives in
// src/lib/ai/chat/handler.ts and is never imported by the client bundle).
const CHAT_API_PATH = "/api/chat";

/**
 * Same-origin guard for the chat endpoint. Allows the request only when it
 * comes from the same origin (via `Sec-Fetch-Site`, then `Origin`, then
 * `Referer`), mirroring the CSRF check the TanStack Start middleware applies to
 * server-fn RPCs. Cross-site form posts and `no-cors` fetches are rejected.
 */
function isSameOriginChatRequest(request: Request): boolean {
  const headers = request.headers;
  // 1) Sec-Fetch-Site (modern browsers set this on all fetches).
  const secFetchSite = headers.get("Sec-Fetch-Site");
  if (secFetchSite !== null) {
    return (
      secFetchSite === "same-origin" || secFetchSite === "same-site" || secFetchSite === "none"
    );
  }
  // 2) Origin header.
  const origin = headers.get("Origin");
  if (origin !== null) {
    try {
      return new URL(origin).origin === new URL(request.url).origin;
    } catch {
      return false;
    }
  }
  // 3) Referer fallback.
  const referer = headers.get("Referer");
  if (referer === null) return false;
  try {
    return new URL(referer).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request) {
    return runWithErrorCapture(async () => {
      const url = new URL(request.url);
      const pathname = url.pathname;

      if (pathname === GOOGLE_VERIFICATION_PATH) {
        return new Response(GOOGLE_VERIFICATION_BODY, {
          status: 200,
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }

      // POST /api/chat — real chat HTTP endpoint (same-origin only).
      if (pathname === CHAT_API_PATH) {
        if (request.method !== "POST") {
          return withSecurityHeaders(
            new Response("Method Not Allowed", { status: 405, headers: { allow: "POST" } }),
            createCspNonce(),
          );
        }
        if (!isSameOriginChatRequest(request)) {
          // No CORS headers are sent, so the browser blocks reading the body;
          // a 403 also stops server-to-server / curl-style cross-origin abuse.
          return withSecurityHeaders(new Response("Forbidden", { status: 403 }), createCspNonce());
        }
        const nonce = createCspNonce();
        try {
          const response = await handleChatRequest(request);
          // withSecurityHeaders adds CSP + COOP/CORP=same-origin on every
          // response, keeping the streaming SSE body same-origin too.
          return withSecurityHeaders(response, nonce);
        } catch (error) {
          console.error(error);
          return withSecurityHeaders(
            new Response(
              JSON.stringify({
                error: "The chatbot service hit an error. Please try again.",
                retryable: true,
              }),
              {
                status: 200,
                headers: { "content-type": "application/json; charset=utf-8" },
              },
            ),
            nonce,
          );
        }
      }

      const nonce = createCspNonce();
      try {
        const handler = await getServerEntry();
        const response = await handler.fetch(request, { context: { nonce } });
        return withSecurityHeaders(await normalizeCatastrophicSsrResponse(response), nonce);
      } catch (error) {
        console.error(error);
        return withSecurityHeaders(
          new Response(renderErrorPage(), {
            status: 500,
            headers: { "content-type": "text/html; charset=utf-8" },
          }),
          nonce,
        );
      }
    });
  },
};
