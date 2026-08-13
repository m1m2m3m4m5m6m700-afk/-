/**
 * Database layer — shared types (client-safe subset).
 *
 * These describe the RESULT shapes returned to the client. They contain NO
 * connection strings, NO SQL, NO pool handles. The actual DB rows (server-only
 * Drizzle types) are mapped to these public shapes before crossing the RPC
 * boundary. Re-exported by `src/lib/db/types.ts` for client import.
 */

export type DbFailureKind = "db_not_configured" | "db_error" | "not_found" | "validation";

export interface DbFailure {
  ok: false;
  kind: DbFailureKind;
  message: string;
}

/**
 * Public conversation/message shapes mirroring the legacy
 * `communicationStore` types exactly, so the UI contract is unchanged. These
 * are what the client receives after the server maps DB rows → public DTOs.
 */
export interface AttachmentDTO {
  id: string;
  name: string;
  type: "image" | "video" | "pdf" | "document" | "zip";
  url: string;
  size: string;
}

export interface MessageDTO {
  id: string;
  sender: "visitor" | "owner" | "system";
  senderName: string;
  text: string;
  timestamp: string;
  readStatus: "sent" | "delivered" | "read";
  attachments?: AttachmentDTO[];
}

export interface InternalNoteDTO {
  id: string;
  text: string;
  createdAt: string;
  authorName: string;
}

export interface UserInfoDTO {
  browser: string;
  os: string;
  location: string | null;
  ip: string | null;
  pageUrl: string;
}

export interface ConversationDTO {
  id: string;
  visitorName: string;
  visitorEmail: string;
  visitorAvatar?: string;
  category:
    | "Ask a Question"
    | "Report a Bug"
    | "Request a Tool"
    | "Business Inquiry"
    | "Sponsor Request"
    | "Partnership"
    | "General Support";
  subject: string;
  status: "New" | "Open" | "Waiting for Reply" | "In Progress" | "Resolved" | "Closed";
  priority: "Low" | "Medium" | "High" | "Urgent";
  starred: boolean;
  pinned: boolean;
  archived: boolean;
  unreadByVisitor: boolean;
  unreadByAdmin: boolean;
  userInfo: UserInfoDTO;
  messages: MessageDTO[];
  internalNotes: InternalNoteDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface InboxAnalyticsDTO {
  totalConversations: number;
  unreadAdmin: number;
  openConversations: number;
  resolvedConversations: number;
  categoryCounts: Record<string, number>;
  /** Response time is null until a real source exists — never fabricated. */
  avgResponseTime: string | null;
  /** Satisfaction is null until a real survey/feedback source exists. */
  satisfactionScore: string | null;
  topRequestedCategory: string | null;
}

export interface GlobalAnalyticsDTO {
  totalVisitors: number;
  totalEvents: number;
  mostUsedTools: { toolId: string; count: number }[];
  trafficSources: { referrer: string; count: number }[];
  countries: { country: string; count: number }[];
  devices: { device: string; count: number }[];
  recentEvents: {
    id: string;
    eventType: string;
    toolId: string | null;
    country: string | null;
    device: string | null;
    referrer: string | null;
    createdAt: string;
  }[];
}

export interface ToolRequestDTO {
  id: string;
  toolName: string;
  description: string;
  requester: string;
  status: string;
  createdAt: string;
}

export type DbResult<T> = T | DbFailure;
