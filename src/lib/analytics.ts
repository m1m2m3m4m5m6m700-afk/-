import { analytics } from "./analytics/analyticsService";
import type { AnalyticsData, AnalyticsEventParams } from "./analytics/types";

export * from "./analytics/types";
export * from "./analytics/analyticsService";
export * from "./analytics/providers/local";
export * from "./analytics/providers/firstParty";
export * from "./analytics/providers/custom";
export * from "./analytics/AnalyticsProvider";

// Direct helper functions for easy import everywhere
export function trackPageView(path: string, title?: string): void {
  analytics.trackPageView(path, title);
}

export function trackSearch(query: string, resultCount?: number, category?: string): void {
  analytics.trackSearch(query, resultCount, category);
}

export function trackToolClick(toolId: string, toolName?: string, category?: string): void {
  analytics.trackToolClick(toolId, toolName, category);
}

export function trackCategoryClick(categoryId: string, categoryName?: string): void {
  analytics.trackCategoryClick(categoryId, categoryName);
}

export function trackExternalLinkClick(url: string, label?: string): void {
  analytics.trackExternalLinkClick(url, label);
}

export function trackCopyAction(contentType: string, textLength?: number, toolId?: string): void {
  analytics.trackCopy(contentType, textLength, toolId);
}

export function trackDownloadAction(fileName: string, fileType?: string, toolId?: string): void {
  analytics.trackDownload(fileName, fileType, toolId);
}

export function trackEvent(eventName: string, params?: AnalyticsEventParams): void {
  analytics.trackEvent(eventName, params);
}

// Backwards-compatible local functions for existing components (e.g. AnalyticsDialog, ToolCard, etc.)
export function getAnalytics(): AnalyticsData {
  return analytics.getLocalProvider().getData();
}

export function clearAnalytics(): void {
  analytics.getLocalProvider().clearData();
}

export function trackCategoryVisit(categoryId: string, categoryName?: string): void {
  analytics.trackCategoryClick(categoryId, categoryName);
}

export function trackToolOpen(toolIdOrName: string, toolName?: string, category?: string): void {
  analytics.trackToolClick(toolIdOrName, toolName, category);
}

export function trackKeywordSearch(keyword: string, resultCount?: number): void {
  analytics.trackSearch(keyword, resultCount);
}

export function trackToolRequest(requestText: string): void {
  analytics.getLocalProvider().trackToolRequest(requestText);
  analytics.trackEvent("tool_request", { requestTextLength: requestText.trim().length });
}

export function trackExitPage(path: string): void {
  analytics.getLocalProvider().trackExitPage(path);
}
