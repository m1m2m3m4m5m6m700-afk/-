import "./lib/error-capture";

import { consumeLastCapturedError, runWithErrorCapture } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { withSecurityHeaders } from "./lib/security-headers";

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

export default {
  async fetch(request: Request) {
    return runWithErrorCapture(async () => {
      if (new URL(request.url).pathname === GOOGLE_VERIFICATION_PATH) {
        return new Response(GOOGLE_VERIFICATION_BODY, {
          status: 200,
          headers: { "content-type": "text/html; charset=utf-8" },
        });
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
