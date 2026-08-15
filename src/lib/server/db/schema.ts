/**
 * Drizzle schema — SERVER-ONLY.
 *
 * Defines the PostgreSQL tables backing Flixo's communication + analytics
 * surfaces, plus the single owner/admin bootstrap account.
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
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const conversationStatusEnum = pgEnum("conversation_status", [
  "New",
  "Open",
  "Waiting for Reply",
  "In Progress",
  "Resolved",
  "Closed",
]);

export const conversationPriorityEnum = pgEnum("conversation_priority", ["Low", "Medium", "High", "Urgent"]);
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
export const toolRequestStatusEnum = pgEnum("tool_request_status", ["pending", "in_review", "approved", "rejected", "implemented"]);
export const analyticsEventTypeEnum = pgEnum("analytics_event_type", [
  "page_view",
  "search",
  "tool_click",
  "category_click",
  "download",
  "external_link_click",
  "copy",
  "session_start",
  "session_end",
  "tool_start",
  "tool_complete",
  "navigation",
  "survey_response",
]);

/** Supported survey interaction controls. Configuration-specific details live in surveyQuestions.config. */
export const surveyQuestionTypeEnum = pgEnum("survey_question_type", [
  "single_choice",
  "multi_choice",
  "dropdown",
  "scale",
  "rating",
  "nps",
  "yes_no",
  "text",
  "textarea",
  "number",
  "date",
  "email",
  "url",
  "ranking",
  "matrix_single",
  "matrix_multi",
  "consent",
]);

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

export interface StoredAttachment {
  id: string;
  name: string;
  type: "image" | "video" | "pdf" | "document" | "zip";
  url: string;
  size: string;
}

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  sender: messageSenderEnum("sender").notNull(),
  senderName: text("sender_name").notNull(),
  content: text("content").notNull(),
  attachments: jsonb("attachments").$type<StoredAttachment[]>().default([]).notNull(),
  readStatus: text("read_status").notNull().default("sent"),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const internalNotes = pgTable("internal_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  authorName: text("author_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const toolRequests = pgTable("tool_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  toolName: text("tool_name").notNull(),
  description: text("description").notNull(),
  requester: text("requester").notNull(),
  status: toolRequestStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventType: analyticsEventTypeEnum("event_type").notNull(),
  sessionId: text("session_id"),
  locale: text("locale"),
  intentId: text("intent_id"),
  toolId: text("tool_id"),
  category: text("category"),
  queryHash: text("query_hash"),
  country: text("country"),
  device: text("device"),
  referrerOrigin: text("referrer_origin"),
  path: text("path"),
  previousPath: text("previous_path"),
  durationMs: integer("duration_ms"),
  resultCount: integer("result_count"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const surveys = pgTable("surveys", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  active: boolean("active").notNull().default(false),
  targetLocale: text("target_locale"),
  maxResponses: integer("max_responses"),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const surveyQuestions = pgTable("survey_questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  surveyId: uuid("survey_id").notNull().references(() => surveys.id, { onDelete: "cascade" }),
  type: surveyQuestionTypeEnum("type").notNull(),
  prompt: text("prompt").notNull(),
  options: jsonb("options").$type<string[]>().default([]).notNull(),
  config: jsonb("config").$type<Record<string, unknown>>().default({}).notNull(),
  required: boolean("required").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const surveyResponses = pgTable("survey_responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  surveyId: uuid("survey_id").notNull().references(() => surveys.id, { onDelete: "cascade" }),
  sessionId: text("session_id"),
  locale: text("locale"),
  answers: jsonb("answers").$type<Record<string, string | string[] | number | boolean | null>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminAccounts = pgTable(
  "admin_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    singletonKey: text("singleton_key").notNull().default("owner"),
    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    sessionSecret: text("session_secret").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    singletonKeyUnique: uniqueIndex("admin_accounts_singleton_key_idx").on(table.singletonKey),
    emailUnique: uniqueIndex("admin_accounts_email_idx").on(table.email),
  }),
);

export const toolReviews = pgTable(
  "tool_reviews",
  {
    slug: text("slug").primaryKey(),
    reviewed: boolean("reviewed").notNull().default(false),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewedBy: text("reviewed_by"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    reviewedIndex: uniqueIndex("tool_reviews_reviewed_idx").on(table.reviewed, table.slug),
  }),
);
