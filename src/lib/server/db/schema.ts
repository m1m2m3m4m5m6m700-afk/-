/**
 * Drizzle schema — SERVER-ONLY.
 *
 * Defines the PostgreSQL tables backing Flixo's communication + analytics
 * surfaces. Pure schema/types: imports only `drizzle-orm/pg-core` (no
 * connection, no env, no runtime). Safe to import from other server-only
 * modules; never importable by client code (lives under `src/lib/server/`,
 * which TanStack Start's import-protection forbids for client bundles).
 *
 * Migrations are generated via `drizzle-kit` (`npm run db:generate`) against a
 * real `DATABASE_URL` and committed. The app reads schema types at build time
 * and talks to Postgres at runtime only when `DATABASE_URL` is configured (see
 * `config.ts` — completable-later pattern, identical to the GitHub/AI/Admin
 * layers). No fabricated data is ever returned: every DB-backed RPC returns a
 * real `not_configured` failure when the database is unavailable.
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  jsonb,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

// ---- enums (matching the existing UI union types verbatim) ----------------

export const conversationStatusEnum = pgEnum("conversation_status", [
  "New",
  "Open",
  "Waiting for Reply",
  "In Progress",
  "Resolved",
  "Closed",
]);

export const conversationPriorityEnum = pgEnum("conversation_priority", [
  "Low",
  "Medium",
  "High",
  "Urgent",
]);

export const conversationCategoryEnum = pgEnum("conversation_category", [
  "Ask a Question",
  "Report a Bug",
  "Request a Tool",
  "Business Inquiry",
  "Sponsor Request",
  "Partnership",
  "General Support",
]);

export const messageSenderEnum = pgEnum("message_sender", ["visitor", "owner", "system"]);

export const toolRequestStatusEnum = pgEnum("tool_request_status", [
  "pending",
  "in_review",
  "approved",
  "rejected",
  "implemented",
]);

export const analyticsEventTypeEnum = pgEnum("analytics_event_type", [
  "page_view",
  "search",
  "tool_click",
  "category_click",
  "download",
  "external_link_click",
  "copy",
]);

// ---- conversations ---------------------------------------------------------

export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  visitorName: text("visitor_name").notNull(),
  visitorEmail: text("visitor_email").notNull(),
  visitorAvatar: text("visitor_avatar"),
  category: conversationCategoryEnum("category").notNull(),
  subject: text("subject").notNull(),
  status: conversationStatusEnum("status").notNull().default("New"),
  priority: conversationPriorityEnum("priority").notNull().default("Medium"),
  starred: boolean("starred").notNull().default(false),
  pinned: boolean("pinned").notNull().default(false),
  archived: boolean("archived").notNull().default(false),
  unreadByVisitor: boolean("unread_by_visitor").notNull().default(false),
  unreadByAdmin: boolean("unread_by_admin").notNull().default(true),
  visitorBrowser: text("visitor_browser"),
  visitorOs: text("visitor_os"),
  visitorLocation: text("visitor_location"),
  visitorIp: text("visitor_ip"),
  visitorPageUrl: text("visitor_page_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---- messages --------------------------------------------------------------

export interface StoredAttachment {
  id: string;
  name: string;
  type: "image" | "video" | "pdf" | "document" | "zip";
  url: string;
  size: string;
}

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  sender: messageSenderEnum("sender").notNull(),
  senderName: text("sender_name").notNull(),
  content: text("content").notNull(),
  attachments: jsonb("attachments").$type<StoredAttachment[]>().default([]).notNull(),
  readStatus: text("read_status").notNull().default("sent"),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Internal notes: separate table (append-only log per conversation). */
export const internalNotes = pgTable("internal_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  authorName: text("author_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---- tool_requests ---------------------------------------------------------

export const toolRequests = pgTable("tool_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  toolName: text("tool_name").notNull(),
  description: text("description").notNull(),
  requester: text("requester").notNull(),
  status: toolRequestStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---- analytics_events ------------------------------------------------------

export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventType: analyticsEventTypeEnum("event_type").notNull(),
  toolId: text("tool_id"),
  category: text("category"),
  query: text("query"),
  country: text("country"),
  device: text("device"),
  referrer: text("referrer"),
  path: text("path"),
  resultCount: integer("result_count"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
