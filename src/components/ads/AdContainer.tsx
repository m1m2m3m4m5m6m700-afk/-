import { useEffect, useRef } from "react";

interface AdContainerProps {
  slotId?: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  minHeight?: string;
  responsive?: boolean;
  className?: string;
  label?: string;
}

export function AdContainer({
  slotId = "default-slot",
  format = "auto",
  minHeight = "280px",
  responsive = true,
  className = "",
  label = "Advertisement",
}: AdContainerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    try {
      if (
        typeof window !== "undefined" &&
        (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle
      ) {
        (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle.push({});
      }
    } catch (e) {
      // Ignore adsbygoogle push errors during SSR or adblock
    }
  }, []);

  return (
    <aside
      className={`my-6 flex flex-col items-center justify-center rounded-2xl border border-border/40 bg-surface/30 p-3 text-center transition-colors ${className}`}
      style={{ minHeight }}
      aria-label={label}
    >
      <span className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
        {label}
      </span>
      <div className="w-full overflow-hidden flex items-center justify-center">
        {process.env.NODE_ENV === "production" && slotId !== "default-slot" ? (
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: "block", width: "100%", minHeight: "250px" }}
            data-ad-client="ca-pub-0000000000000000"
            data-ad-slot={slotId}
            data-ad-format={format}
            data-full-width-responsive={responsive ? "true" : "false"}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-xs text-muted-foreground/70">
            <span className="font-mono text-[11px] font-medium text-muted-foreground/50">
              Ad Space ({minHeight})
            </span>
            <span className="mt-1 text-[11px] text-muted-foreground/40">
              Reserved placeholder for Google AdSense • Zero CLS
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
