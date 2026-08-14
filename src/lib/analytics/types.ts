export interface AnalyticsEventParams {
  [key: string]: string | number | boolean | undefined | null;
}

export interface AnalyticsConfig {
  enabled: boolean;
  debug?: boolean;
  /** First-party analytics is the only automatically registered provider. */
  firstPartyEnabled?: boolean;
  /** Legacy provider config retained only for custom-provider compatibility. */
  gaMeasurementId?: string;
  clarityProjectId?: string;
  customProviders?: AnalyticsProviderInterface[];
}

export interface AnalyticsProviderInterface {
  name: string;
  init(config: AnalyticsConfig): void | Promise<void>;
  trackPageView?(path: string, title?: string): void;
  trackSearch?(query: string, resultCount?: number, category?: string): void;
  trackToolClick?(toolId: string, toolName?: string, category?: string): void;
  trackCategoryClick?(categoryId: string, categoryName?: string): void;
  trackExternalLinkClick?(url: string, label?: string): void;
  trackCopy?(contentType: string, textLength?: number, toolId?: string): void;
  trackDownload?(fileName: string, fileType?: string, toolId?: string): void;
  trackEvent?(eventName: string, params?: AnalyticsEventParams): void;
}

export type AnalyticsRecentEventType =
  | "page_view"
  | "search"
  | "tool_click"
  | "category_click"
  | "download"
  | "copy"
  | "external_link"
  | "session_start"
  | "session_end"
  | "tool_start"
  | "tool_complete"
  | "navigation"
  | "survey_response";

export interface AnalyticsRecentEvent {
  id: string;
  type: AnalyticsRecentEventType;
  title: string;
  detail: string;
  createdAt: string;
}

export interface AnalyticsData {
  visitedCategories: Record<string, number>;
  openedTools: Record<string, number>;
  searchedKeywords: Record<string, number>;
  requestedTools: Record<string, number>;
  pageViews: Record<string, number>;
  landingPages: Record<string, number>;
  exitPages: Record<string, number>;
  recentEvents: AnalyticsRecentEvent[];
}

export type FirstPartyAnalyticsEvent = {
  type:
    | "page_view"
    | "search"
    | "tool_click"
    | "category_click"
    | "download"
    | "copy"
    | "external_link_click"
    | "session_start"
    | "session_end"
    | "tool_start"
    | "tool_complete"
    | "navigation"
    | "survey_response";
  sessionId: string;
  locale?: string;
  intentId?: string;
  toolId?: string;
  category?: string;
  queryHash?: string;
  referrerOrigin?: string;
  path?: string;
  previousPath?: string;
  durationMs?: number;
  resultCount?: number;
};
