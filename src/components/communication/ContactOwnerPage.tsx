import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  MessageSquare,
  Sparkles,
  Send,
  Paperclip,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Clock,
  Heart,
  FileText,
  X,
  Mail,
  User,
  HelpCircle,
  Bug,
  Lightbulb,
  Building2,
  Megaphone,
  Handshake,
  Headphones,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  useCommunicationStore,
  type ConversationCategory,
  type Attachment,
} from "@/lib/communicationStore";
import { cn } from "@/lib/utils";
import { revokeAttachmentUrls, revokeObjectUrlSafe } from "@/lib/objectUrls";

const CATEGORY_OPTIONS: {
  label: ConversationCategory;
  icon: LucideIcon;
  color: string;
  desc: string;
}[] = [
  {
    label: "Ask a Question",
    icon: HelpCircle,
    color: "text-blue-500 bg-blue-500/10",
    desc: "General tools or workflow help",
  },
  {
    label: "Report a Bug",
    icon: Bug,
    color: "text-rose-500 bg-rose-500/10",
    desc: "Found an error or broken tool",
  },
  {
    label: "Request a Tool",
    icon: Lightbulb,
    color: "text-amber-500 bg-amber-500/10",
    desc: "Suggest a tool for our roadmap",
  },
  {
    label: "Business Inquiry",
    icon: Building2,
    color: "text-purple-500 bg-purple-500/10",
    desc: "Licensing and enterprise inquiry",
  },
  {
    label: "Sponsor Request",
    icon: Megaphone,
    color: "text-emerald-500 bg-emerald-500/10",
    desc: "Sponsor Flixo tool directories",
  },
  {
    label: "Partnership",
    icon: Handshake,
    color: "text-indigo-500 bg-indigo-500/10",
    desc: "Ecosystem and API collabs",
  },
  {
    label: "General Support",
    icon: Headphones,
    color: "text-teal-500 bg-teal-500/10",
    desc: "General platform feedback",
  },
];

const FAQS = [
  {
    q: "How fast will I receive a reply from the Flixo owner?",
    a: "We review messages continuously! Typical response time is around 15–30 minutes during active hours.",
  },
  {
    q: "Can I sponsor Flixo tools to reach developers and creators?",
    a: "Yes! Choose 'Sponsor Request' when submitting a message or visit our Sponsor Area for program details.",
  },
  {
    q: "Are file attachments encrypted and secure?",
    a: "Yes. Attachments uploaded here are processed safely and viewed only by the Flixo owner and core engineering team.",
  },
];

