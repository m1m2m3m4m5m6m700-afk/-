import { useEffect, createContext, useContext, type ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";
import { analytics } from "./analyticsService";
import type { AnalyticsEventParams } from "./types";

interface AnalyticsContextValue {
  trackPageView: (path: string, title?: string) => void;
  trackSearch: (query: string, resultCount?: number, category?: string) => void;
  trackToolClick: (toolId: string, toolName?: string, category?: string) => void;
  trackCategoryClick: (categoryId: string, categoryName?: string) => void;
  trackExternalLinkClick: (url: string, label?: string) => void;
  trackCopy: (contentType: string, textLength?: number, toolId?: string) => void;
  trackDownload: (fileName: string, fileType?: string, toolId?: string) => void;
  trackEvent: (eventName: string, params?: AnalyticsEventParams) => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue>({
  trackPageView: (path, title) => analytics.trackPageView(path, title),
  trackSearch: (query, count, cat) => analytics.trackSearch(query, count, cat),
  trackToolClick: (id, name, cat) => analytics.trackToolClick(id, name, cat),
  trackCategoryClick: (id, name) => analytics.trackCategoryClick(id, name),
  trackExternalLinkClick: (url, label) => analytics.trackExternalLinkClick(url, label),
  trackCopy: (type, len, toolId) => analytics.trackCopy(type, len, toolId),
  trackDownload: (file, ext, toolId) => analytics.trackDownload(file, ext, toolId),
  trackEvent: (name, params) => analytics.trackEvent(name, params),
});

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const location = useLocation();

  // Initialize analytics lazily on mount
  useEffect(() => {
    analytics.init();
  }, []);

  // Track page views on location change
  useEffect(() => {
    if (location.pathname) {
      analytics.trackPageView(location.pathname);
    }
  }, [location.pathname]);

  // Global listener for external link clicks
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      const isExternal =
        href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//");

      if (isExternal && !href.includes(window.location.hostname)) {
        analytics.trackExternalLinkClick(href, target.textContent?.trim() || href);
      }
    };

    document.addEventListener("click", handleGlobalClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleGlobalClick, { capture: true });
    };
  }, []);

  const value: AnalyticsContextValue = {
    trackPageView: (path, title) => analytics.trackPageView(path, title),
    trackSearch: (query, count, cat) => analytics.trackSearch(query, count, cat),
    trackToolClick: (id, name, cat) => analytics.trackToolClick(id, name, cat),
    trackCategoryClick: (id, name) => analytics.trackCategoryClick(id, name),
    trackExternalLinkClick: (url, label) => analytics.trackExternalLinkClick(url, label),
    trackCopy: (type, len, toolId) => analytics.trackCopy(type, len, toolId),
    trackDownload: (file, ext, toolId) => analytics.trackDownload(file, ext, toolId),
    trackEvent: (name, params) => analytics.trackEvent(name, params),
  };

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics(): AnalyticsContextValue {
  return useContext(AnalyticsContext);
}
