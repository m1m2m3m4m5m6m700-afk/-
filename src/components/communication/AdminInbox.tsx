import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Inbox,
  Search,
  Star,
  Pin,
  Archive,
  CheckCircle2,
  Clock,
  AlertCircle,
  Paperclip,
  Send,
  MoreVertical,
  User,
  Globe,
  Monitor,
  Sparkles,
  BarChart3,
  Filter,
  FileText,
  Image as ImageIcon,
  Film,
  MessageSquare,
  Plus,
  Trash2,
  StickyNote,
  Zap,
  Check,
  Tag,
  Eye,
  ChevronRight,
  RefreshCw,
  X,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  useCommunicationStore,
  type Conversation,
  type ConversationStatus,
  type ConversationPriority,
  type ConversationCategory,
  type Attachment,
} from "@/lib/communicationStore";
import { cn } from "@/lib/utils";
import { revokeAttachmentUrls, revokeObjectUrlSafe } from "@/lib/objectUrls";

const STATUS_VARIANTS: Record<ConversationStatus, { label: string; color: string }> = {
  New: { label: "New", color: "bg-blue-500/15 text-blue-500 border-blue-500/30" },
  Open: { label: "Open", color: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" },
  "Waiting for Reply": {
    label: "Waiting Reply",
    color: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  },
  "In Progress": {
    label: "In Progress",
    color: "bg-purple-500/15 text-purple-500 border-purple-500/30",
  },
  Resolved: { label: "Resolved", color: "bg-teal-500/15 text-teal-500 border-teal-500/30" },
  Closed: { label: "Closed", color: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
};

const PRIORITY_VARIANTS: Record<ConversationPriority, { label: string; color: string }> = {
  Low: { label: "Low", color: "bg-surface text-muted-foreground border-border" },
  Medium: { label: "Medium", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  High: { label: "High", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  Urgent: { label: "Urgent", color: "bg-rose-500/15 text-rose-500 border-rose-500/30 font-bold" },
};

const CANNED_RESPONSES = [
  "Hi! Thanks for reaching out. We are reviewing this request and will update you shortly.",
  "Great tool suggestion! We've added this to our official Flixo roadmap.",
  "Thanks for bringing this bug to our attention. Our team released a hotfix!",
  "We appreciate your sponsorship interest! Attached is our media kit and partnership details.",
];

export function AdminInbox() {
  const {
    conversations,
    updateStatus,
    updatePriority,
    toggleStar,
    togglePin,
    toggleArchive,
    addInternalNote,
    deleteInternalNote,
    sendMessage,
    markAsRead,
    analytics,
  } = useCommunicationStore();

  const [selectedId, setSelectedId] = useState<string | null>(conversations[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "starred" | "pinned" | "archived">(
    "all",
  );

  // Admin reply composer state
  const [replyText, setReplyText] = useState("");
  const [replyAttachments, setReplyAttachments] = useState<Attachment[]>([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [showUserInfo, setShowUserInfo] = useState(true);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replyAttachmentsRef = useRef<Attachment[]>([]);

  const activeConv = conversations.find((c) => c.id === selectedId);

  useEffect(() => {
    replyAttachmentsRef.current = replyAttachments;
  }, [replyAttachments]);

  useEffect(() => {
    return () => {
      revokeAttachmentUrls(replyAttachmentsRef.current);
    };
  }, []);

  // Mark as read when admin selects conversation
  const handleSelectConv = (id: string) => {
    setSelectedId(id);
    markAsRead(id, "admin");
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    // Tab filter
    if (activeTab === "unread" && !c.unreadByAdmin) return false;
    if (activeTab === "starred" && !c.starred) return false;
    if (activeTab === "pinned" && !c.pinned) return false;
    if (activeTab === "archived" && !c.archived) return false;
    if (activeTab !== "archived" && c.archived) return false;

    // Category filter
    if (filterCategory !== "all" && c.category !== filterCategory) return false;

    // Status filter
    if (filterStatus !== "all" && c.status !== filterStatus) return false;

    // Priority filter
    if (filterPriority !== "all" && c.priority !== filterPriority) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.visitorName.toLowerCase().includes(q);
      const matchEmail = c.visitorEmail.toLowerCase().includes(q);
      const matchSubject = c.subject.toLowerCase().includes(q);
      const matchText = c.messages.some((m) => m.text.toLowerCase().includes(q));
      if (!matchName && !matchEmail && !matchSubject && !matchText) return false;
    }

    return true;
  });

  const handleSendReply = (e: React.FormEvent, setStatusToReply = false) => {
    e.preventDefault();
    if (!replyText.trim() && replyAttachments.length === 0) return;
    if (!selectedId) return;

    sendMessage(selectedId, "owner", "Flixo Owner", replyText.trim(), replyAttachments);

    if (setStatusToReply) {
      updateStatus(selectedId, "Waiting for Reply");
    }

    setReplyText("");
    setReplyAttachments([]);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newAtts: Attachment[] = [];

    Array.from(files).forEach((file) => {
      let type: Attachment["type"] = "document";
      if (file.type.startsWith("image/")) type = "image";
      else if (file.type.startsWith("video/")) type = "video";
      else if (file.type.includes("pdf")) type = "pdf";
      else if (file.name.endsWith(".zip")) type = "zip";

      const url = URL.createObjectURL(file);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const sizeStr =
        file.size > 1024 * 1024 ? `${sizeMb} MB` : `${Math.round(file.size / 1024)} KB`;

      newAtts.push({
        id: `att-${Date.now()}-${Math.random()}`,
        name: file.name,
        type,
        url,
        size: sizeStr,
      });
    });

    setReplyAttachments((prev) => [...prev, ...newAtts]);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !newNoteText.trim()) return;
    addInternalNote(selectedId, newNoteText.trim());
    setNewNoteText("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 py-4 sm:px-6 space-y-4">
      {/* Top Header & Admin Dashboard Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-3">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground font-bold shadow-md">
            <Inbox className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Owner Inbox & Communication Dashboard
              <Badge
                variant="outline"
                className="text-xs font-semibold border-primary/30 text-primary"
              >
                Admin Panel
              </Badge>
            </h1>
            <p className="text-xs text-muted-foreground">
              Manage visitor questions, tool requests, bug reports & sponsorships
            </p>
          </div>
        </div>

        {/* Action Controls & Live Stats */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAnalyticsModal(true)}
            className="rounded-xl text-xs font-bold"
          >
            <BarChart3 className="me-1.5 size-4 text-primary" />
            Analytics & Insights
          </Button>

          <Button
            asChild
            variant="secondary"
            size="sm"
            className="rounded-xl text-xs font-semibold"
          >
            <Link to="/contact">
              <Eye className="me-1.5 size-3.5" />
              Visitor View
            </Link>
          </Button>
        </div>
      </div>

      {/* Analytics Summary Banner Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-border/80 bg-card/60 p-3 flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-blue-500/10 text-blue-500 font-bold">
            <MessageSquare className="size-4" />
          </span>
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground block">
              Total Messages
            </span>
            <span className="text-lg font-extrabold text-foreground">
              {analytics.totalConversations}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card/60 p-3 flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-rose-500/10 text-rose-500 font-bold">
            <AlertCircle className="size-4" />
          </span>
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground block">
              Unread Admin
            </span>
            <span className="text-lg font-extrabold text-rose-500">{analytics.unreadAdmin}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card/60 p-3 flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-amber-500/10 text-amber-500 font-bold">
            <Clock className="size-4" />
          </span>
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground block">
              Avg Response
            </span>
            <span className="text-lg font-extrabold text-foreground">
              {analytics.avgResponseTime ?? "Not enough data"}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card/60 p-3 flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500 font-bold">
            <CheckCircle2 className="size-4" />
          </span>
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground block">
              Resolved Ratio
            </span>
            <span className="text-lg font-extrabold text-emerald-500">
              {analytics.resolvedConversations} / {analytics.totalConversations}
            </span>
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid flex-1 grid-cols-12 gap-4 overflow-hidden rounded-3xl border border-border/80 bg-card/40 backdrop-blur-xl shadow-xl">
        {/* LEFT PANE: SEARCH, FILTERS & CONVERSATION LIST (4 Cols) */}
        <div className="col-span-12 md:col-span-4 flex flex-col border-r border-border/60 bg-surface/30">
          {/* Search & Tabs */}
          <div className="p-3 border-b border-border/60 space-y-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, subject..."
                className="pl-9 text-xs rounded-xl h-9"
              />
            </div>

            {/* View Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
              {(["all", "unread", "starred", "pinned", "archived"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-semibold capitalize whitespace-nowrap transition-colors",
                    activeTab === tab
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-card hover:text-foreground",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Dropdown Filters */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="rounded-lg border border-border bg-card px-2 py-1 text-[11px] font-medium text-foreground"
              >
                <option value="all">Categories</option>
                <option value="Ask a Question">Question</option>
                <option value="Report a Bug">Bug</option>
                <option value="Request a Tool">Tool Request</option>
                <option value="Sponsor Request">Sponsor</option>
                <option value="Business Inquiry">Business</option>
                <option value="Partnership">Partnership</option>
                <option value="General Support">Support</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg border border-border bg-card px-2 py-1 text-[11px] font-medium text-foreground"
              >
                <option value="all">Statuses</option>
                <option value="New">New</option>
                <option value="Open">Open</option>
                <option value="Waiting for Reply">Waiting</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="rounded-lg border border-border bg-card px-2 py-1 text-[11px] font-medium text-foreground"
              >
                <option value="all">Priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Scrollable Conversation List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted-foreground">
                No matching conversations found.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === selectedId;
                const lastMsg = conv.messages[conv.messages.length - 1];
                const statusInfo = STATUS_VARIANTS[conv.status];
                const priorityInfo = PRIORITY_VARIANTS[conv.priority];

                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConv(conv.id)}
                    className={cn(
                      "group relative cursor-pointer rounded-2xl border p-3 transition-all duration-200 space-y-2",
                      isSelected
                        ? "border-primary bg-primary/10 shadow-md ring-1 ring-primary/30"
                        : conv.unreadByAdmin
                          ? "border-primary/40 bg-card shadow-xs"
                          : "border-border/60 bg-card/40 hover:bg-card hover:border-border",
                    )}
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {conv.pinned && <Pin className="size-3 text-primary shrink-0" />}
                        <span className="font-bold text-xs text-foreground truncate">
                          {conv.visitorName}
                        </span>
                        {conv.unreadByAdmin && (
                          <span className="size-2 rounded-full bg-rose-500 shrink-0" />
                        )}
                      </div>

                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(conv.updatedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Subject */}
                    <h4 className="text-xs font-semibold text-foreground/90 line-clamp-1">
                      {conv.subject}
                    </h4>

                    {/* Preview snippet */}
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {lastMsg ? lastMsg.text : "No messages"}
                    </p>

                    {/* Footer Row Badges */}
                    <div className="flex items-center justify-between gap-1 pt-1">
                      <div className="flex items-center gap-1">
                        <Badge
                          variant="outline"
                          className={cn("text-[9px] px-1.5 py-0 font-semibold", statusInfo.color)}
                        >
                          {statusInfo.label}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn("text-[9px] px-1.5 py-0", priorityInfo.color)}
                        >
                          {priorityInfo.label}
                        </Badge>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(conv.id);
                        }}
                        className="text-muted-foreground hover:text-amber-500 p-0.5"
                      >
                        <Star
                          className={cn(
                            "size-3.5",
                            conv.starred && "fill-amber-500 text-amber-500",
                          )}
                        />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANE: CONVERSATION DETAIL & REPLY ENGINE (8 Cols) */}
        <div className="col-span-12 md:col-span-8 flex flex-col bg-card/60">
          {activeConv ? (
            <div className="flex h-full flex-col justify-between overflow-hidden">
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-card/80 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-foreground">
                      {activeConv.subject}
                    </h2>
                    <Badge variant="secondary" className="text-xs font-bold">
                      {activeConv.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    From{" "}
                    <span className="font-semibold text-foreground">{activeConv.visitorName}</span>{" "}
                    ({activeConv.visitorEmail})
                  </p>
                </div>

                {/* Status / Priority / Actions Bar */}
                <div className="flex items-center gap-2">
                  {/* Status Dropdown */}
                  <select
                    value={activeConv.status}
                    onChange={(e) =>
                      updateStatus(activeConv.id, e.target.value as ConversationStatus)
                    }
                    className="rounded-xl border border-border bg-surface px-2.5 py-1 text-xs font-bold text-foreground"
                  >
                    <option value="New">Status: New</option>
                    <option value="Open">Status: Open</option>
                    <option value="Waiting for Reply">Status: Waiting Reply</option>
                    <option value="In Progress">Status: In Progress</option>
                    <option value="Resolved">Status: Resolved</option>
                    <option value="Closed">Status: Closed</option>
                  </select>

                  {/* Priority Dropdown */}
                  <select
                    value={activeConv.priority}
                    onChange={(e) =>
                      updatePriority(activeConv.id, e.target.value as ConversationPriority)
                    }
                    className="rounded-xl border border-border bg-surface px-2.5 py-1 text-xs font-bold text-foreground"
                  >
                    <option value="Low">Priority: Low</option>
                    <option value="Medium">Priority: Medium</option>
                    <option value="High">Priority: High</option>
                    <option value="Urgent">Priority: Urgent</option>
                  </select>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePin(activeConv.id)}
                    className={cn("size-8 rounded-xl", activeConv.pinned && "text-primary")}
                    title="Pin conversation"
                  >
                    <Pin className="size-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleStar(activeConv.id)}
                    className={cn("size-8 rounded-xl", activeConv.starred && "text-amber-500")}
                    title="Star conversation"
                  >
                    <Star className="size-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleArchive(activeConv.id)}
                    className={cn("size-8 rounded-xl", activeConv.archived && "text-purple-500")}
                    title="Archive conversation"
                  >
                    <Archive className="size-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowUserInfo((prev) => !prev)}
                    className="size-8 rounded-xl"
                    title="Toggle Visitor Info"
                  >
                    <User className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Main Body: Messages Thread + Visitor Info Sidebar */}
              <div className="flex flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Messages */}
                  {activeConv.messages.map((msg) => {
                    const isOwner = msg.sender === "owner";
                    const isSystem = msg.sender === "system";

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="text-center py-1">
                          <span className="rounded-full bg-surface px-3 py-1 text-xs text-muted-foreground font-medium border border-border/40">
                            ⚡ {msg.text}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex flex-col max-w-[85%] space-y-1",
                          isOwner ? "ms-auto items-end" : "me-auto items-start",
                        )}
                      >
                        <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
                          <span className="font-bold text-foreground">{msg.senderName}</span>
                          <span>
                            {new Date(msg.timestamp).toLocaleString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div
                          className={cn(
                            "rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-sm",
                            isOwner
                              ? "bg-primary text-primary-foreground rounded-br-xs"
                              : "bg-surface border border-border/80 text-foreground rounded-bl-xs",
                          )}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>

                          {/* Attachments */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-3 space-y-1.5 pt-2 border-t border-border/40">
                              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 block">
                                Attachments ({msg.attachments.length})
                              </span>
                              {msg.attachments.map((att) => (
                                <a
                                  key={att.id}
                                  href={att.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-2 rounded-xl bg-black/10 dark:bg-white/10 p-2 text-xs hover:opacity-80 transition-opacity"
                                >
                                  {att.type === "image" ? (
                                    <ImageIcon className="size-4 shrink-0 text-primary" />
                                  ) : (
                                    <FileText className="size-4 shrink-0 text-primary" />
                                  )}
                                  <span className="font-medium truncate flex-1">{att.name}</span>
                                  <span className="text-[10px] opacity-75">{att.size}</span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Internal Admin Notes Section */}
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                        <StickyNote className="size-4" />
                        Internal Admin Notes (Private)
                      </h4>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                        Only visible to owner
                      </span>
                    </div>

                    {activeConv.internalNotes.length > 0 && (
                      <div className="space-y-2">
                        {activeConv.internalNotes.map((note) => (
                          <div
                            key={note.id}
                            className="flex items-start justify-between gap-2 rounded-xl bg-card/80 p-2.5 border border-amber-500/20 text-xs"
                          >
                            <div>
                              <p className="text-foreground font-medium">{note.text}</p>
                              <span className="text-[10px] text-muted-foreground mt-0.5 block">
                                {note.authorName} • {new Date(note.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                            <Trash2
                              className="size-3.5 text-muted-foreground hover:text-rose-500 cursor-pointer shrink-0 mt-0.5"
                              onClick={() => deleteInternalNote(activeConv.id, note.id)}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <form onSubmit={handleAddNote} className="flex gap-2">
                      <Input
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        placeholder="Add private note for yourself..."
                        className="rounded-xl text-xs bg-card h-8"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        variant="outline"
                        className="rounded-xl text-xs h-8"
                      >
                        Add Note
                      </Button>
                    </form>
                  </div>
                </div>

                {/* Visitor Info Collapsible Drawer */}
                {showUserInfo && (
                  <div className="w-64 border-l border-border/60 bg-surface/40 p-4 space-y-4 overflow-y-auto hidden lg:block">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Visitor Telemetry
                    </h4>

                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-muted-foreground text-[10px] block font-semibold">
                          Browser / OS
                        </span>
                        <span className="font-medium text-foreground">
                          {activeConv.userInfo.browser}
                        </span>
                      </div>

                      <div>
                        <span className="text-muted-foreground text-[10px] block font-semibold">
                          Location
                        </span>
                        <span className="font-medium text-foreground">
                          {activeConv.userInfo.location ?? "Not available"}
                        </span>
                      </div>

                      <div>
                        <span className="text-muted-foreground text-[10px] block font-semibold">
                          IP Address
                        </span>
                        <span className="font-mono text-foreground">
                          {activeConv.userInfo.ip ?? "Not available"}
                        </span>
                      </div>

                      <div>
                        <span className="text-muted-foreground text-[10px] block font-semibold">
                          Source Page
                        </span>
                        <span className="font-mono text-primary truncate block text-[11px]">
                          {activeConv.userInfo.pageUrl}
                        </span>
                      </div>

                      <div>
                        <span className="text-muted-foreground text-[10px] block font-semibold">
                          Created
                        </span>
                        <span className="text-foreground">
                          {new Date(activeConv.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Reply Composer */}
              <div className="border-t border-border/60 bg-card p-4 space-y-3">
                {/* Canned responses dropdown */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
                    <span className="text-muted-foreground font-bold shrink-0">
                      Canned Replies:
                    </span>
                    {CANNED_RESPONSES.map((r, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setReplyText(r)}
                        className="rounded-lg border border-border bg-surface px-2 py-0.5 text-muted-foreground hover:text-foreground hover:border-primary shrink-0 transition-colors"
                      >
                        Insert #{idx + 1}
                      </button>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-7 text-xs"
                  >
                    <Paperclip className="me-1 size-3.5" /> Attach
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                </div>

                {replyAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {replyAttachments.map((att) => (
                      <Badge key={att.id} variant="secondary" className="text-[10px] gap-1 px-2">
                        <FileText className="size-3 text-primary" />
                        <span>{att.name}</span>
                        <X
                          className="size-3 cursor-pointer"
                          onClick={() => {
                            revokeObjectUrlSafe(att.url);
                            setReplyAttachments((prev) => prev.filter((a) => a.id !== att.id));
                          }}
                        />
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-end gap-2">
                  <Textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type official owner reply to visitor..."
                    className="rounded-2xl text-xs sm:text-sm resize-none"
                  />

                  <div className="flex flex-col gap-1 shrink-0">
                    <Button
                      onClick={(e) => handleSendReply(e, false)}
                      size="sm"
                      className="rounded-xl text-xs font-bold"
                    >
                      <Send className="me-1 size-3.5" />
                      Send Reply
                    </Button>

                    <Button
                      onClick={(e) => handleSendReply(e, true)}
                      size="sm"
                      variant="outline"
                      className="rounded-xl text-[11px] font-semibold"
                    >
                      Send & Mark Waiting
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <Inbox className="size-12 mb-3 text-primary/40" />
              <h3 className="text-base font-bold text-foreground">Select a conversation</h3>
              <p className="text-xs max-w-sm mt-1">
                Choose a conversation from the left panel to reply or manage status and notes.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Analytics Modal */}
      <Dialog open={showAnalyticsModal} onOpenChange={setShowAnalyticsModal}>
        <DialogContent className="sm:max-w-xl rounded-3xl p-6">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="size-5 text-primary" />
              Owner Communication Analytics
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Real-time insights on user inquiries, tool requests, and response efficiency.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border/80 bg-surface/50 p-4 space-y-1">
                <span className="text-xs text-muted-foreground font-semibold">
                  Total Conversations
                </span>
                <p className="text-2xl font-extrabold text-foreground">
                  {analytics.totalConversations}
                </p>
              </div>

              <div className="rounded-2xl border border-border/80 bg-surface/50 p-4 space-y-1">
                <span className="text-xs text-muted-foreground font-semibold">
                  User Satisfaction
                </span>
                <p className="text-2xl font-extrabold text-emerald-500">
                  {analytics.satisfactionScore ?? "Not enough data"}
                </p>
              </div>

              <div className="rounded-2xl border border-border/80 bg-surface/50 p-4 space-y-1">
                <span className="text-xs text-muted-foreground font-semibold">
                  Avg Response Time
                </span>
                <p className="text-2xl font-extrabold text-primary">
                  {analytics.avgResponseTime ?? "Not enough data"}
                </p>
              </div>

              <div className="rounded-2xl border border-border/80 bg-surface/50 p-4 space-y-1">
                <span className="text-xs text-muted-foreground font-semibold">Top Topic</span>
                <p className="text-base font-bold text-foreground truncate">
                  {analytics.topRequestedCategory ?? "Not enough data"}
                </p>
              </div>
            </div>

            {/* Category breakdown list */}
            <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Inquiry Breakdown by Category
              </h4>
              <div className="space-y-1.5">
                {Object.entries(analytics.categoryCounts).map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{cat}</span>
                    <Badge variant="secondary" className="font-bold">
                      {count} ({Math.round((count / analytics.totalConversations) * 100)}%)
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
