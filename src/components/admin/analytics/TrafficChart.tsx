import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { Calendar, Layers, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChartDataPoint, TimeframeOption } from "./types";

interface TrafficChartProps {
  dailyData: ChartDataPoint[];
  weeklyData: ChartDataPoint[];
  monthlyData: ChartDataPoint[];
  timeframe: TimeframeOption;
  onTimeframeChange: (tf: TimeframeOption) => void;
}

export function TrafficChart({
  dailyData,
  weeklyData,
  monthlyData,
  timeframe,
  onTimeframeChange,
}: TrafficChartProps) {
  const [metricMode, setMetricMode] = useState<"all" | "traffic" | "events">("all");

  const activeData =
    timeframe === "24h"
      ? dailyData
      : timeframe === "7d"
        ? weeklyData
        : timeframe === "30d"
          ? monthlyData
          : monthlyData;

  return (
    <div className="rounded-3xl border border-border/80 bg-card/60 p-5 backdrop-blur-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            Traffic & Event Overview
          </h3>
          <p className="text-xs text-muted-foreground">
            {timeframe === "24h" && "Hourly distribution over the last 24 hours"}
            {timeframe === "7d" && "Daily traffic trend over the last 7 days"}
            {timeframe === "30d" && "Daily visitor count over the last 30 days"}
            {timeframe === "all" && "All-time historical traffic overview"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Filter */}
          <div className="flex items-center gap-1 rounded-xl bg-surface p-1 border border-border/60 text-xs">
            <button
              onClick={() => setMetricMode("all")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                metricMode === "all"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Metrics
            </button>
            <button
              onClick={() => setMetricMode("traffic")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                metricMode === "traffic"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Traffic Only
            </button>
            <button
              onClick={() => setMetricMode("events")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                metricMode === "events"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Interactions
            </button>
          </div>

          {/* Timeframe Switcher */}
          <div className="flex items-center gap-1 rounded-xl bg-surface p-1 border border-border/60 text-xs">
            {(["24h", "7d", "30d", "all"] as TimeframeOption[]).map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  timeframe === tf
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-card hover:text-foreground"
                }`}
              >
                {tf === "24h" ? "Daily" : tf === "7d" ? "Weekly" : tf === "30d" ? "Monthly" : "All"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={activeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary, #3b82f6)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-primary, #3b82f6)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSearches" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorInteractions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickLine={false}
              axisLine={{ stroke: "rgba(128,128,128,0.2)" }}
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground, #888)" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground, #888)" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card, #1f2937)",
                borderColor: "rgba(128,128,128,0.2)",
                borderRadius: "16px",
                fontSize: "12px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
              }}
              itemStyle={{ fontSize: "12px" }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />

            {(metricMode === "all" || metricMode === "traffic") && (
              <>
                <Area
                  type="monotone"
                  dataKey="pageViews"
                  name="Page Views"
                  stroke="var(--color-primary, #3b82f6)"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorPageViews)"
                />
                <Area
                  type="monotone"
                  dataKey="uniqueVisitors"
                  name="Unique Visitors"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorVisitors)"
                />
              </>
            )}

            {(metricMode === "all" || metricMode === "events") && (
              <>
                <Area
                  type="monotone"
                  dataKey="searches"
                  name="Searches"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSearches)"
                />
                <Area
                  type="monotone"
                  dataKey="toolInteractions"
                  name="Tool Usage"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorInteractions)"
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
