import type { AnalyticsConfig, AnalyticsEventParams, AnalyticsProviderInterface } from "../types";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export class GA4Provider implements AnalyticsProviderInterface {
  name = "ga4";
  private initialized = false;
  private measurementId: string | null = null;

  init(config: AnalyticsConfig): void {
    if (typeof window === "undefined") return;

    const id =
      config.gaMeasurementId ||
      import.meta.env.VITE_GA_MEASUREMENT_ID ||
      import.meta.env.VITE_GA_ID;
    if (!id || this.initialized) return;

    this.measurementId = id;

    // Lazy load GA script asynchronously
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    }
    window.gtag = gtag;

    gtag("js", new Date());
    gtag("config", id, { send_page_view: false }); // We manage page views manually for SPA accuracy

    document.head.appendChild(script);
    this.initialized = true;

    if (config.debug) {
      console.log(`[Analytics:GA4] Initialized with ID: ${id}`);
    }
  }

  private sendEvent(eventName: string, params: AnalyticsEventParams = {}): void {
    if (!this.initialized || !window.gtag) return;
    window.gtag("event", eventName, params);
  }

  trackPageView(path: string, title?: string): void {
    this.sendEvent("page_view", {
      page_path: path,
      page_title: title || document.title,
      send_to: this.measurementId || undefined,
    });
  }

  trackSearch(query: string, resultCount?: number, category?: string): void {
    this.sendEvent("search", {
      search_term: query,
      result_count: resultCount,
      category,
    });
  }

  trackToolClick(toolId: string, toolName?: string, category?: string): void {
    this.sendEvent("tool_click", {
      tool_id: toolId,
      tool_name: toolName || toolId,
      category,
    });
  }

  trackCategoryClick(categoryId: string, categoryName?: string): void {
    this.sendEvent("category_click", {
      category_id: categoryId,
      category_name: categoryName || categoryId,
    });
  }

  trackExternalLinkClick(url: string, label?: string): void {
    this.sendEvent("click", {
      event_category: "outbound",
      link_url: url,
      link_text: label,
    });
  }

  trackCopy(contentType: string, textLength?: number, toolId?: string): void {
    this.sendEvent("copy_action", {
      content_type: contentType,
      text_length: textLength,
      tool_id: toolId,
    });
  }

  trackDownload(fileName: string, fileType?: string, toolId?: string): void {
    this.sendEvent("file_download", {
      file_name: fileName,
      file_extension: fileType,
      tool_id: toolId,
    });
  }

  trackEvent(eventName: string, params?: AnalyticsEventParams): void {
    this.sendEvent(eventName, params);
  }
}
