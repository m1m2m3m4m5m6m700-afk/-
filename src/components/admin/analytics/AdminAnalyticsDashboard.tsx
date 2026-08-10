import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Users,
  Search,
  Wrench,
  Radio,
  RefreshCw,
  Clock,
  Inbox,
  Eye,
  FolderTree,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "./StatCard";
import { TrafficChart } from "./TrafficChart";
import { BreakdownList } from "./BreakdownList";
import { SearchTrendsCard } from "./SearchTrendsCard";
import { RecentActivityFeed } from "./RecentActivityFeed";
import { getAnalytics, type AnalyticsData, type AnalyticsRecentEvent } from "@/lib/analytics";
import type {
  TimeframeOption,
  ChartDataPoint,
  BreakdownItem,
  SearchTrend,
  ActivityEvent,
} from "./types";

function toBreakdownItems(entries: Record<string, number>, category?: string): BreakdownItem[] {
  const pairs = Object.entries(entries).sort((a, b) => b[1] - a[1]);
  const total = pairs.reduce((sum, [, count]) => sum + count, 0);

  return pairs.map(([name, count]) => ({
    id: name,
    name,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    category,
  }));
}

function toActivityEvents(events: AnalyticsRecentEvent[]): ActivityEvent[] {
  return events.map((event) => ({
    id: event.id,
    type: event.type,
    title: event.title,
    detail: event.detail,
    country: "Local",
    flag: "🧭",
    device: "This browser",
    timestamp: event.createdAt,
  }));
}

function createAggregateChartData(analyticsData: AnalyticsData): ChartDataPoint[] {
  const pageViews = Object.values(analyticsData.pageViews).reduce((sum, count) => sum + count, 0);
  const uniqueVisitors = Object.keys(analyticsData.landingPages).length;
  const searches = Object.values(analyticsData.searchedKeywords).reduce(
    (sum, count) => sum + count,
    0,
  );
  const toolInteractions = Object.values(analyticsData.openedTools).reduce(
    (sum, count) => sum + count,
    0,
  );

  return [
    {
      timestamp: "Current",
      pageViews,
      uniqueVisitors,
      searches,
      toolInteractions,
    },
  ];
}

