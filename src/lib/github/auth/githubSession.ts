/**
 * GitHub session request middleware — SERVER-ONLY.
 *
 * A TanStack Start *request* middleware that reads the `flixo_dev_session`
 * cookie off the incoming `Request`, verifies it, and injects the payload into
 * downstream server-fn context as `context.githubSession`.
 *
 * Server fns that need an authenticated session declare `.middleware([
 * githubSessionMiddleware ])` and read `context.githubSession` — which is
 * `GitHubSessionPayload | null` (null = not authenticated).
 *
 * Why a request middleware (not a function middleware): the request middleware
 * receives the raw `Request` and runs once per inbound request, so the cookie
 * is available exactly where the session is established. Function middleware
 * doesn't receive `Request` directly.
 */

import { createMiddleware } from "@tanstack/react-start";
import { readSession } from "./session";
import type { GitHubSessionPayload } from "../types";

declare module "@tanstack/react-start" {
  interface Register {
    serverContext: {
      githubSession?: GitHubSessionPayload | null;
    };
  }
}

export const githubSessionMiddleware = createMiddleware().server(({ request, next }) => {
  const session = readSession(request);
  return next({ context: { githubSession: session } });
});
