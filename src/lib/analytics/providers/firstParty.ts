import { collectAnalytics } from "../rpc/collect";
import type {
  AnalyticsConfig,
  AnalyticsEventParams,
  AnalyticsProviderInterface,
  FirstPartyAnalyticsEvent,
} from "../types";

const SESSION_KEY = "flixo_first_party_session";
const ENABLED_KEY = "flixo_first_party_analytics_enabled";
const BATCH_SIZE = 10;
const FLUSH_DELAY_MS = 1500;

function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  const existing = window.sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  window.sessionStorage.setItem(SESSION_KEY, id);
  return id;
}

function getEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem(ENABLED_KEY);
  return stored !== "false";
}

function isPrivateAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value.trim().toLocaleLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function getReferrerOrigin(): string | undefined {
  if (typeof document === "undefined" || !document.referrer) return undefined;
  try {
    return new URL(document.referrer).origin;
  } catch {
    return undefined;
  }
}

export class FirstPartyAnalyticsProvider implements AnalyticsProviderInterface {
  name = "first-party";
  private queue: FirstPartyAnalyticsEvent[] = [];
  private flushTimer: number | null = null;
  private previousPath: string | undefined;
  private currentPathStartedAt = Date.now();

  init(config: AnalyticsConfig): void {
    if (typeof window === "undefined" || !config.enabled || config.firstPartyEnabled === false) return;
    if (!getEnabled() || isPrivateAdminPath(window.location.pathname)) return;

    this.enqueue({ type: "session_start", sessionId: getSessionId(), path: window.location.pathname });
    window.addEventListener("beforeunload", () => {
      if (isPrivateAdminPath(window.location.pathname)) return;
      const durationMs = Math.max(0, Date.now() - this.currentPathStartedAt);
      this.enqueue({
        type: "session_end",
        sessionId: getSessionId(),
        path: window.location.pathname,
        durationMs,
      });
      void this.flush();
    });
  }

  setEnabled(enabled: boolean): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ENABLED_KEY, enabled ? "true" : "false");
    if (!enabled) {
      this.queue = [];
      if (this.flushTimer !== null) window.clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }

  trackPageView(path: string): void {
    if (!getEnabled() || isPrivateAdminPath(path)) return;
    const now = Date.now();
    const pagePath = path || window.location.pathname;
    const durationMs = Math.max(0, now - this.currentPathStartedAt);
    const previousPath = this.previousPath;

    if (previousPath && previousPath !== pagePath && !isPrivateAdminPath(previousPath)) {
      this.enqueue({
        type: "navigation",
        sessionId: getSessionId(),
        path: pagePath,
        previousPath,
        durationMs,
      });
    }

    this.currentPathStartedAt = now;
    this.previousPath = pagePath;
    this.enqueue({
      type: "page_view",
      sessionId: getSessionId(),
      locale: document.documentElement.lang || undefined,
      referrerOrigin: getReferrerOrigin(),
      path: pagePath,
    });
  }

  async trackSearch(query: string, resultCount?: number, category?: string): Promise<void> {
    if (!getEnabled() || isPrivateAdminPath(window.location.pathname) || !query.trim()) return;
    const queryHash = await sha256(query);
    this.enqueue({
      type: "search",
      sessionId: getSessionId(),
      locale: document.documentElement.lang || undefined,
      intentId: category,
      queryHash,
      path: window.location.pathname,
      resultCount,
    });
  }

  trackToolClick(toolId: string, _toolName?: string, category?: string): void {
    if (!getEnabled() || isPrivateAdminPath(window.location.pathname)) return;
    this.enqueue({
      type: "tool_click",
      sessionId: getSessionId(),
      toolId,
      category,
      path: window.location.pathname,
    });
  }

  trackCategoryClick(categoryId: string): void {
    if (!getEnabled() || isPrivateAdminPath(window.location.pathname)) return;
    this.enqueue({
      type: "category_click",
      sessionId: getSessionId(),
      category: categoryId,
      path: window.location.pathname,
    });
  }

  trackExternalLinkClick(url: string): void {
    if (!getEnabled() || isPrivateAdminPath(window.location.pathname)) return;
    let origin: string | undefined;
    try {
      origin = new URL(url, window.location.href).origin;
    } catch {
      origin = undefined;
    }
    this.enqueue({
      type: "external_link_click",
      sessionId: getSessionId(),
      referrerOrigin: origin,
      path: window.location.pathname,
    });
  }

  trackCopy(contentType: string, textLength?: number, toolId?: string): void {
    this.trackEvent("copy", { contentType, textLength, toolId });
  }

  trackDownload(fileName: string, fileType?: string, toolId?: string): void {
    this.trackEvent("download", { fileType, toolId, filenameLength: fileName.length });
  }

  trackEvent(eventName: string, params?: AnalyticsEventParams): void {
    if (!getEnabled() || isPrivateAdminPath(window.location.pathname)) return;
    const typeMap: Record<string, FirstPartyAnalyticsEvent["type"]> = {
      page_view: "page_view",
      search: "search",
      tool_click: "tool_click",
      category_click: "category_click",
      download: "download",
      copy: "copy",
      external_link: "external_link_click",
      session_start: "session_start",
      session_end: "session_end",
      tool_start: "tool_start",
      tool_complete: "tool_complete",
      navigation: "navigation",
      survey_response: "survey_response",
    };

    const type = typeMap[eventName] ?? "navigation";
    this.enqueue({
      type,
      sessionId: getSessionId(),
      locale: document.documentElement.lang || undefined,
      toolId: typeof params?.toolId === "string" ? params.toolId : undefined,
      category: typeof params?.category === "string" ? params.category : undefined,
      intentId: typeof params?.intentId === "string" ? params.intentId : undefined,
      path: window.location.pathname,
      durationMs:
        typeof params?.durationMs === "number" ? Math.max(0, Math.floor(params.durationMs)) : undefined,
    });
  }

  private enqueue(event: FirstPartyAnalyticsEvent): void {
    if (isPrivateAdminPath(event.path ?? "")) return;
    this.queue.push(event);
    if (this.queue.length >= BATCH_SIZE) {
      void this.flush();
      return;
    }
    if (this.flushTimer === null && typeof window !== "undefined") {
      this.flushTimer = window.setTimeout(() => {
        this.flushTimer = null;
        void this.flush();
      }, FLUSH_DELAY_MS);
    }
  }

  private async flush(): Promise<void> {
    if (!this.queue.length || typeof window === "undefined" || !getEnabled()) return;
    const batch = this.queue.splice(0, BATCH_SIZE);
    try {
      const result = await collectAnalytics({ data: { events: batch } });
      if (!result.ok && result.kind === "rate_limited") {
        this.queue.unshift(...batch.slice(0, 5));
      }
    } catch {
      // Privacy analytics is best-effort. The local provider remains the source
      // of truth when a server/database is unavailable.
    }
  }
}
