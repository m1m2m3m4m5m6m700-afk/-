import type {
  AnalyticsConfig,
  AnalyticsData,
  AnalyticsEventParams,
  AnalyticsProviderInterface,
  AnalyticsRecentEvent,
  AnalyticsRecentEventType,
} from "../types";

const STORAGE_KEY = "flixo_analytics_v1";
const MAX_RECENT_EVENTS = 25;
let lastVisitedPage: string | null = null;

function getInitialData(): AnalyticsData {
  return {
    visitedCategories: {},
    openedTools: {},
    searchedKeywords: {},
    requestedTools: {},
    pageViews: {},
    landingPages: {},
    exitPages: {},
    recentEvents: [],
  };
}

function incrementCounter(bucket: Record<string, number>, key: string): void {
  if (!key) return;
  bucket[key] = (bucket[key] || 0) + 1;
}

export class LocalAnalyticsProvider implements AnalyticsProviderInterface {
  name = "local";

  init(_config: AnalyticsConfig): void {
    if (typeof window === "undefined") return;

    window.addEventListener("beforeunload", () => {
      if (lastVisitedPage) {
        this.trackExitPage(lastVisitedPage);
      }
    });
  }

  getData(): AnalyticsData {
    if (typeof window === "undefined") return getInitialData();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as AnalyticsData) : getInitialData();
      return {
        visitedCategories: parsed.visitedCategories || {},
        openedTools: parsed.openedTools || {},
        searchedKeywords: parsed.searchedKeywords || {},
        requestedTools: parsed.requestedTools || {},
        pageViews: parsed.pageViews || {},
        landingPages: parsed.landingPages || {},
        exitPages: parsed.exitPages || {},
        recentEvents: Array.isArray(parsed.recentEvents) ? parsed.recentEvents : [],
      };
    } catch {
      return getInitialData();
    }
  }

  saveData(data: AnalyticsData): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore write errors
    }
  }

  clearData(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }

  private recordEvent(type: AnalyticsRecentEventType, title: string, detail: string): void {
    const data = this.getData();
    const nextEvent: AnalyticsRecentEvent = {
      id: `analytics-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      title,
      detail,
      createdAt: new Date().toISOString(),
    };

    data.recentEvents = [nextEvent, ...data.recentEvents].slice(0, MAX_RECENT_EVENTS);
    this.saveData(data);
  }

  trackPageView(path: string): void {
    if (typeof window === "undefined") return;
    const pagePath = path || window.location.pathname;

    if (lastVisitedPage && lastVisitedPage !== pagePath) {
      this.trackExitPage(lastVisitedPage);
    }
    lastVisitedPage = pagePath;

    const data = this.getData();
    incrementCounter(data.pageViews, pagePath);

    if (!sessionStorage.getItem("flixo_session_started")) {
      sessionStorage.setItem("flixo_session_started", "true");
      incrementCounter(data.landingPages, pagePath);
    }

    data.recentEvents = [
      {
        id: `analytics-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: "page_view" as AnalyticsRecentEventType,
        title: `Visited ${pagePath}`,
        detail: "Page view recorded",
        createdAt: new Date().toISOString(),
      },
      ...data.recentEvents,
    ].slice(0, MAX_RECENT_EVENTS);

    this.saveData(data);
  }

  trackExitPage(path: string): void {
    if (!path) return;
    const data = this.getData();
    incrementCounter(data.exitPages, path);
    this.saveData(data);
  }

  trackSearch(query: string): void {
    const cleaned = query.trim().toLowerCase();
    if (!cleaned) return;
    const data = this.getData();
    incrementCounter(data.searchedKeywords, cleaned);
    this.saveData(data);
    this.recordEvent("search", `Searched for "${cleaned}"`, "Search query recorded");
  }

  trackToolClick(toolId: string): void {
    if (!toolId) return;
    const data = this.getData();
    incrementCounter(data.openedTools, toolId);
    this.saveData(data);
    this.recordEvent("tool_click", `Opened ${toolId}`, "Tool interaction recorded");
  }

  trackCategoryClick(categoryId: string): void {
    if (!categoryId) return;
    const data = this.getData();
    incrementCounter(data.visitedCategories, categoryId);
    this.saveData(data);
    this.recordEvent("category_click", `Opened category ${categoryId}`, "Category visit recorded");
  }

  trackExternalLinkClick(url: string, label?: string): void {
    if (!url) return;
    this.recordEvent("external_link", label || "Opened external link", url);
  }

  trackCopy(contentType: string, textLength?: number, toolId?: string): void {
    const detail = [toolId, textLength ? `${textLength} chars` : undefined]
      .filter(Boolean)
      .join(" • ");
    this.recordEvent(
      "copy",
      `Copied ${contentType || "content"}`,
      detail || "Copy action recorded",
    );
  }

  trackDownload(fileName: string, fileType?: string, toolId?: string): void {
    const detail = [fileType, toolId].filter(Boolean).join(" • ");
    this.recordEvent("download", `Downloaded ${fileName || "file"}`, detail || "Download recorded");
  }

  trackToolRequest(requestText: string): void {
    const cleaned = requestText.trim();
    if (!cleaned) return;
    const data = this.getData();
    incrementCounter(data.requestedTools, cleaned);
    this.saveData(data);
  }

  trackEvent(eventName: string, params?: AnalyticsEventParams): void {
    if (!eventName) return;
    const detail =
      params && Object.keys(params).length > 0
        ? Object.entries(params)
            .filter(([, value]) => value !== undefined && value !== null && value !== "")
            .map(([key, value]) => `${key}: ${String(value)}`)
            .join(" • ")
        : "Custom event recorded";

    const mappedType: AnalyticsRecentEventType =
      eventName === "download"
        ? "download"
        : eventName === "copy"
          ? "copy"
          : eventName === "external_link"
            ? "external_link"
            : eventName === "search"
              ? "search"
              : eventName === "page_view"
                ? "page_view"
                : eventName === "tool_click"
                  ? "tool_click"
                  : eventName === "category_click"
                    ? "category_click"
                    : "tool_click";

    this.recordEvent(mappedType, eventName.replace(/_/g, " "), detail);
  }
}
