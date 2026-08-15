import { Link, useNavigate } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { useEffect, useRef } from "react";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();
  const navigate = useNavigate();
  const logoClicksRef = useRef(0);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleLogoClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
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

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5">
        <Link
          to="/"
          aria-label="Flixo"
          className="flex min-w-0 items-center"
          onClick={handleLogoClick}
        >
          <img
            src="/flixo-official-logo.svg"
            alt="Flixo AI — All Tools. One Place."
            className="size-11 shrink-0 object-contain"
            width="256"
            height="256"
            fetchPriority="high"
            decoding="async"
          />
        </Link>

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
    </header>
  );
}
