import { Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { ToolSeoSection } from "./ToolSeoSection";
import { SponsorSection } from "@/components/landing/SponsorSection";
import { usePageSeo } from "@/lib/usePageSeo";

interface ToolLayoutProps {
  icon: LucideIcon;
  name: string;
  description: string;
  category: string;
  slug?: string;
  children: ReactNode;
}

/** Shared chrome for every tool page — reuse this for future tools. */
export function ToolLayout({
  icon: Icon,
  name,
  description,
  category,
  slug,
  children,
}: ToolLayoutProps) {
  const { t } = useI18n();

  // Extract slug from pathname if not explicitly passed
  const pathSlug =
    slug ||
    (typeof window !== "undefined"
      ? window.location.pathname.replace(/^\/tools\//, "").split("/")[0]
      : "");

  usePageSeo(pathSlug);

  return (
    <div className="bg-hero-glow">
      <div className="mx-auto max-w-5xl px-5 pb-20 pt-10 md:pt-14">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <ol className="flex items-center flex-wrap gap-1.5">
            <li>
              <Link to="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="size-3 opacity-60 rtl:rotate-180" />
            </li>
            <li>
              <Link
                to="/categories/$slug"
                params={{ slug: "utilities" }}
                className="hover:text-foreground transition-colors"
              >
                Tools
              </Link>
            </li>
            <li>
              <ChevronRight className="size-3 opacity-60 rtl:rotate-180" />
            </li>
            <li className="font-semibold text-foreground" aria-current="page">
              {name}
            </li>
          </ol>
        </nav>

        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 rtl:-scale-x-100" />
          {t("tool.back")}
        </Link>

        <header className="mt-6 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center">
          <div className="flex min-w-0 items-center gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/12 text-primary">
              <Icon className="size-6" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold md:text-3xl">{name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            {category}
          </span>
        </header>

        <div className="mt-8">{children}</div>

        {/* Dynamic SEO Section with Breadcrumbs, Content, FAQ Accordions, and Internal Links */}
        {pathSlug && <ToolSeoSection slug={pathSlug} toolName={name} categoryName={category} />}

        {/* Reusable Sponsor Section at the bottom of every tool page */}
        <div className="mt-16">
          <SponsorSection variant="compact" />
        </div>
      </div>
    </div>
  );
}