export function ContactOwnerPage() {
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [category, setCategory] = useState<ConversationCategory>("Ask a Question");
  const [subject, setSubject] = useState("");
  const [messageText, setMessageText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentsRef = useRef<Attachment[]>([]);

  const { conversations, createConversation } = useCommunicationStore();

  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  useEffect(() => {
    return () => {
      revokeAttachmentUrls(attachmentsRef.current);
    };
  }, []);

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

    setAttachments((prev) => [...prev, ...newAtts]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const newConv = createConversation({
      visitorName,
      visitorEmail,
      category,
      subject: subject || `${category} Inquiry`,
      messageText: messageText.trim(),
      attachments,
    });

    setSubmittedId(newConv.id);
    setMessageText("");
    setSubject("");
    setAttachments([]);

    // No simulated owner reply: a real human owner responds from the admin
    // inbox. Fabricating an automatic "Flixo Support" message would mislead the
    // visitor into thinking their ticket was already being handled.
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 max-w-3xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary shadow-xs">
          <Sparkles className="size-4" />
          Flixo Communication Hub
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
          Talk Directly with the Flixo Owner
        </h1>

        <p className="text-base text-muted-foreground leading-relaxed sm:text-lg">
          No automated bots, no confusing ticket portals. Ask questions, request new tools, report
          bugs, or discuss sponsorships directly with the founder.
        </p>

        {/* Feature Pills */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1 text-emerald-500">
            <Zap className="size-3.5" />
            ~15m Avg Response Time
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 text-blue-500">
            <ShieldCheck className="size-3.5" />
            100% Privacy & No Ads
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3.5 py-1 text-indigo-500">
            <Heart className="size-3.5" />
            Direct Creator Access
          </div>
        </div>
      </motion.div>

      {/* Main Grid Section */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Communication Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="rounded-3xl border-border/80 bg-card/80 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
            <CardContent className="p-0 space-y-6">
              {submittedId ? (
                <div className="text-center py-10 space-y-4">
                  <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                    <CheckCircle2 className="size-8" />
                  </div>
                  <h3 className="text-2xl font-bold">Message Sent Successfully!</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Your conversation (ID:{" "}
                    <span className="font-mono text-primary">{submittedId}</span>) is now active.
                    You can track replies in the widget or on this page.
                  </p>
                  <Button
                    onClick={() => setSubmittedId(null)}
                    variant="outline"
                    className="rounded-xl font-bold"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      1. Select Topic Category
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {CATEGORY_OPTIONS.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <button
                            key={cat.label}
                            type="button"
                            onClick={() => setCategory(cat.label)}
                            className={cn(
                              "flex flex-col items-start gap-1 p-3 rounded-2xl border text-left transition-all duration-200",
                              category === cat.label
                                ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                                : "border-border/60 bg-surface/50 hover:bg-surface text-muted-foreground",
                            )}
                          >
                            <span className={cn("p-1.5 rounded-xl text-xs", cat.color)}>
                              <Icon className="size-4" />
                            </span>
                            <span className="font-bold text-xs text-foreground mt-1 line-clamp-1">
                              {cat.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <User className="size-3.5 text-primary" />
                        Your Name
                      </label>
                      <Input
                        value={visitorName}
                        onChange={(e) => setVisitorName(e.target.value)}
                        placeholder="e.g. Alex Vance"
                        className="rounded-xl text-sm h-10"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Mail className="size-3.5 text-primary" />
                        Your Email
                      </label>
                      <Input
                        type="email"
                        value={visitorEmail}
                        onChange={(e) => setVisitorEmail(e.target.value)}
                        placeholder="alex@example.com"
                        className="rounded-xl text-sm h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Subject</label>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Summary of your message..."
                      className="rounded-xl text-sm h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Message</label>
                    <Textarea
                      required
                      rows={5}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Write your detailed request, bug details, tool idea, or sponsorship inquiry here..."
                      className="rounded-xl text-sm resize-none"
                    />
                  </div>

                  {/* File Upload Attachment Area */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Paperclip className="size-3.5 text-primary" />
                        Attachments (Images, Videos, PDF, ZIP)
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-xl text-xs h-8"
                      >
                        Upload Files
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

                    {attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {attachments.map((att) => (
                          <Badge
                            key={att.id}
                            variant="secondary"
                            className="text-xs gap-1.5 p-1.5 px-3 rounded-xl"
                          >
                            <FileText className="size-3.5 text-primary" />
                            <span>{att.name}</span>
                            <span className="text-[10px] text-muted-foreground">({att.size})</span>
                            <X
                              className="size-3.5 ms-1 cursor-pointer hover:text-destructive"
                              onClick={() => {
                                revokeObjectUrlSafe(att.url);
                                setAttachments((prev) => prev.filter((a) => a.id !== att.id));
                              }}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full rounded-2xl font-bold text-base h-12 shadow-lg"
                  >
                    Send Message to Owner
                    <Send className="ms-2 size-4" />
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: History & FAQ (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Conversations Card */}
          <Card className="rounded-3xl border-border/80 bg-card/80 p-6 backdrop-blur-xl shadow-md">
            <CardContent className="p-0 space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <MessageSquare className="size-4 text-primary" />
                  Your Conversations
                </h3>
                <Badge variant="outline" className="text-xs">
                  {conversations.length} Active
                </Badge>
              </div>

              {conversations.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  You haven&apos;t started any conversations yet. Fill out the form to message the
                  owner!
                </p>
              ) : (
                <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                  {conversations.map((conv) => {
                    const lastMsg = conv.messages[conv.messages.length - 1];
                    return (
                      <div
                        key={conv.id}
                        className="rounded-2xl border border-border/60 bg-surface/50 p-3 space-y-1.5 hover:border-primary/40 transition-all"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <Badge variant="secondary" className="text-[10px] font-bold">
                            {conv.category}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(conv.updatedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-foreground line-clamp-1">
                          {conv.subject}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {lastMsg ? lastMsg.text : "No messages"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick FAQ Card */}
          <Card className="rounded-3xl border-border/80 bg-card/80 p-6 backdrop-blur-xl shadow-md">
            <CardContent className="p-0 space-y-4">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <HelpCircle className="size-4 text-primary" />
                Frequently Asked Questions
              </h3>

              <Accordion type="single" collapsible className="w-full">
                {FAQS.map((faq, idx) => (
                  <AccordionItem key={idx} value={`item-${idx}`} className="border-border/50">
                    <AccordionTrigger className="text-xs font-bold py-3 text-left hover:no-underline">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
