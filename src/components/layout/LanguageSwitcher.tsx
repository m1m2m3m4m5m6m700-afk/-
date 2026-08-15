import { Check, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LOCALES, useI18n, type LocaleCode } from "@/lib/i18n";

function buildLocalizedPath(pathname: string, targetLocale: LocaleCode): string {
  const segments = pathname.split("/").filter(Boolean);
  const knownLocale = LOCALES.some((locale) => locale.code === segments[0]) ? segments.shift() : undefined;
  const targetPrefix = targetLocale === "en" ? "" : `/${targetLocale}`;
  const rest = segments.length ? `/${segments.join("/")}` : "";

  // `/en` is not a public English route; map it to `/`.
  if (knownLocale === "en" && !rest) return targetPrefix || "/";
  return `${targetPrefix}${rest}` || "/";
}

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  const handleSelectLanguage = (targetCode: LocaleCode) => {
    if (targetCode === locale) return;
    setLocale(targetCode);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.pathname = buildLocalizedPath(url.pathname, targetCode);
      window.location.assign(url.toString());
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
