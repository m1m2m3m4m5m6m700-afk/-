/**
 * Conversation service — SERVER-ONLY.
 *
 * Implements the inbox management surface (TASK 3) backed by Postgres:
 *   - list / search conversations (filter by status/category/priority + search)
 *   - create conversation (+ first visitor message)
 *   - send message
 *   - update status / priority / star / pin / archive
 *   - delete conversation (cascade)
 *   - mark as read / unread (admin + visitor)
 *   - internal notes (add / delete)
 *
 * All functions throw a typed `DbServiceError` so the RPC layer can map to
 * `db_error` / `not_found` / `validation` without leaking SQL details.
 */

import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { getDb } from "../client";
import { conversations, messages, internalNotes, type StoredAttachment } from "../schema";
import type {
  ConversationDTO,
  MessageDTO,
  InternalNoteDTO,
  UserInfoDTO,
  InboxAnalyticsDTO,
} from "../types";

export class DbServiceError extends Error {
  constructor(
    public kind: "db_error" | "not_found" | "validation",
    message: string,
  ) {
    super(message);
    this.name = "DbServiceError";
  }
}

interface AttachmentDTOShape {
  id: string;
  name: string;
  type: "image" | "video" | "pdf" | "document" | "zip";
  url: string;
  size: string;
}

// ---- row → DTO mapping -----------------------------------------------------

function toUserInfo(c: typeof conversations.$inferSelect): UserInfoDTO {
  return {
    browser: c.visitorBrowser ?? "Browser Client",
    os: c.visitorOs ?? "Desktop",
    location: c.visitorLocation ?? null,
    ip: c.visitorIp ?? null,
    pageUrl: c.visitorPageUrl ?? "",
  };
}

function toMessageDTO(m: typeof messages.$inferSelect): MessageDTO {
  return {
    id: m.id,
    sender: m.sender,
    senderName: m.senderName,
    text: m.content,
    timestamp: m.createdAt.toISOString(),
    readStatus: m.readStatus as MessageDTO["readStatus"],
    attachments: (m.attachments ?? []) as AttachmentDTOShape[],
  };
}

function toNoteDTO(n: typeof internalNotes.$inferSelect): InternalNoteDTO {
  return {
    id: n.id,
    text: n.text,
    createdAt: n.createdAt.toISOString(),
    authorName: n.authorName,
  };
}

// ---- list / search (TASK 3) ------------------------------------------------

export interface ListConversationsFilters {
  status?: string;
  category?: string;
  priority?: string;
  unreadAdminOnly?: boolean;
}

