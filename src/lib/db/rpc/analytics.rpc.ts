/**
 * Analytics + tool-request RPC fetchers — client-importable.
 *
 * Global analytics (TASK 4) come from Postgres via `getGlobalAnalytics`. Tool
 * requests (TASK 5) are persisted server-side and trigger an email
 * notification on creation. Both are guarded by `guardDbConfigured`;
 * mutations require a valid CSRF token (TASK 6).
 *
 * Per the import-protection rule this module lives in `rpc/` (NOT `server/`)
 * and exports ONLY `createServerFn` fetchers; all server-only helpers are
 * imported at top level and dead-stripped from the client bundle.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { guardDbConfigured, dbFail } from "../../server/db/guards";
import { getGlobalAnalytics, trackEvent } from "../../server/db/service/analytics";
import { createToolRequest, listToolRequests } from "../../server/db/service/toolRequests";
import { DbServiceError } from "../../server/db/service/conversations";
import { rateLimit, RATE_PRESETS, verifyCsrf } from "../../server/security/csrf";
import { notifyNewToolRequest } from "../../email/notify";
import { securityRequestMiddleware } from "../../security/requestMiddleware";
import type { DbResult, GlobalAnalyticsDTO, ToolRequestDTO } from "../types";

function dbOk<T>(value: T): DbResult<T> {
  return value;
}

function mapError(err: unknown): DbResult<never> {
  if (err instanceof DbServiceError) {
    return dbFail(err.kind, err.message);
  }
  return dbFail("db_error", "A database error occurred.");
}

/** Verify the CSRF header against the cookie injected by the request middleware. */
function checkCsrf(csrfCookie: string | null, headerToken: string | null): true | DbResult<never> {
  if (!verifyCsrf(csrfCookie, headerToken)) {
    return dbFail("validation", "Invalid CSRF token. Please refresh and try again.");
  }
  return true;
}

const trackSchema = z.object({
  eventType: z.string().min(1).max(60),
  toolId: z.string().max(200).optional(),
  category: z.string().max(60).optional(),
  query: z.string().max(200).optional(),
  resultCount: z.number().int().min(0).optional(),
  csrfToken: z.string().max(500).optional(),
});

export const trackAnalyticsEvent = createServerFn({ method: "POST" })
  .validator(trackSchema)
  .middleware([securityRequestMiddleware])
  .handler(async ({ context, data }): Promise<DbResult<{ ok: true }>> => {
    const notConfigured = guardDbConfigured();
    if (notConfigured) return notConfigured;
    const csrf = checkCsrf(context.csrfCookie, data.csrfToken ?? null);
    if (csrf !== true) return csrf;
    const rl = rateLimit(`analytics:${context.clientIp ?? "anon"}`, RATE_PRESETS.contact);
    if (!rl.allowed) {
      return dbFail("validation", "Too many analytics events. Please try again later.");
    }
    try {
      await trackEvent({
        eventType: data.eventType,
        toolId: data.toolId,
        category: data.category,
        query: data.query,
        resultCount: data.resultCount,
        country: context.country ?? undefined,
        device: context.device ?? undefined,
        referrer: context.referrer ?? undefined,
        path: undefined,
      });
      return dbOk({ ok: true });
    } catch (err) {
      return mapError(err);
    }
  });

export const getAnalytics = createServerFn({ method: "GET" }).handler(
  async (): Promise<DbResult<GlobalAnalyticsDTO>> => {
    const notConfigured = guardDbConfigured();
    if (notConfigured) return notConfigured;
    try {
      return dbOk(await getGlobalAnalytics());
    } catch (err) {
      return mapError(err);
    }
  },
);

const createToolReqSchema = z.object({
  toolName: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  requester: z.string().min(1).max(200),
  csrfToken: z.string().max(500).optional(),
});

export const createToolRequestRpc = createServerFn({ method: "POST" })
  .validator(createToolReqSchema)
  .middleware([securityRequestMiddleware])
  .handler(async ({ context, data }): Promise<DbResult<ToolRequestDTO>> => {
    const notConfigured = guardDbConfigured();
    if (notConfigured) return notConfigured;
    const csrf = checkCsrf(context.csrfCookie, data.csrfToken ?? null);
    if (csrf !== true) return csrf;
    const rl = rateLimit(`toolRequest:${context.clientIp ?? "anon"}`, RATE_PRESETS.toolRequest);
    if (!rl.allowed) {
      return dbFail("validation", "Too many tool requests. Please try again later.");
    }
    try {
      const created = await createToolRequest({
        toolName: data.toolName,
        description: data.description ?? "",
        requester: data.requester,
      });
      void notifyNewToolRequest({
        toolName: created.toolName,
        description: created.description,
        requester: created.requester,
      });
      return dbOk(created);
    } catch (err) {
      return mapError(err);
    }
  });

export const listToolRequestsRpc = createServerFn({ method: "GET" }).handler(
  async (): Promise<DbResult<ToolRequestDTO[]>> => {
    const notConfigured = guardDbConfigured();
    if (notConfigured) return notConfigured;
    try {
      return dbOk(await listToolRequests());
    } catch (err) {
      return mapError(err);
    }
  },
);
