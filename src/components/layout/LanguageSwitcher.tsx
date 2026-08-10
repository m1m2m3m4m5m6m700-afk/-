import { Check, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LOCALES, useI18n, type LocaleCode } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  const handleSelectLanguage = (targetCode: LocaleCode) => {
    setLocale(targetCode);
    if (typeof window !== "undefined") {
      const pathname = window.location.pathname;
      const toolMatch = pathname.match(/^(?:\/(en|ar))?\/tools\/([a-zA-Z0-9_-]+)$/);
      if (toolMatch && toolMatch[2]) {
        const slug = toolMatch[2];
        const targetUrl = `/${targetCode}/tools/${slug}`;
        setTimeout(() => {
          window.location.assign(targetUrl);
        }, 0);
        return;
      }
      if (pathname === "/" || pathname === "/en" || pathname === "/ar") {
        const targetUrl = `/${targetCode}`;
        setTimeout(() => {
          window.location.assign(targetUrl);
        }, 0);
        return;
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t("lang.switch")}
          className="gap-1.5 rounded-xl px-2.5"
        >
          <Globe className="size-4" />
          <span className="text-xs font-medium">{current.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40 rounded-xl">
        {LOCALES.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onSelect={() => handleSelectLanguage(l.code as LocaleCode)}
            className="flex items-center justify-between gap-3 rounded-lg text-sm"
          >
            <span dir={l.dir}>{l.label}</span>
            {l.code === locale && <Check className="size-3.5 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
