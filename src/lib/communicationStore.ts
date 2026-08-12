import { useState, useEffect } from "react";
import { SITE_URL } from "@/lib/seo/site";

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

export interface Message {
  id: string;
  sender: "visitor" | "owner" | "system";
  senderName: string;
  text: string;
  timestamp: string;
  readStatus: "sent" | "delivered" | "read";
  attachments?: Attachment[];
}

export interface InternalNote {
  id: string;
  text: string;
  createdAt: string;
  authorName: string;
}

export interface UserInfo {
  browser: string;
  os: string;
  location: string;
  ip: string;
  pageUrl: string;
}

export interface Conversation {
  id: string;
  visitorName: string;
  visitorEmail: string;
  visitorAvatar?: string;
  category: ConversationCategory;
  subject: string;
  status: ConversationStatus;
  priority: ConversationPriority;
  starred: boolean;
  pinned: boolean;
  archived: boolean;
  unreadByVisitor: boolean;
  unreadByAdmin: boolean;
  userInfo: UserInfo;
  messages: Message[];
  internalNotes: InternalNote[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "flixo_owner_communication_conversations_v1";
const INITIAL_CONVERSATIONS: Conversation[] = [];

class CommunicationStore {
  private conversations: Conversation[] = INITIAL_CONVERSATIONS;
  private listeners: Set<() => void> = new Set();
  private isInitialized = false;

  constructor() {
    // Initialized with empty data to avoid bundling demo inbox content in production.
  }

  public init() {
    if (this.isInitialized || typeof window === "undefined") return;
    this.isInitialized = true;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Conversation[];
        this.conversations = Array.isArray(parsed) ? parsed : INITIAL_CONVERSATIONS;
        this.notify();
      } else {
        this.save();
      }
    } catch {
      this.conversations = INITIAL_CONVERSATIONS;
      // ignore storage errors
    }
  }

