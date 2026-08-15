import { Link } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5">
        <Link to="/" aria-label="Flixo" className="flex min-w-0 items-center">
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