export async function listConversations(
  filters: ListConversationsFilters = {},
): Promise<ConversationDTO[]> {
  const db = getDb();
  const conditions = [];
  if (filters.status && filters.status !== "all") {
    conditions.push(
      eq(conversations.status, filters.status as (typeof conversations.$inferSelect)["status"]),
    );
  }
  if (filters.category && filters.category !== "all") {
    conditions.push(
      eq(
        conversations.category,
        filters.category as (typeof conversations.$inferSelect)["category"],
      ),
    );
  }
  if (filters.priority && filters.priority !== "all") {
    conditions.push(
      eq(
        conversations.priority,
        filters.priority as (typeof conversations.$inferSelect)["priority"],
      ),
    );
  }
  if (filters.unreadAdminOnly) {
    conditions.push(eq(conversations.unreadByAdmin, true));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select()
    .from(conversations)
    .where(where)
    .orderBy(desc(conversations.pinned), desc(conversations.updatedAt));

  return Promise.all(rows.map((r) => loadConversationDTO(r.id, r)));
}

export async function getConversation(id: string): Promise<ConversationDTO | null> {
  const db = getDb();
  const [row] = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
  if (!row) return null;
  return loadConversationDTO(row.id, row);
}

async function loadConversationDTO(
  id: string,
  conv?: typeof conversations.$inferSelect,
): Promise<ConversationDTO> {
  const db = getDb();
  const c =
    conv ?? (await db.select().from(conversations).where(eq(conversations.id, id)).limit(1))[0];
  if (!c) throw new DbServiceError("not_found", "Conversation not found.");

  const msgRows = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));
  const noteRows = await db
    .select()
    .from(internalNotes)
    .where(eq(internalNotes.conversationId, id))
    .orderBy(asc(internalNotes.createdAt));

  return {
    id: c.id,
    visitorName: c.visitorName,
    visitorEmail: c.visitorEmail,
    visitorAvatar: c.visitorAvatar ?? undefined,
    category: c.category,
    subject: c.subject,
    status: c.status,
    priority: c.priority,
    starred: c.starred,
    pinned: c.pinned,
    archived: c.archived,
    unreadByVisitor: c.unreadByVisitor,
    unreadByAdmin: c.unreadByAdmin,
    userInfo: toUserInfo(c),
    messages: msgRows.map(toMessageDTO),
    internalNotes: noteRows.map(toNoteDTO),
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

// ---- create conversation ---------------------------------------------------

export interface CreateConversationInput {
  /** Optional client-supplied UUID so the caller can know the id synchronously. */
  id?: string;
  visitorName: string;
  visitorEmail: string;
  category: string;
  subject: string;
  messageText: string;
  attachments?: StoredAttachment[];
  userInfo?: Partial<UserInfoDTO>;
}

export async function createConversation(input: CreateConversationInput): Promise<ConversationDTO> {
  if (!input.messageText || input.messageText.trim().length === 0) {
    throw new DbServiceError("validation", "Message text is required.");
  }
  const db = getDb();
  const priority =
    input.category === "Report a Bug" || input.category === "Sponsor Request" ? "High" : "Medium";

  const [created] = await db
    .insert(conversations)
    .values({
      id: input.id, // defaultRandom() applies when undefined
      visitorName: input.visitorName || "Anonymous Visitor",
      visitorEmail: input.visitorEmail || "visitor@example.com",
      category: input.category as (typeof conversations.$inferSelect)["category"],
      subject: input.subject || `${input.category} Inquiry`,
      status: "New",
      priority: priority as (typeof conversations.$inferSelect)["priority"],
      unreadByAdmin: true,
      unreadByVisitor: false,
      visitorBrowser: input.userInfo?.browser ?? null,
      visitorOs: input.userInfo?.os ?? null,
      visitorLocation: input.userInfo?.location ?? null,
      visitorIp: input.userInfo?.ip ?? null,
      visitorPageUrl: input.userInfo?.pageUrl ?? null,
    })
    .returning();

  if (!created) throw new DbServiceError("db_error", "Failed to create conversation.");
  await db.insert(messages).values({
    conversationId: created.id,
    sender: "visitor",
    senderName: input.visitorName || "Visitor",
    content: input.messageText,
    attachments: input.attachments ?? [],
    readStatus: "sent",
  });
  return loadConversationDTO(created.id, created);
}

// ---- send message ----------------------------------------------------------

export async function sendMessage(
  conversationId: string,
  sender: "visitor" | "owner" | "system",
  senderName: string,
  text: string,
  attachments?: StoredAttachment[],
): Promise<ConversationDTO> {
  if (!text || text.trim().length === 0) {
    throw new DbServiceError("validation", "Message text is required.");
  }
  const db = getDb();
  const [exists] = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);
  if (!exists) throw new DbServiceError("not_found", "Conversation not found.");

  const newStatus =
    sender === "owner"
      ? ("Waiting for Reply" as (typeof conversations.$inferSelect)["status"])
      : sender === "visitor"
        ? ("Open" as (typeof conversations.$inferSelect)["status"])
        : undefined;

  await db.insert(messages).values({
    conversationId,
    sender,
    senderName,
    content: text,
    attachments: attachments ?? [],
    readStatus: sender === "system" ? "read" : "sent",
  });

  if (newStatus) {
    await db
      .update(conversations)
      .set({
        updatedAt: new Date(),
        status: newStatus,
        unreadByVisitor: sender === "owner",
        unreadByAdmin: sender !== "owner",
      })
      .where(eq(conversations.id, conversationId));
  } else {
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, conversationId));
  }
  return loadConversationDTO(conversationId);
}

// ---- status / priority / flags --------------------------------------------

export async function updateStatus(id: string, status: string): Promise<ConversationDTO> {
  const db = getDb();
  const [updated] = await db
    .update(conversations)
    .set({ status: status as (typeof conversations.$inferSelect)["status"], updatedAt: new Date() })
    .where(eq(conversations.id, id))
    .returning();
  if (!updated) throw new DbServiceError("not_found", "Conversation not found.");
  await db.insert(messages).values({
    conversationId: id,
    sender: "system",
    senderName: "System",
    content: `Status updated to "${status}"`,
    readStatus: "read",
  });
  return loadConversationDTO(id, updated);
}

export async function updatePriority(id: string, priority: string): Promise<ConversationDTO> {
  const db = getDb();
  const [updated] = await db
    .update(conversations)
    .set({
      priority: priority as (typeof conversations.$inferSelect)["priority"],
      updatedAt: new Date(),
    })
    .where(eq(conversations.id, id))
    .returning();
  if (!updated) throw new DbServiceError("not_found", "Conversation not found.");
  return loadConversationDTO(id, updated);
}

export async function toggleStar(id: string): Promise<ConversationDTO> {
  const db = getDb();
  await db
    .update(conversations)
    .set({ starred: sql`${conversations.starred} = NOT ${conversations.starred}` })
    .where(eq(conversations.id, id));
  return loadConversationDTO(id);
}