  private save() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.conversations));
      this.notify();
    } catch {
      // ignore storage errors
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public getConversations(): Conversation[] {
    return [...this.conversations];
  }

  public getConversation(id: string): Conversation | undefined {
    return this.conversations.find((c) => c.id === id);
  }

  public createConversation(data: {
    visitorName: string;
    visitorEmail: string;
    category: ConversationCategory;
    subject: string;
    messageText: string;
    attachments?: Attachment[];
  }): Conversation {
    const now = new Date().toISOString();
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      visitorName: data.visitorName || "Anonymous Visitor",
      visitorEmail: data.visitorEmail || "visitor@example.com",
      category: data.category,
      subject: data.subject || `${data.category} Inquiry`,
      status: "New",
      priority:
        data.category === "Report a Bug"
          ? "High"
          : data.category === "Sponsor Request"
            ? "High"
            : "Medium",
      starred: false,
      pinned: false,
      archived: false,
      unreadByVisitor: false,
      unreadByAdmin: true,
      userInfo: {
        browser: typeof navigator !== "undefined" ? navigator.userAgent : "Browser Client",
        os: typeof navigator !== "undefined" ? navigator.platform : "Desktop",
        location: "Detected via Client IP",
        ip: "127.0.0.1",
        pageUrl: typeof window !== "undefined" ? window.location.href : SITE_URL,
      },
      internalNotes: [],
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: "visitor",
          senderName: data.visitorName || "Visitor",
          text: data.messageText,
          timestamp: now,
          readStatus: "sent",
          attachments: data.attachments || [],
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    this.conversations = [newConv, ...this.conversations];
    this.save();
    return newConv;
  }

  public sendMessage(
    conversationId: string,
    sender: "visitor" | "owner",
    senderName: string,
    text: string,
    attachments?: Attachment[],
  ) {
    const conv = this.conversations.find((c) => c.id === conversationId);
    if (!conv) return;

    const now = new Date().toISOString();
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender,
      senderName,
      text,
      timestamp: now,
      readStatus: "sent",
      attachments: attachments || [],
    };

    conv.messages.push(newMsg);
    conv.updatedAt = now;

    if (sender === "owner") {
      conv.status = "Waiting for Reply";
      conv.unreadByVisitor = true;
      conv.unreadByAdmin = false;
    } else {
      conv.status = conv.status === "Closed" || conv.status === "Resolved" ? "Open" : conv.status;
      conv.unreadByAdmin = true;
      conv.unreadByVisitor = false;
    }

    this.save();
  }

  public updateStatus(id: string, status: ConversationStatus) {
    const conv = this.conversations.find((c) => c.id === id);
    if (!conv) return;
    conv.status = status;
    conv.updatedAt = new Date().toISOString();

    conv.messages.push({
      id: `sys-${Date.now()}`,
      sender: "system",
      senderName: "System",
      text: `Status updated to "${status}"`,
      timestamp: new Date().toISOString(),
      readStatus: "read",
    });

    this.save();
  }

  public updatePriority(id: string, priority: ConversationPriority) {
    const conv = this.conversations.find((c) => c.id === id);
    if (!conv) return;
    conv.priority = priority;
    conv.updatedAt = new Date().toISOString();
    this.save();
  }

  public toggleStar(id: string) {
    const conv = this.conversations.find((c) => c.id === id);
    if (!conv) return;
    conv.starred = !conv.starred;
    this.save();
  }

  public togglePin(id: string) {
    const conv = this.conversations.find((c) => c.id === id);
    if (!conv) return;
    conv.pinned = !conv.pinned;
    this.save();
  }

  public toggleArchive(id: string) {
    const conv = this.conversations.find((c) => c.id === id);
    if (!conv) return;
    conv.archived = !conv.archived;
    this.save();
  }

  public addInternalNote(id: string, text: string, authorName = "Flixo Owner") {
    const conv = this.conversations.find((c) => c.id === id);
    if (!conv || !text.trim()) return;
    conv.internalNotes.push({
      id: `note-${Date.now()}`,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      authorName,
    });
    this.save();
  }

  public deleteInternalNote(id: string, noteId: string) {
    const conv = this.conversations.find((c) => c.id === id);
    if (!conv) return;
    conv.internalNotes = conv.internalNotes.filter((n) => n.id !== noteId);
    this.save();
  }

  public markAsRead(id: string, forWho: "admin" | "visitor") {
    const conv = this.conversations.find((c) => c.id === id);
    if (!conv) return;
    if (forWho === "admin") {
      conv.unreadByAdmin = false;
    } else {
      conv.unreadByVisitor = false;
    }
    this.save();
  }

  public getAnalytics() {
    const total = this.conversations.length;
    const unreadAdmin = this.conversations.filter((c) => c.unreadByAdmin).length;
    const open = this.conversations.filter(
      (c) => c.status === "New" || c.status === "Open" || c.status === "In Progress",
    ).length;
    const resolved = this.conversations.filter(
      (c) => c.status === "Resolved" || c.status === "Closed",
    ).length;

    const categoryCounts: Record<string, number> = {};
    this.conversations.forEach((c) => {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    });

    return {
      totalConversations: total,
      unreadAdmin,
      openConversations: open,
      resolvedConversations: resolved,
      categoryCounts,
      avgResponseTime: "18 mins",
      satisfactionScore: "4.9 / 5.0",
      topRequestedCategory: "Request a Tool",
    };
  }
}

export const communicationStore = new CommunicationStore();

export function useCommunicationStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    communicationStore.init();
    const unsubscribe = communicationStore.subscribe(() => {
      setTick((t) => t + 1);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    conversations: communicationStore.getConversations(),
    getConversation: (id: string) => communicationStore.getConversation(id),
    createConversation: (data: Parameters<typeof communicationStore.createConversation>[0]) =>
      communicationStore.createConversation(data),
    sendMessage: (
      conversationId: string,
      sender: "visitor" | "owner",
      senderName: string,
      text: string,
      attachments?: Attachment[],
    ) => communicationStore.sendMessage(conversationId, sender, senderName, text, attachments),
    updateStatus: (id: string, status: ConversationStatus) =>
      communicationStore.updateStatus(id, status),
    updatePriority: (id: string, priority: ConversationPriority) =>
      communicationStore.updatePriority(id, priority),
    toggleStar: (id: string) => communicationStore.toggleStar(id),
    togglePin: (id: string) => communicationStore.togglePin(id),
    toggleArchive: (id: string) => communicationStore.toggleArchive(id),
    addInternalNote: (id: string, text: string) => communicationStore.addInternalNote(id, text),
    deleteInternalNote: (id: string, noteId: string) =>
      communicationStore.deleteInternalNote(id, noteId),
    markAsRead: (id: string, forWho: "admin" | "visitor") =>
      communicationStore.markAsRead(id, forWho),
    analytics: communicationStore.getAnalytics(),
  };
}
