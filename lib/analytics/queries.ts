import { and, count, countDistinct, eq, gte, lte, sql } from "drizzle-orm";
import { getToolBySlug } from "@/data/tools";
import {
  daysBetweenInclusive,
  eachDay,
  formatDayLabel,
  resolveDateRange,
  type DateRange,
} from "@/lib/analytics/dates";
import { ensureAnalyticsSchema, getDb } from "@/lib/analytics/db";
import { toolUsage } from "@/lib/analytics/schema";
import { aggregateNamedCounts, classifyTrafficSource } from "@/lib/analytics/source";
import {
  formatZonedDay,
  formatZonedHour,
  formatZonedMonth,
  formatZonedWeek,
} from "@/lib/analytics/timezone";
import type {
  NamedCount,
  OverviewStats,
  TimeBucket,
  ToolDetailStats,
  ToolStatsRow,
} from "@/lib/analytics/types";

function bump(map: Map<string | number, number>, key: string | number) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function rangeFilter(range: DateRange) {
  return and(
    gte(toolUsage.timestamp, range.start),
    lte(toolUsage.timestamp, range.end),
    eq(toolUsage.eventType, "tool_usage"),
  );
}

export async function getOverviewStats(range: DateRange): Promise<OverviewStats> {
  await ensureAnalyticsSchema();
  const db = getDb();

  const today = resolveDateRange("today");
  const week = resolveDateRange("last_7_days");
  const month = resolveDateRange("last_30_days");

  const [totalRow] = await db
    .select({ value: count() })
    .from(toolUsage)
    .where(rangeFilter(range));

  const [todayRow] = await db
    .select({ value: count() })
    .from(toolUsage)
    .where(rangeFilter(today));

  const [weekRow] = await db
    .select({ value: count() })
    .from(toolUsage)
    .where(rangeFilter(week));

  const [monthRow] = await db
    .select({ value: count() })
    .from(toolUsage)
    .where(rangeFilter(month));

  const [uniqueRow] = await db
    .select({ value: countDistinct(toolUsage.sessionId) })
    .from(toolUsage)
    .where(rangeFilter(range));

  const [successRow] = await db
    .select({ value: count() })
    .from(toolUsage)
    .where(and(rangeFilter(range), eq(toolUsage.success, true)));

  const totalUses = totalRow?.value ?? 0;
  const successUses = successRow?.value ?? 0;
  const dayCount = daysBetweenInclusive(range.start, range.end);

  return {
    totalUses,
    usesToday: todayRow?.value ?? 0,
    usesThisWeek: weekRow?.value ?? 0,
    usesThisMonth: monthRow?.value ?? 0,
    uniqueVisitors: uniqueRow?.value ?? 0,
    averageDailyUses: Math.round((totalUses / dayCount) * 10) / 10,
    successRate: totalUses === 0 ? 100 : Math.round((successUses / totalUses) * 1000) / 10,
  };
}

