import type { AnalyticsConfig, AnalyticsEventParams, AnalyticsProviderInterface } from "../types";

type ClarityFunction = {
  (...args: unknown[]): void;
  q?: unknown[];
};

declare global {
  interface Window {
    clarity?: ClarityFunction;
  }
}

export class ClarityProvider implements AnalyticsProviderInterface {
  name = "clarity";
  private initialized = false;

  init(config: AnalyticsConfig): void {
    if (typeof window === "undefined") return;

    const id =
      config.clarityProjectId ||
      import.meta.env.VITE_CLARITY_PROJECT_ID ||
      import.meta.env.VITE_CLARITY_ID;
    if (!id || this.initialized) return;

    // Microsoft Clarity standard snippet with lazy script loading
    const clarityFn: ClarityFunction = (...args: unknown[]) => {
      clarityFn.q = clarityFn.q || [];
      clarityFn.q.push(args);
    };

    window.clarity = window.clarity || clarityFn;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${encodeURIComponent(id)}`;
    document.head.appendChild(script);

    this.initialized = true;

    if (config.debug) {
      console.log(`[Analytics:Clarity] Initialized with Project ID: ${id}`);
    }
  }

  private sendEvent(eventName: string, params: AnalyticsEventParams = {}): void {
    if (!this.initialized || !window.clarity) return;
    try {
      window.clarity("event", eventName);
      // Pass metadata if parameters exist
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && window.clarity) {
          window.clarity("set", `${eventName}_${key}`, String(val));
        }
      });
    } catch {
      // Ignore clarity runtime errors
    }
  }

  trackPageView(path: string): void {
    if (!this.initialized || !window.clarity) return;
    try {
      window.clarity("set", "page_path", path);
    } catch {
      // Ignore
    }
  }

  trackSearch(query: string, resultCount?: number, category?: string): void {
    this.sendEvent("search", { query, resultCount, category });
  }

  trackToolClick(toolId: string, toolName?: string, category?: string): void {
    this.sendEvent("tool_click", { toolId, toolName, category });
  }

  trackCategoryClick(categoryId: string, categoryName?: string): void {
    this.sendEvent("category_click", { categoryId, categoryName });
  }

  trackExternalLinkClick(url: string, label?: string): void {
    this.sendEvent("external_link_click", { url, label });
  }

  trackCopy(contentType: string, textLength?: number, toolId?: string): void {
    this.sendEvent("copy_action", { contentType, textLength, toolId });
  }

  trackDownload(fileName: string, fileType?: string, toolId?: string): void {
    this.sendEvent("download_action", { fileName, fileType, toolId });
  }

  trackEvent(eventName: string, params?: AnalyticsEventParams): void {
    this.sendEvent(eventName, params);
  }
}
