import type { AnalyticsConfig, AnalyticsEventParams, AnalyticsProviderInterface } from "../types";

export interface CustomProviderOptions {
  name: string;
  endpoint?: string;
  onEvent?: (eventName: string, params: AnalyticsEventParams) => void;
}

export class CustomAnalyticsProvider implements AnalyticsProviderInterface {
  name: string;
  private endpoint?: string;
  private onEvent?: (eventName: string, params: AnalyticsEventParams) => void;
  private initialized = false;

  constructor(options: CustomProviderOptions) {
    this.name = options.name;
    this.endpoint = options.endpoint;
    this.onEvent = options.onEvent;
  }

  init(config: AnalyticsConfig): void {
    this.initialized = true;
    if (config.debug) {
      console.log(`[Analytics:CustomProvider:${this.name}] Initialized`);
    }
  }

  private dispatch(eventName: string, params: AnalyticsEventParams = {}): void {
    if (!this.initialized) return;

    if (this.onEvent) {
      try {
        this.onEvent(eventName, params);
      } catch (err) {
        console.warn(`[Analytics:${this.name}] Callback error:`, err);
      }
    }

    if (this.endpoint && typeof window !== "undefined" && window.navigator?.sendBeacon) {
      try {
        const payload = JSON.stringify({
          event: eventName,
          properties: params,
          timestamp: new Date().toISOString(),
          url: window.location.href,
        });
        window.navigator.sendBeacon(this.endpoint, payload);
      } catch (err) {
        console.warn(`[Analytics:${this.name}] sendBeacon error:`, err);
      }
    }
  }

  trackPageView(path: string, title?: string): void {
    this.dispatch("page_view", { path, title });
  }

  trackSearch(query: string, resultCount?: number, category?: string): void {
    this.dispatch("search", { query, resultCount, category });
  }

  trackToolClick(toolId: string, toolName?: string, category?: string): void {
    this.dispatch("tool_click", { toolId, toolName, category });
  }

  trackCategoryClick(categoryId: string, categoryName?: string): void {
    this.dispatch("category_click", { categoryId, categoryName });
  }

  trackExternalLinkClick(url: string, label?: string): void {
    this.dispatch("external_link_click", { url, label });
  }

  trackCopy(contentType: string, textLength?: number, toolId?: string): void {
    this.dispatch("copy_action", { contentType, textLength, toolId });
  }

  trackDownload(fileName: string, fileType?: string, toolId?: string): void {
    this.dispatch("download_action", { fileName, fileType, toolId });
  }

  trackEvent(eventName: string, params?: AnalyticsEventParams): void {
    this.dispatch(eventName, params);
  }
}