export function AdminAnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState<TimeframeOption>("all");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(() => getAnalytics());

  const handleRefresh = () => {
    setAnalyticsData(getAnalytics());
    setLastUpdated(new Date());
  };

  const totalPageViews = useMemo(
    () => Object.values(analyticsData.pageViews || {}).reduce((sum, count) => sum + count, 0),
    [analyticsData.pageViews],
  );
  const totalSearches = useMemo(
    () =>
      Object.values(analyticsData.searchedKeywords || {}).reduce((sum, count) => sum + count, 0),
    [analyticsData.searchedKeywords],
  );
  const totalToolOpens = useMemo(
    () => Object.values(analyticsData.openedTools || {}).reduce((sum, count) => sum + count, 0),
    [analyticsData.openedTools],
  );
  const totalLandingEntries = useMemo(
    () => Object.values(analyticsData.landingPages || {}).reduce((sum, count) => sum + count, 0),
    [analyticsData.landingPages],
  );

  const openedToolsList = useMemo(
    () => toBreakdownItems(analyticsData.openedTools || {}, "Tool"),
    [analyticsData.openedTools],
  );
  const searchedKeywordsList = useMemo(
    () => toBreakdownItems(analyticsData.searchedKeywords || {}, "Search"),
    [analyticsData.searchedKeywords],
  );
  const topVisitedPagesList = useMemo(
    () => toBreakdownItems(analyticsData.pageViews || {}, "Page"),
    [analyticsData.pageViews],
  );
  const landingPagesList = useMemo(
    () => toBreakdownItems(analyticsData.landingPages || {}, "Landing Page"),
    [analyticsData.landingPages],
  );
  const exitPagesList = useMemo(
    () => toBreakdownItems(analyticsData.exitPages || {}, "Exit Page"),
    [analyticsData.exitPages],
  );
  const categoryMetricsList = useMemo(
    () => toBreakdownItems(analyticsData.visitedCategories || {}, "Category"),
    [analyticsData.visitedCategories],
  );

  const searchTrendsList: SearchTrend[] = useMemo(() => {
    const total = totalSearches;
    return Object.entries(analyticsData.searchedKeywords || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([query, count]) => ({
        query,
        count,
        growth: total > 0 ? `${Math.round((count / total) * 100)}% share` : "0% share",
        category: "Search query",
      }));
  }, [analyticsData.searchedKeywords, totalSearches]);

  const activityEvents = useMemo(
    () => toActivityEvents(analyticsData.recentEvents || []),
    [analyticsData.recentEvents],
  );

  const aggregateChartData = useMemo(
    () => createAggregateChartData(analyticsData),
    [analyticsData],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg">
            <BarChart3 className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
              Admin Analytics & Visitor Intelligence
              <Badge
                variant="outline"
                className="text-xs font-bold border-primary/40 text-primary bg-primary/5"
              >
                Local Data Only
              </Badge>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
              <span>
                Only recorded browser analytics are shown. Demo and synthetic metrics are excluded.
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Clock className="size-3 text-primary" />
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-500 shadow-xs">
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
            <span>{activityEvents.length} recorded recent events</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="rounded-xl text-xs font-bold"
          >
            <RefreshCw className="me-1.5 size-3.5" />
            Refresh Data
          </Button>

          <Button asChild size="sm" className="rounded-xl text-xs font-bold">
            <Link to="/admin/inbox">
              <Inbox className="me-1.5 size-3.5" />
              Owner Inbox
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Page Views"
          value={totalPageViews.toLocaleString()}
          change={totalPageViews > 0 ? "Recorded" : "No data"}
          changeType={totalPageViews > 0 ? "up" : "neutral"}
          subtext="Captured in this browser"
          icon={<Users className="size-5" />}
          highlightColor="bg-blue-500/10 text-blue-500"
        />

        <StatCard
          title="Recorded Events"
          value={activityEvents.length.toLocaleString()}
          change={activityEvents.length > 0 ? "Recent activity" : "No activity"}
          changeType={activityEvents.length > 0 ? "up" : "neutral"}
          subtext="Recent analytics trail"
          badgeText="Realtime"
          icon={<Radio className="size-5 text-emerald-500" />}
          highlightColor="bg-emerald-500/10 text-emerald-500"
        />

        <StatCard
          title="Total Searches"
          value={totalSearches.toLocaleString()}
          change={totalSearches > 0 ? "Recorded" : "No data"}
          changeType={totalSearches > 0 ? "up" : "neutral"}
          subtext="Keyword queries logged"
          icon={<Search className="size-5" />}
          highlightColor="bg-amber-500/10 text-amber-500"
        />

        <StatCard
          title="Tool Openings"
          value={totalToolOpens.toLocaleString()}
          change={totalToolOpens > 0 ? "Recorded" : "No data"}
          changeType={totalToolOpens > 0 ? "up" : "neutral"}
          subtext="Tracked tool interactions"
          icon={<Wrench className="size-5" />}
          highlightColor="bg-purple-500/10 text-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <TrafficChart
            dailyData={aggregateChartData}
            weeklyData={aggregateChartData}
            monthlyData={aggregateChartData}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
          />
        </div>

        <div className="lg:col-span-4">
          <SearchTrendsCard trends={searchTrendsList} totalSearches={totalSearches} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BreakdownList
          title="Most Opened Tools"
          subtitle="Tracked tool interactions only"
          items={openedToolsList}
          icon={<Wrench className="size-4" />}
          valueBadgeLabel="opens"
        />

        <BreakdownList
          title="Most Searched Keywords"
          subtitle="Actual search terms from analytics"
          items={searchedKeywordsList}
          icon={<Search className="size-4" />}
          valueBadgeLabel="searches"
        />

        <BreakdownList
          title="Most Visited Pages"
          subtitle="Page view counts by route"
          items={topVisitedPagesList}
          icon={<Eye className="size-4" />}
          valueBadgeLabel="views"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BreakdownList
          title="Landing Pages"
          subtitle="First page reached in a session"
          items={landingPagesList}
          icon={<BarChart3 className="size-4" />}
          valueBadgeLabel="entries"
          showSearch={false}
        />

        <BreakdownList
          title="Visited Categories"
          subtitle="Category exploration activity"
          items={categoryMetricsList}
          icon={<FolderTree className="size-4" />}
          valueBadgeLabel="visits"
          showSearch={false}
        />

        <BreakdownList
          title="Exit Pages"
          subtitle="Last recorded page before unload"
          items={exitPagesList}
          icon={<LogOut className="size-4" />}
          valueBadgeLabel="exits"
          showSearch={false}
        />
      </div>

      <RecentActivityFeed initialEvents={activityEvents} />

      <div className="rounded-2xl border border-border/70 bg-surface/30 px-4 py-3 text-xs text-muted-foreground">
        Landing page entries recorded:{" "}
        <span className="font-semibold text-foreground">{totalLandingEntries}</span>
      </div>
    </div>
  );
}
