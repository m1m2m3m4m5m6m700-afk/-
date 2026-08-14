import type { AnalyticsConfig, AnalyticsEventParams, AnalyticsProviderInterface } from "./types";
import { FirstPartyAnalyticsProvider } from "./providers/firstParty";
import { LocalAnalyticsProvider } from "./providers/local";

class AnalyticsService {
  private providers: AnalyticsProviderInterface[] = [];
  private localProvider: LocalAnalyticsProvider;
  private firstPartyProvider: FirstPartyAnalyticsProvider;
  private config: AnalyticsConfig = {
    enabled: true,
    firstPartyEnabled: true,
  };
  private initialized = false;

  constructor() {
    this.localProvider = new LocalAnalyticsProvider();
    this.firstPartyProvider = new FirstPartyAnalyticsProvider();
    this.providers.push(this.localProvider, this.firstPartyProvider);
  }

  public init(customConfig?: Partial<AnalyticsConfig>): void {
    if (typeof window === "undefined" || this.initialized) return;

    const envEnabled = import.meta.env.VITE_ENABLE_ANALYTICS !== "false";
    const firstPartyEnabled = import.meta.env.VITE_ENABLE_FIRST_PARTY_ANALYTICS !== "false";
    const debug = import.meta.env.VITE_ANALYTICS_DEBUG === "true";

    this.config = {
      enabled: envEnabled,
      firstPartyEnabled,
      debug,
      ...customConfig,
    };

    if (!this.config.enabled) {
      if (debug) console.log("[Analytics] Disabled via configuration");
      return;
    }

    const loadProviders = () => {
      // Flixo no longer auto-registers Google Analytics, Microsoft Clarity, or
      // any other third-party behavior tracker. First-party anonymous analytics
      // is the default remote collector; custom providers remain opt-in.
      if (this.config.customProviders) {
        this.config.customProviders.forEach((provider) => {
          if (!this.providers.some((existing) => existing.name === provider.name)) {
            this.providers.push(provider);
          }
        });
      }

      this.providers.forEach((provider) => {
        try {
          provider.init(this.config);
        } catch (err) {
          if (debug) {
            console.warn(`[Analytics] Failed to initialize provider '${provider.name}':`, err);
          }
        }
      });

      this.initialized = true;
      if (debug) {
        console.log(
          `[Analytics] Privacy-first service initialized with ${this.providers.length} providers.`,
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

  public getFirstPartyProvider(): FirstPartyAnalyticsProvider {
    return this.firstPartyProvider;
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
