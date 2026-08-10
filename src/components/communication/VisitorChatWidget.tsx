import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare,
  X,
  Send,
  Paperclip,
  Smile,
  Sparkles,
  ChevronLeft,
  CheckCheck,
  Plus,
  FileText,
  Image as ImageIcon,
  Film,
  Archive,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  useCommunicationStore,
  type ConversationCategory,
  type Conversation,
  type Attachment,
} from "@/lib/communicationStore";
import { cn } from "@/lib/utils";
import { revokeAttachmentUrls, revokeObjectUrlSafe } from "@/lib/objectUrls";

const CATEGORIES: { label: ConversationCategory; icon: string; desc: string }[] = [
  { label: "Ask a Question", icon: "❓", desc: "General question about Flixo tools" },
  { label: "Report a Bug", icon: "🐛", desc: "Report an issue or bug with a tool" },
  { label: "Request a Tool", icon: "💡", desc: "Suggest a new tool for Flixo" },
  { label: "Business Inquiry", icon: "💼", desc: "Commercial & licensing requests" },
  { label: "Sponsor Request", icon: "📢", desc: "Become a sponsor or brand partner" },
  { label: "Partnership", icon: "🤝", desc: "Integrations and partnerships" },
  { label: "General Support", icon: "🎧", desc: "Help with your workspace or tools" },
];

const EMOJIS = ["👍", "🚀", "❤️", "🐛", "💡", "📢", "⚡", "📁", "😊", "🔥", "✨", "🙏", "🎉", "👀"];

