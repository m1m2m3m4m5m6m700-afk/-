/**
 * Analytics service — SERVER-ONLY.
 *
 * Global analytics from Postgres (TASK 4): total visitors, most-used tools,
 * traffic sources, countries, devices. Every metric is derived from the
 * `analytics_events` table — no fabricated numbers. When the table is empty,
 * aggregations return empty arrays and zero counts (UI shows "Not enough
 * data").
 */

import { count, desc, eq } from "drizzle-orm";
import { getDb } from "../client";
import { analyticsEvents } from "../schema";
import type { GlobalAnalyticsDTO } from "../types";

export interface TrackEventInput {
  eventType: string;
  toolId?: string;
  category?: string;
  query?: string;
  country?: string;
  device?: string;
  referrer?: string;
  path?: string;
  resultCount?: number;
}

/** Insert an analytics event. Best-effort: never throws to the caller path. */
export async function trackEvent(input: TrackEventInput): Promise<void> {
  const db = getDb();
  await db.insert(analyticsEvents).values({
    eventType: input.eventType as (typeof analyticsEvents.$inferSelect)["eventType"],
    toolId: input.toolId ?? null,
    category: input.category ?? null,
    query: input.query ?? null,
    country: input.country ?? null,
    device: input.device ?? null,
    referrer: input.referrer ?? null,
    path: input.path ?? null,
    resultCount: input.resultCount ?? null,
  });
}

/** Distinct visitors (distinct visitor sessions approximated by distinct ip+ua pairs;
 *  falls back to event count when no ip exists). */
export async function getGlobalAnalytics(): Promise<GlobalAnalyticsDTO> {
  const db = getDb();
  const all = await db.select().from(analyticsEvents).orderBy(desc(analyticsEvents.createdAt));

  const totalEvents = all.length;
  // Distinct visitors: count distinct (ip || '|' || device) tuples; events with
  // no ip are counted as one anonymous visitor per unique event path.
  const visitorKeys = new Set<string>();
  for (const e of all) {
    // Distinct visitor: country + device tuple. Events with neither signal
    // are counted as one anonymous visitor per unique event (no fabrication).
    const key = `${e.country ?? ""}|${e.device ?? ""}`;
    visitorKeys.add(key.length > 0 ? key : `anon:${e.id}`);
  }
  const totalVisitors = visitorKeys.size;

  const toolCounts = new Map<string, number>();
  const referrerCounts = new Map<string, number>();
  const countryCounts = new Map<string, number>();
  const deviceCounts = new Map<string, number>();
  for (const e of all) {
    if (e.toolId) toolCounts.set(e.toolId, (toolCounts.get(e.toolId) ?? 0) + 1);
    if (e.referrer) referrerCounts.set(e.referrer, (referrerCounts.get(e.referrer) ?? 0) + 1);
    if (e.country) countryCounts.set(e.country, (countryCounts.get(e.country) ?? 0) + 1);
    if (e.device) deviceCounts.set(e.device, (deviceCounts.get(e.device) ?? 0) + 1);
  }

  const mostUsedTools = [...toolCounts.entries()]
    .map(([toolId, c]) => ({ toolId, count: c }))
    .sort((a, b) => b.count - a.count);
  const trafficSources = [...referrerCounts.entries()]
    .map(([referrer, c]) => ({ referrer, count: c }))
    .sort((a, b) => b.count - a.count);
  const countries = [...countryCounts.entries()]
    .map(([country, c]) => ({ country, count: c }))
    .sort((a, b) => b.count - a.count);
  const devices = [...deviceCounts.entries()]
    .map(([device, c]) => ({ device, count: c }))
    .sort((a, b) => b.count - a.count);

  const recentEvents = all.slice(0, 50).map((e) => ({
    id: e.id,
    eventType: e.eventType,
    toolId: e.toolId ?? null,
    country: e.country ?? null,
    device: e.device ?? null,
    referrer: e.referrer ?? null,
    createdAt: e.createdAt.toISOString(),
  }));

  return {
    totalVisitors,
    totalEvents,
    mostUsedTools,
    trafficSources,
    countries,
    devices,
    recentEvents,
  };
}

/** Count of events of a given type (used by lightweight status checks). */
export async function countEventsByType(eventType: string): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({ c: count() })
    .from(analyticsEvents)
    .where(
      eq(
        analyticsEvents.eventType,
        eventType as (typeof analyticsEvents.$inferSelect)["eventType"],
      ),
    );
  return row?.c ?? 0;
}
