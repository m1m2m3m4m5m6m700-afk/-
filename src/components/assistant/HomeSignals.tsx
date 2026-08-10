import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Image as ImageIcon,
  FileText,
  Video,
  ShieldCheck,
  Music,
  FileType,
  Clock,
  Star,
  TrendingUp,
  Sparkles,
  PenLine,
  Code2,
  Wrench,
  Terminal,
  Globe,
  Zap,
  Gift,
} from "lucide-react";
import { tools } from "@/data/tools";
import { LANGUAGES } from "@/lib/tools/translate";

/** Headline numbers shown directly under the prompt box. */
export function HeroStats() {
  const stats = useMemo(() => {
    const total = tools.length;
    return [
      { value: `${total}+`, label: "AI & Utility Tools" },
      { value: `${LANGUAGES.length}+`, label: "Languages" },
      { value: "100%", label: "Browser Based" },
      { value: "Free", label: "Forever" },
    ];
  }, []);

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border/70 bg-border/50 sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-card/80 px-4 py-4 text-center backdrop-blur-md">
          <p
            className="font-display text-xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent"
            dir="ltr"
          >
            {s.value}
          </p>
          <p className="mt-1 text-[11px] font-medium text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

const CAPABILITIES = [
  { icon: PenLine, label: "AI Writing", to: "/categories/$slug", slug: "writing" },
  { icon: ImageIcon, label: "Images", to: "/categories/$slug", slug: "images" },
  { icon: FileText, label: "PDF", to: "/categories/$slug", slug: "pdf" },
  { icon: Video, label: "Video", to: "/categories/$slug", slug: "video" },
  { icon: Music, label: "Audio", to: "/categories/$slug", slug: "audio" },
  { icon: FileType, label: "Documents", to: "/categories/$slug", slug: "files" },
  { icon: Code2, label: "Code", to: "/categories/$slug", slug: "ai" },
  { icon: Wrench, label: "Productivity", to: "/categories/$slug", slug: "utilities" },
  { icon: ShieldCheck, label: "Security", to: "/tools/$slug", slug: "password-generator" },
  { icon: Terminal, label: "Developer Tools", to: "/categories/$slug", slug: "developer" },
] as const;

/** Capability cards that open the matching category or tool page. */
export function CapabilityCards() {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        What Flixo can do
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {CAPABILITIES.map(({ icon: Icon, label, to, slug }) => (
          <Link
            key={label}
            to={to}
            params={{ slug }}
            className="flex items-center gap-2 rounded-2xl border border-border/70 bg-card/70 px-3 py-2.5 text-start text-xs font-medium transition-all duration-200 hover:border-primary/40 hover:bg-card"
          >
            <Icon className="size-4 shrink-0 text-primary" />
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

const FILE_TYPES = [
  "PDF",
  "DOCX",
  "PPTX",
  "XLSX",
  "PNG",
  "JPG",
  "WEBP",
  "SVG",
  "MP4",
  "MP3",
  "ZIP",
  "TXT",
  "CSV",
  "JSON",
] as const;

/** Communicates which file types the assistant accepts. */
export function SupportedFiles() {
  return (
    <div className="rounded-3xl border border-border/70 bg-surface/60 p-4 backdrop-blur-md">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        Files you can drop
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {FILE_TYPES.map((label) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-[11px] font-semibold text-muted-foreground"
            dir="ltr"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

const QUICK_TABS = [
  {
    id: "recent",
    label: "Recent",
    icon: Clock,
    items: ["Translate a PDF to Arabic", "Compress this PDF", "Remove image background"],
  },
  {
    id: "favorites",
    label: "Favorites",
    icon: Star,
    items: [
      "Generate a strong password",
      "Generate a QR code",
      "Enhance the quality of this image",
    ],
  },
  {
    id: "trending",
    label: "Trending",
    icon: TrendingUp,
    items: ["Download this YouTube video", "Convert MP4 to MP3", "Summarize this website"],
  },
  {
    id: "new",
    label: "New",
    icon: Sparkles,
    items: ["Extract text from image", "Generate a logo", "Generate source code"],
  },
] as const;

/** Quick access rail: Recent / Favorites / Trending / New prompt shortcuts. */
export function QuickAccessBar({ onSelect }: { onSelect: (prompt: string) => void }) {
  const [active, setActive] = useState<(typeof QUICK_TABS)[number]["id"]>("trending");
  const current = QUICK_TABS.find((tab) => tab.id === active) ?? QUICK_TABS[0];

  return (
    <div className="rounded-3xl border border-border/70 bg-surface/60 p-3 backdrop-blur-md">
      <div className="flex flex-wrap gap-1.5">
        {QUICK_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActive(id)}
            aria-pressed={active === id}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              active === id
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-card hover:text-foreground"
            }`}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {current.items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            className="rounded-2xl border border-border/70 bg-card/70 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

const TRUST = [
  { icon: Star, label: "1000+ Smart Tools" },
  { icon: Globe, label: "100+ Languages" },
  { icon: ShieldCheck, label: "Privacy First" },
  { icon: Zap, label: "Browser Based" },
  { icon: Gift, label: "Free Forever" },
] as const;

/** Reassurance row under the prompt box. */
export function TrustBar() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
      {TRUST.map(({ icon: Icon, label }) => (
        <span
          key={label}
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground"
        >
          <Icon className="size-3.5 text-emerald-500" />
          {label}
        </span>
      ))}
    </div>
  );
}