export function VisitorChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "chat" | "new">("list");

  // New conversation form state
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [category, setCategory] = useState<ConversationCategory>("Ask a Question");
  const [subject, setSubject] = useState("");
  const [messageText, setMessageText] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);

  // Active chat message input
  const [replyText, setReplyText] = useState("");
  const [replyAttachments, setReplyAttachments] = useState<Attachment[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isOwnerTyping, setIsOwnerTyping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replyFileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pendingAttachmentsRef = useRef<Attachment[]>([]);
  const replyAttachmentsRef = useRef<Attachment[]>([]);

  const { conversations, createConversation, sendMessage, markAsRead } = useCommunicationStore();

  const activeConv = conversations.find((c) => c.id === activeConvId);

  // Unread badge count for visitor
  const totalUnreadVisitor = conversations.filter((c) => c.unreadByVisitor).length;

  useEffect(() => {
    if (activeConvId && isOpen) {
      markAsRead(activeConvId, "visitor");
    }
  }, [activeConvId, isOpen, markAsRead]);

  useEffect(() => {
    if (view === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [view, activeConv?.messages.length]);

  useEffect(() => {
    pendingAttachmentsRef.current = pendingAttachments;
  }, [pendingAttachments]);

  useEffect(() => {
    replyAttachmentsRef.current = replyAttachments;
  }, [replyAttachments]);

  useEffect(() => {
    return () => {
      revokeAttachmentUrls(pendingAttachmentsRef.current);
      revokeAttachmentUrls(replyAttachmentsRef.current);
    };
  }, []);

  // Handle file uploads
  const handleFileUpload = (files: FileList | null, isReply = false) => {
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

    if (isReply) {
      setReplyAttachments((prev) => [...prev, ...newAtts]);
    } else {
      setPendingAttachments((prev) => [...prev, ...newAtts]);
    }
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const newConv = createConversation({
      visitorName,
      visitorEmail,
      category,
      subject: subject || `${category} Request`,
      messageText: messageText.trim(),
      attachments: pendingAttachments,
    });

    // Reset form
    setMessageText("");
    setSubject("");
    setPendingAttachments([]);
    setActiveConvId(newConv.id);
    setView("chat");

    // Simulate auto-typing indicator & response from owner after 2.5s
    setIsOwnerTyping(true);
    setTimeout(() => {
      setIsOwnerTyping(false);
      sendMessage(
        newConv.id,
        "owner",
        "Flixo Support",
        `Hi ${dataName(visitorName)}! Thank you for contacting Flixo about your ${category.toLowerCase()}. We've received your message and our team will get back to you shortly!`,
      );
    }, 2800);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() && replyAttachments.length === 0) return;
    if (!activeConvId) return;

    sendMessage(
      activeConvId,
      "visitor",
      activeConv?.visitorName || "Visitor",
      replyText.trim(),
      replyAttachments,
    );

    setReplyText("");
    setReplyAttachments([]);
    setShowEmojiPicker(false);

    // Occasional simulated owner response trigger for live feel
    setIsOwnerTyping(true);
    setTimeout(() => {
      setIsOwnerTyping(false);
      sendMessage(
        activeConvId,
        "owner",
        "Flixo Support",
        "Thanks for updating your message! We are actively reviewing this for you.",
      );
    }, 3000);
  };

  const dataName = (name: string) => (name.trim() ? name.trim().split(" ")[0] : "there");

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="mb-3 flex h-[580px] w-[360px] flex-col overflow-hidden rounded-3xl border border-border/80 bg-card/95 shadow-2xl backdrop-blur-xl dark:bg-card/90 sm:w-[400px]"
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between border-b border-border/60 bg-gradient-to-r from-primary/10 via-card to-primary/5 px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                {view !== "list" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setView("list")}
                    className="size-8 rounded-full"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                )}
                <div className="relative">
                  <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground font-bold shadow-xs">
                    <Sparkles className="size-4" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-500 ring-2 ring-card" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground leading-none flex items-center gap-1.5">
                    Chat with Flixo
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1.5 py-0 border-emerald-500/30 text-emerald-500 bg-emerald-500/10"
                    >
                      Online
                    </Badge>
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Direct Owner & Support Access
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-full text-muted-foreground hover:text-foreground"
                  title="Open full page"
                >
                  <Link to="/contact">
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="size-8 rounded-full text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto bg-surface/30 p-4">
              {/* VIEW 1: CONVERSATIONS LIST */}
              {view === "list" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Zap className="size-3.5 text-primary" />
                        Quick Direct Response
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        Avg ~15m
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Have a feature request, bug to report, or sponsorship idea? Message the owner
                      directly.
                    </p>
                    <Button
                      onClick={() => setView("new")}
                      className="w-full rounded-xl text-xs font-bold shadow-xs"
                      size="sm"
                    >
                      <Plus className="me-1.5 size-3.5" />
                      Start New Conversation
                    </Button>
                  </div>

                  {/* Previous Conversations */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
                      Recent Conversations ({conversations.length})
                    </h4>

                    {conversations.length === 0 ? (
                      <div className="text-center py-8 text-xs text-muted-foreground">
                        No previous messages. Click above to start!
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {conversations.map((conv) => {
                          const lastMsg = conv.messages[conv.messages.length - 1];
                          return (
                            <button
                              key={conv.id}
                              onClick={() => {
                                setActiveConvId(conv.id);
                                setView("chat");
                              }}
                              className={cn(
                                "w-full text-left p-3 rounded-2xl border transition-all duration-200 hover:border-primary/40 hover:bg-card/80 flex flex-col gap-1.5",
                                conv.unreadByVisitor
                                  ? "border-primary/40 bg-primary/5 shadow-xs"
                                  : "border-border/60 bg-card/40",
                              )}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] font-semibold py-0"
                                >
                                  {conv.category}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(conv.updatedAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-xs text-foreground line-clamp-1">
                                  {conv.subject}
                                </span>
                                {conv.unreadByVisitor && (
                                  <span className="size-2 rounded-full bg-primary shrink-0" />
                                )}
                              </div>

                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {lastMsg ? lastMsg.text : "No messages yet"}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* VIEW 2: NEW CONVERSATION FORM */}
              {view === "new" && (
                <form onSubmit={handleCreateNew} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Category</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.label}
                          type="button"
                          onClick={() => setCategory(cat.label)}
                          className={cn(
                            "flex items-center gap-1.5 p-2 rounded-xl border text-left text-xs transition-all",
                            category === cat.label
                              ? "border-primary bg-primary/10 font-bold text-primary"
                              : "border-border/60 bg-card/60 hover:bg-card text-muted-foreground",
                          )}
                        >
                          <span className="text-sm">{cat.icon}</span>
                          <span className="line-clamp-1 text-[11px]">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Your Name</label>
                      <Input
                        value={visitorName}
                        onChange={(e) => setVisitorName(e.target.value)}
                        placeholder="Alex Vance"
                        className="rounded-xl text-xs h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Email</label>
                      <Input
                        type="email"
                        value={visitorEmail}
                        onChange={(e) => setVisitorEmail(e.target.value)}
                        placeholder="alex@example.com"
                        className="rounded-xl text-xs h-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Subject</label>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Brief topic..."
                      className="rounded-xl text-xs h-8"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Message</label>
                    <Textarea
                      required
                      rows={3}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="How can the Flixo owner help you?"
                      className="rounded-xl text-xs resize-none"
                    />
                  </div>

                  {/* Attachment Section */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-muted-foreground">
                        Attachments
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-6 px-2 text-[10px]"
                      >
                        <Paperclip className="me-1 size-3" /> Add Files
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,video/*,.pdf,.zip,.doc,.docx"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files)}
                      />
                    </div>

                    {pendingAttachments.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {pendingAttachments.map((att) => (
                          <Badge
                            key={att.id}
                            variant="secondary"
                            className="text-[10px] gap-1 px-2 py-0.5"
                          >
                            <FileText className="size-3 text-primary" />
                            <span className="max-w-[100px] truncate">{att.name}</span>
                            <X
                              className="size-3 cursor-pointer hover:text-destructive"
                              onClick={() => {
                                revokeObjectUrlSafe(att.url);
                                setPendingAttachments((prev) =>
                                  prev.filter((a) => a.id !== att.id),
                                );
                              }}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full rounded-xl text-xs font-bold h-9">
                    Send Message to Owner
                    <Send className="ms-1.5 size-3.5" />
                  </Button>
                </form>
              )}

              {/* VIEW 3: ACTIVE CHAT THREAD */}
              {view === "chat" && activeConv && (
                <div className="flex h-full flex-col justify-between space-y-3">
                  {/* Topic Bar */}
                  <div className="rounded-xl border border-border/60 bg-card/60 p-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        {activeConv.category}
                      </span>
                      <h4 className="text-xs font-bold text-foreground line-clamp-1">
                        {activeConv.subject}
                      </h4>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {activeConv.status}
                    </Badge>
                  </div>

                  {/* Message Thread */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {activeConv.messages.map((msg) => {
                      const isVisitor = msg.sender === "visitor";
                      const isSystem = msg.sender === "system";

                      if (isSystem) {
                        return (
                          <div key={msg.id} className="text-center py-1">
                            <span className="rounded-full bg-surface px-2.5 py-0.5 text-[10px] text-muted-foreground font-medium border border-border/40">
                              {msg.text}
                            </span>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex flex-col max-w-[85%] space-y-1",
                            isVisitor ? "ms-auto items-end" : "me-auto items-start",
                          )}
                        >
                          <span className="text-[10px] text-muted-foreground px-1">
                            {msg.senderName} •{" "}
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>

                          <div
                            className={cn(
                              "rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-xs",
                              isVisitor
                                ? "bg-primary text-primary-foreground rounded-br-xs"
                                : "bg-card border border-border/80 text-foreground rounded-bl-xs",
                            )}
                          >
                            <p className="whitespace-pre-wrap">{msg.text}</p>

                            {/* Attachments inside message */}
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="mt-2 space-y-1.5 pt-1.5 border-t border-white/20">
                                {msg.attachments.map((att) => (
                                  <div
                                    key={att.id}
                                    className="flex items-center gap-2 rounded-lg bg-black/10 dark:bg-white/10 p-1.5 text-[11px]"
                                  >
                                    {att.type === "image" ? (
                                      <ImageIcon className="size-4 shrink-0" />
                                    ) : att.type === "video" ? (
                                      <Film className="size-4 shrink-0" />
                                    ) : (
                                      <FileText className="size-4 shrink-0" />
                                    )}
                                    <span className="truncate flex-1">{att.name}</span>
                                    <span className="text-[9px] opacity-75">{att.size}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {isVisitor && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground px-1">
                              <CheckCheck className="size-3 text-primary" />
                              <span>Delivered</span>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Typing Indicator */}
                    {isOwnerTyping && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-card p-2 rounded-2xl w-fit border border-border/60 animate-pulse">
                        <Sparkles className="size-3.5 text-primary" />
                        <span className="text-[11px] font-medium">Flixo Owner is typing...</span>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Reply Input Area */}
                  <form
                    onSubmit={handleSendReply}
                    className="space-y-2 pt-2 border-t border-border/60"
                  >
                    {/* Attachments preview */}
                    {replyAttachments.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {replyAttachments.map((att) => (
                          <Badge
                            key={att.id}
                            variant="secondary"
                            className="text-[10px] gap-1 px-2"
                          >
                            <FileText className="size-3 text-primary" />
                            <span className="max-w-[80px] truncate">{att.name}</span>
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

                    {/* Emoji Quick Bar */}
                    {showEmojiPicker && (
                      <div className="flex flex-wrap gap-1 p-2 rounded-xl bg-card border border-border/80 text-sm">
                        {EMOJIS.map((e) => (
                          <button
                            key={e}
                            type="button"
                            onClick={() => {
                              setReplyText((prev) => prev + e);
                            }}
                            className="hover:scale-125 transition-transform p-1"
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowEmojiPicker((prev) => !prev)}
                        className="size-8 rounded-xl shrink-0 text-muted-foreground"
                      >
                        <Smile className="size-4" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => replyFileInputRef.current?.click()}
                        className="size-8 rounded-xl shrink-0 text-muted-foreground"
                      >
                        <Paperclip className="size-4" />
                      </Button>
                      <input
                        ref={replyFileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files, true)}
                      />

                      <Input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your message..."
                        className="rounded-xl text-xs h-9 flex-1"
                      />

                      <Button type="submit" size="icon" className="size-9 rounded-xl shrink-0">
                        <Send className="size-4" />
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={() => setIsOpen((prev) => !prev)}
          size="lg"
          className={cn(
            "relative rounded-full shadow-2xl px-5 py-6 font-bold text-sm tracking-tight transition-all duration-300",
            isOpen
              ? "bg-foreground text-background"
              : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/30 shadow-lg",
          )}
        >
          {isOpen ? (
            <X className="size-5" />
          ) : (
            <div className="flex items-center gap-2">
              <MessageSquare className="size-5" />
              <span className="hidden sm:inline">Chat with Flixo</span>
            </div>
          )}

          {totalUnreadVisitor > 0 && !isOpen && (
            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white ring-2 ring-background animate-bounce">
              {totalUnreadVisitor}
            </span>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
