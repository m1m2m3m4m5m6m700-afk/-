import { useCallback, useEffect, useRef, useState } from "react";
import { SITE_URL } from "@/lib/seo/site";
import {
  listConversations as listConversationsRpc,
  getConversation as getConversationRpc,
  createConversation as createConversationRpc,
  sendMessage as sendMessageRpc,
  updateStatus as updateStatusRpc,
  updatePriority as updatePriorityRpc,
  toggleStar as toggleStarRpc,
  togglePin as togglePinRpc,
  toggleArchive as toggleArchiveRpc,
  deleteConversation as deleteConversationRpc,
  markAsRead as markAsReadRpc,
  markAsUnread as markAsUnreadRpc,
  addInternalNote as addInternalNoteRpc,
  deleteInternalNote as deleteInternalNoteRpc,
  getInboxAnalytics as getInboxAnalyticsRpc,
} from "@/lib/db/rpc/inbox.rpc";
import { getCsrfToken } from "@/lib/security/rpc/csrf.rpc";
import type {
  ConversationDTO,
  MessageDTO,
  InternalNoteDTO,
  UserInfoDTO,
  InboxAnalyticsDTO,
  DbFailure,
} from "@/lib/db/types";

// Re-export the union types the UI imports from this module, unchanged.
export type ConversationCategory =
  | "Ask a Question"
  | "Report a Bug"
  | "Request a Tool"
  | "Business Inquiry"
  | "Sponsor Request"
  | "Partnership"
  | "General Support";

export type ConversationStatus =
  "New" | "Open" | "Waiting for Reply" | "In Progress" | "Resolved" | "Closed";

export type ConversationPriority = "Low" | "Medium" | "High" | "Urgent";

export interface Attachment {
  id: string;
  name: string;
  type: "image" | "video" | "pdf" | "document" | "zip";
  url: string;
  size: string;
}

export type Message = MessageDTO;

export type InternalNote = InternalNoteDTO;

export type UserInfo = UserInfoDTO;

export type Conversation = ConversationDTO;

export type ConversationFailure = DbFailure;

/**
 * Inbox analytics shape — identical to the legacy store's `getAnalytics()`
 * return so the AdminInbox UI is unchanged. `avgResponseTime` and
 * `satisfactionScore` stay null until real sources exist (never fabricated).
 */
export type CommunicationAnalytics = InboxAnalyticsDTO;

// Default analytics shown before the first server load (and when the DB is
// not configured). Mirrors the legacy store's empty-table behavior.
const EMPTY_ANALYTICS: CommunicationAnalytics = {
  totalConversations: 0,
  unreadAdmin: 0,
  openConversations: 0,
  resolvedConversations: 0,
  categoryCounts: {},
  avgResponseTime: null,
  satisfactionScore: null,
  topRequestedCategory: null,
};

function isFailure<T>(r: T | DbFailure): r is DbFailure {
  return (
    r !== null &&
    typeof r === "object" &&
    (r as DbFailure).ok === false &&
    "kind" in (r as DbFailure)
  );
}

/**
 * Fetch (and cache) a CSRF token for mutating requests. The token is issued
 * via a Set-Cookie by the server and must be echoed back as `x-csrf-token`.
 * Fetched once per session; best-effort — if it fails, mutations will return
 * a CSRF validation failure (the UI surfaces it).
 */
let csrfTokenPromise: Promise<string> | null = null;
async function getCsrf(): Promise<string> {
  if (!csrfTokenPromise) {
    csrfTokenPromise = (async () => {
      try {
        const r = await getCsrfToken();
        return (r as { token?: string }).token ?? "";
      } catch {
        return "";
      }
    })();
    void csrfTokenPromise.catch(() => {
      csrfTokenPromise = null;
    });
  }
  return csrfTokenPromise;
}

/**
 * `useCommunicationStore` — thin client over the Postgres-backed inbox RPCs.
 *
 * This preserves the EXACT public API the UI relied on (same method names +
 * return shapes), so `AdminInbox`, `ContactOwnerPage`, and
 * `VisitorChatWidget` work unchanged. localStorage is no longer the source
 * of truth — the database is. When the database is not configured, the RPCs
 * return a real `db_not_configured` failure and this hook surfaces an empty
 * list + empty analytics (never fabricated data).
 */
