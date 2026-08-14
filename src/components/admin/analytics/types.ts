export type TimeframeOption = "24h" | "7d" | "30d" | "all";

export interface MetricCardData {
  title: string;
  value: string | number;
  change: string;
  changeType: "up" | "down" | "neutral";
  subtext: string;
  badge?: string;
}

export interface ChartDataPoint {
  timestamp: string;
  pageViews: number;
  uniqueVisitors: number;
  searches: number;
  toolInteractions: number;
}

export interface BreakdownItem {
  id: string;
  name: string;
  count: number;
  percentage: number;
  subtext?: string;
  icon?: string;
  category?: string;
}

export interface CountryMetric {
  code: string;
  name: string;
  flag: string;
  visitors: number;
  percentage: number;
}

export interface DeviceMetric {
  type: "desktop" | "mobile" | "tablet";
  label: string;
  count: number;
  percentage: number;
  iconName: string;
}

export interface BrowserMetric {
  name: string;
  count: number;
  percentage: number;
  iconName: string;
}

export interface SearchTrend {
  query: string;
  count: number;
  growth: string;
  category: string;
}

export interface ActivityEvent {
  id: string;
  type:
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
  title: string;
  detail: string;
  country: string;
  flag: string;
  device: string;
  timestamp: string;
}
