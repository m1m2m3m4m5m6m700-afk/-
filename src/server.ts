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

const GOOGLE_VERIFICATION_PATH = "/googlea627784b48ceca91.html";
const GOOGLE_VERIFICATION_BODY = "google-site-verification: googlea627784b48ceca91.html";
const CHAT_API_PATH = "/api/chat";

/**
 * Chat is a same-origin browser endpoint. `Sec-Fetch-Site: same-site` is not
 * sufficient because another origin may still share the registrable domain.
 * Prefer exact Origin, then an exact Referer origin, and finally require the
 * modern `same-origin` fetch metadata value.
 */
function isSameOriginChatRequest(request: Request): boolean {
  const requestOrigin = new URL(request.url).origin;
  const origin = request.headers.get("Origin");
  if (origin !== null) {
    try {
      return new URL(origin).origin === requestOrigin;
    } catch {
      return false;
    }
  }

  const referer = request.headers.get("Referer");
  if (referer !== null) {
    try {
      return new URL(referer).origin === requestOrigin;
    } catch {
      return false;
    }
  }

  return request.headers.get("Sec-Fetch-Site") === "same-origin";
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

      if (pathname === CHAT_API_PATH) {
        if (request.method !== "POST") {
          return withSecurityHeaders(
            new Response("Method Not Allowed", { status: 405, headers: { allow: "POST" } }),
            createCspNonce(),
          );
        }
        if (!isSameOriginChatRequest(request)) {
          return withSecurityHeaders(new Response("Forbidden", { status: 403 }), createCspNonce());
        }
        const nonce = createCspNonce();
        try {
          const response = await handleChatRequest(request);
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
                status: 503,
                headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
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
