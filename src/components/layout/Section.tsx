import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  align?: "left" | "center";
}

/** Reusable section wrapper so every landing block shares rhythm and headings. */
export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
  align = "center",
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn("mx-auto max-w-6xl scroll-mt-20 px-5 py-20 md:py-28", className)}
    >
      {(eyebrow || title || description) && (
        <div className={cn("mb-12 max-w-2xl", align === "center" && "mx-auto text-center")}>
          {eyebrow && (
            <span className="inline-flex rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {eyebrow}
            </span>
          )}
          {title && <h2 className="mt-4 text-3xl font-bold text-balance md:text-4xl">{title}</h2>}
          {description && (
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
