import type { AnalyticsConfig, AnalyticsEventParams, AnalyticsProviderInterface } from "./types";
import { GA4Provider } from "./providers/ga4";
import { ClarityProvider } from "./providers/clarity";
import { LocalAnalyticsProvider } from "./providers/local";

class AnalyticsService {
  private providers: AnalyticsProviderInterface[] = [];
  private localProvider: LocalAnalyticsProvider;
  private config: AnalyticsConfig = {
    enabled: true,
  };
  private initialized = false;

  constructor() {
    this.localProvider = new LocalAnalyticsProvider();
    this.providers.push(this.localProvider);
  }

  public init(customConfig?: Partial<AnalyticsConfig>): void {
    if (typeof window === "undefined" || this.initialized) return;

    const envEnabled = import.meta.env.VITE_ENABLE_ANALYTICS !== "false";
    const debug = import.meta.env.VITE_ANALYTICS_DEBUG === "true";

    this.config = {
      enabled: envEnabled,
      debug,
      gaMeasurementId: import.meta.env.VITE_GA_MEASUREMENT_ID || import.meta.env.VITE_GA_ID,
      clarityProjectId: import.meta.env.VITE_CLARITY_PROJECT_ID || import.meta.env.VITE_CLARITY_ID,
      ...customConfig,
    };

    if (!this.config.enabled) {
      if (debug) console.log("[Analytics] Disabled via configuration");
      return;
    }

    // Defer initialization to requestIdleCallback or setTimeout to minimize main thread blocking
    const loadProviders = () => {
      // Auto-register GA4 if ID is present
      if (this.config.gaMeasurementId && !this.providers.some((p) => p.name === "ga4")) {
        this.providers.push(new GA4Provider());
      }

      // Auto-register Clarity if Project ID is present
      if (this.config.clarityProjectId && !this.providers.some((p) => p.name === "clarity")) {
        this.providers.push(new ClarityProvider());
      }

      // Add custom providers if specified in config
      if (this.config.customProviders) {
        this.config.customProviders.forEach((p) => {
          if (!this.providers.some((existing) => existing.name === p.name)) {
            this.providers.push(p);
          }
        });
      }

      // Initialize all providers
      this.providers.forEach((provider) => {
        try {
          provider.init(this.config);
        } catch (err) {
          console.warn(`[Analytics] Failed to initialize provider '${provider.name}':`, err);
        }
      });

      this.initialized = true;
      if (debug) {
        console.log(
          `[Analytics] Centralized service initialized with ${this.providers.length} providers.`,
        );
      }
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => loadProviders());
    } else {
      setTimeout(loadProviders, 200);
    }
  }

  public registerProvider(provider: AnalyticsProviderInterface): void {
    if (!this.providers.some((p) => p.name === provider.name)) {
      this.providers.push(provider);
      if (this.initialized) {
        provider.init(this.config);
      }
    }
  }

  public getProvider<T extends AnalyticsProviderInterface>(name: string): T | undefined {
    return this.providers.find((p) => p.name === name) as T | undefined;
  }

  public getLocalProvider(): LocalAnalyticsProvider {
    return this.localProvider;
  }

  public trackPageView(path: string, title?: string): void {
    if (!this.config.enabled) return;
    this.providers.forEach((p) => p.trackPageView?.(path, title));
  }

  public trackSearch(query: string, resultCount?: number, category?: string): void {
    if (!this.config.enabled) return;
    this.providers.forEach((p) => p.trackSearch?.(query, resultCount, category));
  }

  public trackToolClick(toolId: string, toolName?: string, category?: string): void {
    if (!this.config.enabled) return;
    this.providers.forEach((p) => p.trackToolClick?.(toolId, toolName, category));
  }

  public trackCategoryClick(categoryId: string, categoryName?: string): void {
    if (!this.config.enabled) return;
    this.providers.forEach((p) => p.trackCategoryClick?.(categoryId, categoryName));
  }

  public trackExternalLinkClick(url: string, label?: string): void {
    if (!this.config.enabled) return;
    this.providers.forEach((p) => p.trackExternalLinkClick?.(url, label));
  }

  public trackCopy(contentType: string, textLength?: number, toolId?: string): void {
    if (!this.config.enabled) return;
    this.providers.forEach((p) => p.trackCopy?.(contentType, textLength, toolId));
  }

  public trackDownload(fileName: string, fileType?: string, toolId?: string): void {
    if (!this.config.enabled) return;
    this.providers.forEach((p) => p.trackDownload?.(fileName, fileType, toolId));
  }

  public trackEvent(eventName: string, params?: AnalyticsEventParams): void {
    if (!this.config.enabled) return;
    this.providers.forEach((p) => p.trackEvent?.(eventName, params));
  }
}

export const analytics = new AnalyticsService();