export async function togglePin(id: string): Promise<ConversationDTO> {
  const db = getDb();
  await db
    .update(conversations)
    .set({ pinned: sql`${conversations.pinned} = NOT ${conversations.pinned}` })
    .where(eq(conversations.id, id));
  return loadConversationDTO(id);
}

export async function toggleArchive(id: string): Promise<ConversationDTO> {
  const db = getDb();
  await db
    .update(conversations)
    .set({ archived: sql`${conversations.archived} = NOT ${conversations.archived}` })
    .where(eq(conversations.id, id));
  return loadConversationDTO(id);
}

// ---- delete (TASK 3) -------------------------------------------------------

export async function deleteConversation(id: string): Promise<void> {
  const db = getDb();
  // CASCADE on FK removes messages + internal_notes automatically.
  const result = await db
    .delete(conversations)
    .where(eq(conversations.id, id))
    .returning({ id: conversations.id });
  if (result.length === 0) throw new DbServiceError("not_found", "Conversation not found.");
}

// ---- read / unread (TASK 3) ------------------------------------------------

export async function markAsRead(
  id: string,
  forWhom: "admin" | "visitor",
): Promise<ConversationDTO> {
  const db = getDb();
  const patch = forWhom === "admin" ? { unreadByAdmin: false } : { unreadByVisitor: false };
  const [updated] = await db
    .update(conversations)
    .set(patch)
    .where(eq(conversations.id, id))
    .returning();
  if (!updated) throw new DbServiceError("not_found", "Conversation not found.");
  return loadConversationDTO(id, updated);
}

export async function markAsUnread(
  id: string,
  forWhom: "admin" | "visitor",
): Promise<ConversationDTO> {
  const db = getDb();
  const patch = forWhom === "admin" ? { unreadByAdmin: true } : { unreadByVisitor: true };
  const [updated] = await db
    .update(conversations)
    .set(patch)
    .where(eq(conversations.id, id))
    .returning();
  if (!updated) throw new DbServiceError("not_found", "Conversation not found.");
  return loadConversationDTO(id, updated);
}

// ---- internal notes --------------------------------------------------------

export async function addInternalNote(
  conversationId: string,
  text: string,
  authorName = "Flixo Owner",
): Promise<ConversationDTO> {
  if (!text || text.trim().length === 0) {
    throw new DbServiceError("validation", "Note text is required.");
  }
  const db = getDb();
  await db.insert(internalNotes).values({
    conversationId,
    text: text.trim(),
    authorName,
  });
  return loadConversationDTO(conversationId);
}

export async function deleteInternalNote(
  conversationId: string,
  noteId: string,
): Promise<ConversationDTO> {
  const db = getDb();
  await db.delete(internalNotes).where(eq(internalNotes.id, noteId));
  return loadConversationDTO(conversationId);
}

// ---- inbox analytics (real, no fabrication) --------------------------------

export async function getInboxAnalytics(): Promise<InboxAnalyticsDTO> {
  const db = getDb();
  const all = await db.select().from(conversations);
  const total = all.length;
  const unreadAdmin = all.filter((c) => c.unreadByAdmin).length;
  const open = all.filter(
    (c) => c.status === "New" || c.status === "Open" || c.status === "In Progress",
  ).length;
  const resolved = all.filter((c) => c.status === "Resolved" || c.status === "Closed").length;

  const categoryCounts: Record<string, number> = {};
  for (const c of all) {
    categoryCounts[c.category] = (categoryCounts[c.category] ?? 0) + 1;
  }
  const sorted = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  const topRequestedCategory = sorted.length > 0 ? sorted[0][0] : null;

  return {
    totalConversations: total,
    unreadAdmin,
    openConversations: open,
    resolvedConversations: resolved,
    categoryCounts,
    // No real response-time log / survey source exists yet — stays null.
    avgResponseTime: null,
    satisfactionScore: null,
    topRequestedCategory,
  };
}

// ---- search (TASK 3) -------------------------------------------------------

/**
 * Server-side search across visitor name/email/subject/message text. Returns
 * matching conversation ids so the RPC can hydrate DTOs. ILIKE for
 * portability (no dedicated FTS index dependency).
 */
export async function searchConversationIds(query: string): Promise<string[]> {
  const db = getDb();
  const q = `%${query.toLowerCase()}%`;
  const convMatches = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(
      or(
        ilike(sql`lower(${conversations.visitorName})`, q),
        ilike(sql`lower(${conversations.visitorEmail})`, q),
        ilike(sql`lower(${conversations.subject})`, q),
      ),
    );
  const msgMatches = await db
    .select({ id: messages.conversationId })
    .from(messages)
    .where(ilike(sql`lower(${messages.content})`, q));
  const ids = new Set<string>();
  convMatches.forEach((r) => ids.add(r.id));
  msgMatches.forEach((r) => {
    if (r.id) ids.add(r.id);
  });
  return [...ids];
}
