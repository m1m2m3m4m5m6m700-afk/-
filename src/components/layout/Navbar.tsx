import { Link, useNavigate } from "@tanstack/react-router";
import { AudioLines, FileText, ImageIcon, Moon, Sun, Video } from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { useEffect, useRef, type MouseEvent } from "react";

const CATEGORY_NAV = [
  { id: "images", label: "Images", icon: ImageIcon },
  { id: "video", label: "Video", icon: Video },
  { id: "audio", label: "MP3", icon: AudioLines },
  { id: "pdf", label: "PDF", icon: FileText },
] as const;

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const logoClicksRef = useRef(0);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    logoClicksRef.current += 1;
    if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current);
    resetTimerRef.current = window.setTimeout(() => {
      logoClicksRef.current = 0;
      resetTimerRef.current = null;
    }, 1800);

    if (logoClicksRef.current === 5) {
      logoClicksRef.current = 0;
      if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
      event.preventDefault();
      void navigate({ to: "/admin" });
    }
  };

  const homePath = locale === "en" ? "/" : `/${locale}`;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/82 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-3 px-4 sm:px-5">
        <Link
          to="/"
          aria-label="Flixo"
          className="flex shrink-0 items-center"
          onClick={handleLogoClick}
        >
          <img
            src="/flixo-official-logo.svg"
            alt="Flixo AI — All Tools. One Place."
            className="size-10 object-contain sm:size-11"
            width="256"
            height="256"
            fetchPriority="high"
            decoding="async"
          />
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto scrollbar-none md:flex" aria-label="Primary tool categories">
          {CATEGORY_NAV.map(({ id, label, icon: Icon }) => (
            <a
              key={id}
              href={`${homePath}#${id}`}
              className="group inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-primary/8 hover:text-foreground"
            >
              <Icon className="size-3.5 text-primary/80 transition-transform group-hover:scale-105" />
              {label}
            </a>
          ))}
        </nav>

        <div className="ms-auto flex shrink-0 items-center gap-1.5">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("nav.toggleTheme")}
            onClick={toggleTheme}
            className="rounded-xl"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </div>
      </div>

      <div className="border-t border-border/40 md:hidden">
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 scrollbar-none" aria-label="Tool categories">
          {CATEGORY_NAV.map(({ id, label, icon: Icon }) => (
            <a
              key={id}
              href={`${homePath}#${id}`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-muted/35 px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-primary/8 hover:text-foreground"
            >
              <Icon className="size-3.5 text-primary/80" />
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