export async function getPerToolStats(
  range: DateRange,
  search?: string,
): Promise<ToolStatsRow[]> {
  await ensureAnalyticsSchema();
  const db = getDb();

  const today = resolveDateRange("today");
  const week = resolveDateRange("last_7_days");
  const month = resolveDateRange("last_30_days");

  const rows = await db
    .select({
      toolId: toolUsage.toolId,
      toolName: toolUsage.toolName,
      total: count(),
    })
    .from(toolUsage)
    .where(rangeFilter({ ...range, start: new Date(0), end: range.end }))
    .groupBy(toolUsage.toolId, toolUsage.toolName);

  const todayRows = await db
    .select({ toolId: toolUsage.toolId, value: count() })
    .from(toolUsage)
    .where(rangeFilter(today))
    .groupBy(toolUsage.toolId);

  const weekRows = await db
    .select({ toolId: toolUsage.toolId, value: count() })
    .from(toolUsage)
    .where(rangeFilter(week))
    .groupBy(toolUsage.toolId);

  const monthRows = await db
    .select({ toolId: toolUsage.toolId, value: count() })
    .from(toolUsage)
    .where(rangeFilter(month))
    .groupBy(toolUsage.toolId);

  const todayMap = new Map(todayRows.map((r) => [r.toolId, r.value]));
  const weekMap = new Map(weekRows.map((r) => [r.toolId, r.value]));
  const monthMap = new Map(monthRows.map((r) => [r.toolId, r.value]));

  let result: ToolStatsRow[] = rows.map((row) => ({
    toolId: row.toolId,
    toolName: getToolBySlug(row.toolId)?.name || row.toolName,
    today: todayMap.get(row.toolId) ?? 0,
    last7Days: weekMap.get(row.toolId) ?? 0,
    last30Days: monthMap.get(row.toolId) ?? 0,
    total: row.total,
  }));

  if (search?.trim()) {
    const q = search.trim().toLowerCase();
    result = result.filter(
      (row) =>
        row.toolName.toLowerCase().includes(q) ||
        row.toolId.toLowerCase().includes(q),
    );
  }

  result.sort((a, b) => b.total - a.total || a.toolName.localeCompare(b.toolName));
  return result;
}

export async function getDailyUsage(range: DateRange): Promise<TimeBucket[]> {
  await ensureAnalyticsSchema();
  const db = getDb();

  const rows = await db
    .select({ timestamp: toolUsage.timestamp })
    .from(toolUsage)
    .where(rangeFilter(range));

  const map = new Map<string, number>();
  for (const row of rows) {
    if (!row.timestamp) continue;
    bump(map, formatZonedDay(row.timestamp));
  }

  return eachDay(range.start, range.end).map((day) => {
    const label = formatDayLabel(day);
    return { label, count: map.get(label) ?? 0 };
  });
}

export async function getHourlyUsage(range: DateRange): Promise<TimeBucket[]> {
  await ensureAnalyticsSchema();
  const db = getDb();

  const rows = await db
    .select({ timestamp: toolUsage.timestamp })
    .from(toolUsage)
    .where(rangeFilter(range));

  const map = new Map<number, number>();
  for (const row of rows) {
    if (!row.timestamp) continue;
    bump(map, formatZonedHour(row.timestamp));
  }

  return Array.from({ length: 24 }, (_, hour) => ({
    label: `${String(hour).padStart(2, "0")}:00`,
    count: map.get(hour) ?? 0,
  }));
}

export async function getTopTools(
  range: DateRange,
  limit = 10,
): Promise<NamedCount[]> {
  await ensureAnalyticsSchema();
  const db = getDb();

  const rows = await db
    .select({
      toolId: toolUsage.toolId,
      toolName: toolUsage.toolName,
      value: count(),
    })
    .from(toolUsage)
    .where(rangeFilter(range))
    .groupBy(toolUsage.toolId, toolUsage.toolName)
    .orderBy(sql`count(*) desc`)
    .limit(limit);

  return rows.map((r) => ({
    name: getToolBySlug(r.toolId)?.shortName || r.toolName,
    count: r.value,
  }));
}

async function getNamedBreakdown(
  range: DateRange,
  column: "device" | "browser" | "country" | "os",
  limit = 12,
  toolId?: string,
): Promise<NamedCount[]> {
  await ensureAnalyticsSchema();
  const db = getDb();
  const col = toolUsage[column];

  const filters = [rangeFilter(range)];
  if (toolId) filters.push(eq(toolUsage.toolId, toolId));

  const rows = await db
    .select({
      name: col,
      value: count(),
    })
    .from(toolUsage)
    .where(and(...filters))
    .groupBy(col)
    .orderBy(sql`count(*) desc`)
    .limit(limit);

  return rows.map((r) => ({
    name: r.name || "Unknown",
    count: r.value,
  }));
}