export function useCommunicationStore() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [analytics, setAnalytics] = useState<CommunicationAnalytics>(EMPTY_ANALYTICS);
  const [error, setError] = useState<string | null>(null);
  const [lastError, setLastError] = useState<ConversationFailure | null>(null);
  const initialized = useRef(false);

  const refresh = useCallback(async () => {
    const [listResult, analyticsResult] = await Promise.all([
      listConversationsRpc({ data: undefined }),
      getInboxAnalyticsRpc(),
    ]);
    if (isFailure(listResult)) {
      setLastError(listResult);
      setError(listResult.message);
      setConversations([]);
    } else {
      setConversations(listResult as Conversation[]);
      setError(null);
      setLastError(null);
    }
    if (isFailure(analyticsResult)) {
      setAnalytics(EMPTY_ANALYTICS);
    } else {
      setAnalytics(analyticsResult as CommunicationAnalytics);
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    void refresh();
  }, [refresh]);

  // ---- mutations: each calls the RPC, then refreshes from the server ----

  const createConversation = useCallback(
    (data: {
      visitorName: string;
      visitorEmail: string;
      category: ConversationCategory;
      subject: string;
      messageText: string;
      attachments?: Attachment[];
    }): Conversation => {
      // Generate a UUID client-side so the caller knows the id synchronously
      // (the UI sets activeConvId / submittedId immediately). The same id is
      // passed to the server insert so optimistic + persisted rows match.
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `conv-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const now = new Date().toISOString();
      const priority: ConversationPriority =
        data.category === "Report a Bug" || data.category === "Sponsor Request" ? "High" : "Medium";
      const optimistic: Conversation = {
        id,
        visitorName: data.visitorName || "Anonymous Visitor",
        visitorEmail: data.visitorEmail || "visitor@example.com",
        visitorAvatar: undefined,
        category: data.category,
        subject: data.subject || `${data.category} Inquiry`,
        status: "New",
        priority,
        starred: false,
        pinned: false,
        archived: false,
        unreadByVisitor: false,
        unreadByAdmin: true,
        userInfo: {
          browser: typeof navigator !== "undefined" ? navigator.userAgent : "Browser Client",
          os: typeof navigator !== "undefined" ? navigator.platform : "Desktop",
          location: null,
          ip: null,
          pageUrl: typeof window !== "undefined" ? window.location.href : SITE_URL,
        },
        messages: [
          {
            id: `${id}-msg-0`,
            sender: "visitor",
            senderName: data.visitorName || "Visitor",
            text: data.messageText,
            timestamp: now,
            readStatus: "sent",
            attachments: data.attachments ?? [],
          },
        ],
        internalNotes: [],
        createdAt: now,
        updatedAt: now,
      };

      // Optimistically insert at the top of the local list so the UI is
      // immediately responsive; the server confirms via the RPC + refresh.
      setConversations((prev) => [optimistic, ...prev]);

      void (async () => {
        const csrf = await getCsrf();
        const result = await createConversationRpc({
          data: {
            id,
            visitorName: data.visitorName,
            visitorEmail: data.visitorEmail,
            category: data.category,
            subject: data.subject,
            messageText: data.messageText,
            attachments: data.attachments,
            csrfToken: csrf,
            userInfo: {
              browser: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
              os: typeof navigator !== "undefined" ? navigator.platform : undefined,
              pageUrl: typeof window !== "undefined" ? window.location.href : SITE_URL,
            },
          },
        });
        if (isFailure(result)) {
          setLastError(result);
          setError(result.message);
          // Drop the optimistic row on failure so the list stays truthful.
          setConversations((prev) => prev.filter((c) => c.id !== id));
          return;
        }
        await refresh();
      })();

      return optimistic;
    },
    [refresh],
  );

  const sendMessage = useCallback(
    async (
      conversationId: string,
      sender: "visitor" | "owner",
      senderName: string,
      text: string,
      attachments?: Attachment[],
    ): Promise<void> => {
      const csrf = await getCsrf();
      const result = await sendMessageRpc({
        data: {
          conversationId,
          sender,
          senderName,
          text,
          attachments,
          csrfToken: csrf,
        },
      });
      if (isFailure(result)) {
        setLastError(result);
        setError(result.message);
        return;
      }
      await refresh();
    },
    [refresh],
  );

  const updateStatus = useCallback(
    async (id: string, status: ConversationStatus): Promise<void> => {
      const csrf = await getCsrf();
      const result = await updateStatusRpc({ data: { id, status, csrfToken: csrf } });
      if (isFailure(result)) {
        setLastError(result);
        setError(result.message);
        return;
      }
      await refresh();
    },
    [refresh],
  );

  const updatePriority = useCallback(
    async (id: string, priority: ConversationPriority): Promise<void> => {
      const csrf = await getCsrf();
      const result = await updatePriorityRpc({ data: { id, priority, csrfToken: csrf } });
      if (isFailure(result)) {
        setLastError(result);
        setError(result.message);
        return;
      }
      await refresh();
    },
    [refresh],
  );

  const toggleStar = useCallback(
    async (id: string): Promise<void> => {
      const csrf = await getCsrf();
      const result = await toggleStarRpc({ data: { id, csrfToken: csrf } });
      if (isFailure(result)) {
        setLastError(result);
        setError(result.message);
        return;
      }
      await refresh();
    },
    [refresh],
  );

  const togglePin = useCallback(
    async (id: string): Promise<void> => {
      const csrf = await getCsrf();
      const result = await togglePinRpc({ data: { id, csrfToken: csrf } });
      if (isFailure(result)) {
        setLastError(result);
        setError(result.message);
        return;
      }
      await refresh();
    },
    [refresh],
  );

  const toggleArchive = useCallback(
    async (id: string): Promise<void> => {
      const csrf = await getCsrf();
      const result = await toggleArchiveRpc({ data: { id, csrfToken: csrf } });
      if (isFailure(result)) {
        setLastError(result);
        setError(result.message);
        return;
      }
      await refresh();
    },
    [refresh],
  );

  const addInternalNote = useCallback(
    async (id: string, text: string): Promise<void> => {
      const csrf = await getCsrf();
      const result = await addInternalNoteRpc({
        data: { conversationId: id, text, csrfToken: csrf },
      });
      if (isFailure(result)) {
        setLastError(result);
        setError(result.message);
        return;
      }
      await refresh();
    },
    [refresh],
  );

  const deleteInternalNote = useCallback(
    async (id: string, noteId: string): Promise<void> => {
      const csrf = await getCsrf();
      const result = await deleteInternalNoteRpc({
        data: { conversationId: id, noteId, csrfToken: csrf },
      });
      if (isFailure(result)) {
        setLastError(result);
        setError(result.message);
        return;
      }
      await refresh();
    },
    [refresh],
  );

  const markAsRead = useCallback(
    async (id: string, forWho: "admin" | "visitor"): Promise<void> => {
      const csrf = await getCsrf();
      const result = await markAsReadRpc({
        data: { id, forWhom: forWho, csrfToken: csrf },
      });
      if (isFailure(result)) {
        setLastError(result);
        setError(result.message);
        return;
      }
      await refresh();
    },
    [refresh],
  );

  // Backwards-compat: a sync-looking wrapper is NOT possible with async RPCs.
  // The UI calls these handlers in fire-and-forget style (onClick), so the
  // returned promise is intentionally not awaited by the UI — the hook
  // re-fetches the real server state after each mutation and the UI re-renders.

  const getConversation = useCallback(
    (id: string): Conversation | undefined => conversations.find((c) => c.id === id),
    [conversations],
  );

  return {
    conversations,
    getConversation,
    createConversation,
    sendMessage,
    updateStatus,
    updatePriority,
    toggleStar,
    togglePin,
    toggleArchive,
    addInternalNote,
    deleteInternalNote,
    markAsRead,
    analytics,
    error,
    lastError,
    refresh,
  };
}

// Backwards-compat singleton export (some non-hook callers may import it). It
// is intentionally a no-op shim: the class-based store is gone; all
// persistence now flows through the DB-backed hook above. Keeping the export
// avoids breaking any stray imports without re-introducing localStorage.
export const communicationStore = {
  init() {},
  getConversations(): Conversation[] {
    return [];
  },
  getConversation(): Conversation | undefined {
    return undefined;
  },
  getAnalytics(): CommunicationAnalytics {
    return EMPTY_ANALYTICS;
  },
  subscribe(): () => void {
    return () => {};
  },
} as const;
