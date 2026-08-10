import { Link } from "@tanstack/react-router";
import { Sparkles, BarChart3 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface FooterProps {
  onRequestTool?: () => void;
  onOpenAnalytics?: () => void;
}

export function Footer({ onRequestTool, onOpenAnalytics }: FooterProps) {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border/60 bg-surface/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            <span className="font-display text-lg font-bold">Flixo</span>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            {t("footer.tagline")}
          </p>
          {onOpenAnalytics && (
            <button
              onClick={onOpenAnalytics}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <BarChart3 className="size-3.5 text-primary" />
              Local Analytics
            </button>
          )}
        </div>

        <FooterCol title="About Flixo">
          <FooterLink href="/about">About Flixo</FooterLink>
          <FooterLink href="/contact">Contact Support</FooterLink>
          <FooterLink href="/changelog">Changelog</FooterLink>
          <FooterLink href="/sitemap">Sitemap Directory</FooterLink>
          {onRequestTool && (
            <li className="pt-1">
              <button
                onClick={onRequestTool}
                className="text-xs text-primary font-bold transition-colors hover:underline"
              >
                + {t("request.trigger")}
              </button>
            </li>
          )}
        </FooterCol>

        <FooterCol title="Trust & E-E-A-T">
          <FooterLink href="/editorial-policy">Editorial Policy</FooterLink>
          <FooterLink href="/accessibility">Accessibility (WCAG AA)</FooterLink>
          <FooterLink href="/status">System Status</FooterLink>
          <FooterLink href="/api-docs">Developer API</FooterLink>
        </FooterCol>

        <FooterCol title="Legal & Privacy">
          <FooterLink href="/privacy">Privacy Policy</FooterLink>
          <FooterLink href="/terms">Terms of Use</FooterLink>
          <FooterLink href="/disclaimer">Legal Disclaimer</FooterLink>
          <FooterLink href="/cookie-policy">Cookie Policy</FooterLink>
          <FooterLink href="/dmca">DMCA Policy</FooterLink>
        </FooterCol>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{t("footer.rights", { year: new Date().getFullYear() })}</p>
          <p>{t("footer.built")}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <a
        href={href}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        {children}
      </a>
    </li>
  );
}