export function getDeviceDistribution(range: DateRange, toolId?: string) {
  return getNamedBreakdown(range, "device", 8, toolId);
}

export function getBrowserDistribution(range: DateRange, toolId?: string) {
  return getNamedBreakdown(range, "browser", 10, toolId);
}

export async function getSourceDistribution(
  range: DateRange,
  toolId?: string,
  limit = 12,
): Promise<NamedCount[]> {
  await ensureAnalyticsSchema();
  const db = getDb();
  const filters = [rangeFilter(range)];
  if (toolId) filters.push(eq(toolUsage.toolId, toolId));

  const rows = await db
    .select({
      referrer: toolUsage.referrer,
      value: count(),
    })
    .from(toolUsage)
    .where(and(...filters))
    .groupBy(toolUsage.referrer);

  return aggregateNamedCounts(
    rows.map((row) => ({
      name: classifyTrafficSource(row.referrer),
      count: row.value,
    })),
    limit,
  );
}

export async function getToolDetail(
  toolId: string,
  range: DateRange,
): Promise<ToolDetailStats | null> {
  await ensureAnalyticsSchema();
  const tool = getToolBySlug(toolId);
  if (!tool) return null;

  const db = getDb();
  const toolFilter = and(rangeFilter(range), eq(toolUsage.toolId, toolId));

  const [totalRow] = await db
    .select({ value: count() })
    .from(toolUsage)
    .where(toolFilter);

  const [successRow] = await db
    .select({ value: count() })
    .from(toolUsage)
    .where(and(toolFilter, eq(toolUsage.success, true)));

  const total = totalRow?.value ?? 0;
  const successUses = successRow?.value ?? 0;

  const stampRows = await db
    .select({ timestamp: toolUsage.timestamp })
    .from(toolUsage)
    .where(toolFilter);

  const dailyMap = new Map<string, number>();
  const weeklyMap = new Map<string, number>();
  const monthlyMap = new Map<string, number>();
  for (const row of stampRows) {
    if (!row.timestamp) continue;
    bump(dailyMap, formatZonedDay(row.timestamp));
    bump(weeklyMap, formatZonedWeek(row.timestamp));
    bump(monthlyMap, formatZonedMonth(row.timestamp));
  }

  const daily = eachDay(range.start, range.end).map((day) => {
    const label = formatDayLabel(day);
    return { label, count: dailyMap.get(label) ?? 0 };
  });

  const weekly = [...weeklyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, count]) => ({ label, count }));
  const monthly = [...monthlyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, count]) => ({ label, count }));

  const [countries, devices, browsers, sources] = await Promise.all([
    getNamedBreakdown(range, "country", 10, toolId),
    getDeviceDistribution(range, toolId),
    getBrowserDistribution(range, toolId),
    getSourceDistribution(range, toolId),
  ]);

  return {
    toolId,
    toolName: tool.name,
    total,
    successRate: total === 0 ? 100 : Math.round((successUses / total) * 1000) / 10,
    daily,
    weekly,
    monthly,
    countries,
    devices,
    browsers,
    sources,
  };
}

export async function getExportRows(range: DateRange, toolId?: string) {
  await ensureAnalyticsSchema();
  const db = getDb();
  const filters = [rangeFilter(range)];
  if (toolId) filters.push(eq(toolUsage.toolId, toolId));

  return db
    .select({
      toolId: toolUsage.toolId,
      toolName: toolUsage.toolName,
      timestamp: toolUsage.timestamp,
      sessionId: toolUsage.sessionId,
      country: toolUsage.country,
      browser: toolUsage.browser,
      os: toolUsage.os,
      device: toolUsage.device,
      referrer: toolUsage.referrer,
      success: toolUsage.success,
    })
    .from(toolUsage)
    .where(and(...filters))
    .orderBy(sql`${toolUsage.timestamp} desc`)
    .limit(50_000);
}
