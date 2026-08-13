/**
 * Inbox RPC fetchers — client-importable.
 *
 * Replaces the localStorage `communicationStore` with Postgres-backed RPCs
 * (TASK 2). The UI contract is unchanged: every RPC returns the same DTO
 * shape (`ConversationDTO` / `InboxAnalyticsDTO`) the store returned.
 *
 * Guards (in order):
 *   1. `guardDbConfigured()` — real `db_not_configured` failure when no DB.
 *   2. CSRF (`verifyCsrf`) on mutating endpoints (login/contact/tool request
 *      pattern) — double-submit cookie + `x-csrf-token` header.
 *   3. Rate limiting on the public create-conversation/send-message endpoints.
 *
 * Mutations return the updated `ConversationDTO` so the client can replace
 * its local cache — no fake success, no silent stale state.
 *
 * Per the import-protection rule this module lives in `rpc/` (NOT `server/`)
 * and exports ONLY `createServerFn` fetchers; all server-only helpers
 * (`getDb`, services, guards) are imported inside handler bodies and thus
 * dead-stripped from the client bundle.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { guardDbConfigured, dbFail } from "../../server/db/guards";
import {
  createConversation as createConv,
  deleteConversation as deleteConv,
  deleteInternalNote as deleteNote,
  getConversation as getConv,
  getInboxAnalytics as getInboxStats,
  listConversations as listConvs,
  markAsRead as markRead,
  markAsUnread as markUnread,
  searchConversationIds as searchIds,
  sendMessage as sendMsg,
  toggleArchive as toggleArch,
  togglePin as togglePinFlag,
  toggleStar as toggleStarFlag,
  updatePriority as updatePrio,
  updateStatus as updateStat,
  addInternalNote as addNote,
  DbServiceError,
} from "../../server/db/service/conversations";
import { rateLimit, RATE_PRESETS, verifyCsrf } from "../../server/security/csrf";
import { notifyNewMessage } from "../../email/notify";
import { securityRequestMiddleware } from "../../security/requestMiddleware";
import type { ConversationDTO, DbResult, InboxAnalyticsDTO } from "../types";

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

const listSchema = z.object({
  status: z.string().optional(),
  category: z.string().optional(),
  priority: z.string().optional(),
  unreadAdminOnly: z.boolean().optional(),
  search: z.string().max(200).optional(),
});

export const listConversations = createServerFn({ method: "GET" })
  .validator(listSchema.optional())
  .handler(async ({ data }): Promise<DbResult<ConversationDTO[]>> => {
    const notConfigured = guardDbConfigured();
    if (notConfigured) return notConfigured;
    const filters = data ?? {};
    try {
      if (filters.search && filters.search.trim()) {
        const ids = await searchIds(filters.search.trim());
        const items = await Promise.all(ids.map((id) => getConv(id)));
        return dbOk(items.filter((c): c is ConversationDTO => c !== null));
      }
      return dbOk(
        await listConvs({
          status: filters.status,
          category: filters.category,
          priority: filters.priority,
          unreadAdminOnly: filters.unreadAdminOnly,
        }),
      );
    } catch (err) {
      return mapError(err);
    }
  });

const idSchema = z.object({ id: z.string().uuid() });

export const getConversation = createServerFn({ method: "GET" })
  .validator(idSchema)
  .handler(async ({ data }): Promise<DbResult<ConversationDTO | null>> => {
    const notConfigured = guardDbConfigured();
    if (notConfigured) return notConfigured;
    try {
      return dbOk(await getConv(data.id));
    } catch (err) {
      return mapError(err);
    }
  });

const createSchema = z.object({
  id: z.string().uuid().optional(),
  visitorName: z.string().min(1).max(200),
  visitorEmail: z.string().min(1).max(320),
  category: z.string().min(1).max(60),
  subject: z.string().min(1).max(300),
  messageText: z.string().min(1).max(10000),
  attachments: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().max(200),
        type: z.enum(["image", "video", "pdf", "document", "zip"]),
        url: z.string().max(2000),
        size: z.string().max(50),
      }),
    )
    .optional(),
  csrfToken: z.string().max(500).optional(),
  userInfo: z
    .object({
      browser: z.string().max(400).optional(),
      os: z.string().max(200).optional(),
      pageUrl: z.string().max(2000).optional(),
    })
    .optional(),
});

export const createConversation = createServerFn({ method: "POST" })
  .validator(createSchema)
  .middleware([securityRequestMiddleware])
  .handler(async ({ context, data }): Promise<DbResult<ConversationDTO>> => {
    const notConfigured = guardDbConfigured();
    if (notConfigured) return notConfigured;
    const csrf = checkCsrf(context.csrfCookie, data.csrfToken ?? null);
    if (csrf !== true) return csrf;
    const rl = rateLimit(`contact:${context.clientIp ?? "anon"}`, RATE_PRESETS.contact);
    if (!rl.allowed) {
      return dbFail("validation", "Too many requests. Please try again later.");
    }
    try {
      const created = await createConv({
        id: data.id,
        visitorName: data.visitorName,
        visitorEmail: data.visitorEmail,
        category: data.category,
        subject: data.subject,
        messageText: data.messageText,
        attachments: data.attachments,
        userInfo: data.userInfo,
      });
      void notifyNewMessage({
        visitorName: created.visitorName,
        visitorEmail: created.visitorEmail,
        category: created.category,
        subject: created.subject,
        messageText: data.messageText,
      });
      return dbOk(created);
    } catch (err) {
      return mapError(err);
    }
  });

const sendSchema = z.object({
  conversationId: z.string().uuid(),
  sender: z.enum(["visitor", "owner", "system"]),
  senderName: z.string().min(1).max(200),
  text: z.string().min(1).max(10000),
  attachments: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().max(200),
        type: z.enum(["image", "video", "pdf", "document", "zip"]),
        url: z.string().max(2000),
        size: z.string().max(50),
      }),
    )
    .optional(),
  csrfToken: z.string().max(500).optional(),
});

export const sendMessage = createServerFn({ method: "POST" })
  .validator(sendSchema)
  .middleware([securityRequestMiddleware])
  .handler(async ({ context, data }): Promise<DbResult<ConversationDTO>> => {
    const notConfigured = guardDbConfigured();
    if (notConfigured) return notConfigured;
    const csrf = checkCsrf(context.csrfCookie, data.csrfToken ?? null);
    if (csrf !== true) return csrf;
    const rl = rateLimit(`contact:${context.clientIp ?? "anon"}`, RATE_PRESETS.contact);
    if (!rl.allowed) {
      return dbFail("validation", "Too many messages. Please try again later.");
    }
    try {
      const updated = await sendMsg(
        data.conversationId,
        data.sender,
        data.senderName,
        data.text,
        data.attachments,
      );
      if (data.sender === "visitor") {
        void notifyNewMessage({
          visitorName: updated.visitorName,
          visitorEmail: updated.visitorEmail,
          category: updated.category,
          subject: updated.subject,
          messageText: data.text,
        });
      }
      return dbOk(updated);
    } catch (err) {
      return mapError(err);
    }
  });

const simpleIdSchema = z.object({
  id: z.string().uuid(),
  csrfToken: z.string().max(500).optional(),
});

export const updateStatus = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().uuid(),
      status: z.string().min(1).max(40),
      csrfToken: z.string().max(500).optional(),
    }),
  )
  .middleware([securityRequestMiddleware])
  .handler(async ({ context, data }): Promise<DbResult<ConversationDTO>> => {
    const notConfigured = guardDbConfigured();
    if (notConfigured) return notConfigured;
    const csrf = checkCsrf(context.csrfCookie, data.csrfToken ?? null);
    if (csrf !== true) return csrf;
    try {
      return dbOk(await updateStat(data.id, data.status));
    } catch (err) {
      return mapError(err);
    }
  });

export const updatePriority = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().uuid(),
      priority: z.string().min(1).max(40),
      csrfToken: z.string().max(500).optional(),
    }),
  )
  .middleware([securityRequestMiddleware])
  .handler(async ({ context, data }): Promise<DbResult<ConversationDTO>> => {
    const notConfigured = guardDbConfigured();
    if (notConfigured) return notConfigured;
    const csrf = checkCsrf(context.csrfCookie, data.csrfToken ?? null);
    if (csrf !== true) return csrf;
    try {
      return dbOk(await updatePrio(data.id, data.priority));
    } catch (err) {
      return mapError(err);
    }
  });

export const toggleStar = createServerFn({ method: "POST" })
  .validator(simpleIdSchema)
  .middleware([securityRequestMiddleware])
  .handler(async ({ context, data }): Promise<DbResult<ConversationDTO>> => {
    const notConfigured = guardDbConfigured();
    if (notConfigured) return notConfigured;
    const csrf = checkCsrf(context.csrfCookie, data.csrfToken ?? null);
    if (csrf !== true) return csrf;
    try {
      return dbOk(await toggleStarFlag(data.id));
    } catch (err) {
      return mapError(err);
    }
  });

export const togglePin = createServerFn({ method: "POST" })
  .validator(simpleIdSchema)
  .middleware([securityRequestMiddleware])
  .handler(async ({ context, data }): Promise<DbResult<ConversationDTO>> => {
    const notConfigured = guardDbConfigured();
    if (notConfigured) return notConfigured;
    const csrf = checkCsrf(context.csrfCookie, data.csrfToken ?? null);
    if (csrf !== true) return csrf;
    try {
      return dbOk(await togglePinFlag(data.id));
    } catch (err) {
      return mapError(err);
    }
  });

export const toggleArchive = createServerFn({ method: "POST" })
  .validator(simpleIdSchema)
  .middleware([securityRequestMiddleware])
  .handler(async ({ context, data }): Promise<DbResult<ConversationDTO>> => {
    const notConfigured = guardDbConfigured();
    if (notConfigured) return notConfigured;
    const csrf = checkCsrf(context.csrfCookie, data.csrfToken ?? null);
    if (csrf !== true) return csrf;
    try {
      return dbOk(await toggleArch(data.id));
    } catch (err) {
      return mapError(err);
    }
  });

export const deleteConversation = createServerFn({ method: "POST" })
  .validator(simpleIdSchema)
  .middleware([securityRequestMiddleware])
  .handler(async ({ context, data }): Promise<DbResult<{ id: string }>> => {
    const notConfigured = guardDbConfigured();
    if (notConfigured) return notConfigured;
    const csrf = checkCsrf(context.csrfCookie, data.csrfToken ?? null);
    if (csrf !== true) return csrf;
    try {
      await deleteConv(data.id);
      return dbOk({ id: data.id });
    } catch (err) {
      return mapError(err);
    }
  });

export const markAsRead = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().uuid(),
      forWhom: z.enum(["admin", "visitor"]),
      csrfToken: z.string().max(500).optional(),
    }),
  )
  .middleware([securityRequestMiddleware])
  .handler(async ({ context, data }): Promise<DbResult<ConversationDTO>> => {
    const notConfigured = guardDbConfigured();
    if (notConfigured) return notConfigured;
    const csrf = checkCsrf(context.csrfCookie, data.csrfToken ?? null);
    if (csrf !== true) return csrf;
    try {
      return dbOk(await markRead(data.id, data.forWhom));
    } catch (err) {
      return mapError(err);
    }
  });

export const markAsUnread = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().uuid(),
      forWhom: z.enum(["admin", "visitor"]),
      csrfToken: z.string().max(500).optional(),
    }),
  )
  .middleware([securityRequestMiddleware])
  .handler(async ({ context, data }): Promise<DbResult<ConversationDTO>> => {
    const notConfigured = guardDbConfigured();
    if (notConfigured) return notConfigured;
    const csrf = checkCsrf(context.csrfCookie, data.csrfToken ?? null);
    if (csrf !== true) return csrf;
    try {
      return dbOk(await markUnread(data.id, data.forWhom));
    } catch (err) {
      return mapError(err);
    }
  });

export const addInternalNote = createServerFn({ method: "POST" })
  .validator(
    z.object({
      conversationId: z.string().uuid(),
      text: z.string().min(1).max(2000),
      csrfToken: z.string().max(500).optional(),
    }),
  )
  .middleware([securityRequestMiddleware])
  .handler(async ({ context, data }): Promise<DbResult<ConversationDTO>> => {
    const notConfigured = guardDbConfigured();
    if (notConfigured) return notConfigured;
    const csrf = checkCsrf(context.csrfCookie, data.csrfToken ?? null);
    if (csrf !== true) return csrf;
    try {
      return dbOk(await addNote(data.conversationId, data.text));
    } catch (err) {
      return mapError(err);
    }
  });

export const deleteInternalNote = createServerFn({ method: "POST" })
  .validator(
    z.object({
      conversationId: z.string().uuid(),
      noteId: z.string().uuid(),
      csrfToken: z.string().max(500).optional(),
    }),
  )
  .middleware([securityRequestMiddleware])
  .handler(async ({ context, data }): Promise<DbResult<ConversationDTO>> => {
    const notConfigured = guardDbConfigured();
    if (notConfigured) return notConfigured;
    const csrf = checkCsrf(context.csrfCookie, data.csrfToken ?? null);
    if (csrf !== true) return csrf;
    try {
      return dbOk(await deleteNote(data.conversationId, data.noteId));
    } catch (err) {
      return mapError(err);
    }
  });

export const getInboxAnalytics = createServerFn({ method: "GET" }).handler(
  async (): Promise<DbResult<InboxAnalyticsDTO>> => {
    const notConfigured = guardDbConfigured();
    if (notConfigured) return notConfigured;
    try {
      return dbOk(await getInboxStats());
    } catch (err) {
      return mapError(err);
    }
  },
);
