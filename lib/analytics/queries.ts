import { and, count, countDistinct, eq, gte, inArray, lt, lte, sql } from "drizzle-orm";
import { getToolBySlug } from "@/data/tools";
import { countryDisplayName } from "@/lib/analytics/countries";
import {
  daysBetweenInclusive,
  eachDay,
  formatDayLabel,
  resolveDateRange,
  type DateRange,
} from "@/lib/analytics/dates";
import { ensureAnalyticsSchema, getDb } from "@/lib/analytics/db";
import { keywordForPath, landingPathsForTool } from "@/lib/analytics/keywords";
import { pageViews, searchQueries, toolUsage } from "@/lib/analytics/schema";
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

  const [engagement, repeat] = await Promise.all([
    getEngagementStats(range),
    getRepeatUserStats(range),
  ]);

  return {
    totalUses,
    usesToday: todayRow?.value ?? 0,
    usesThisWeek: weekRow?.value ?? 0,
    usesThisMonth: monthRow?.value ?? 0,
    uniqueVisitors: uniqueRow?.value ?? 0,
    averageDailyUses: Math.round((totalUses / dayCount) * 10) / 10,
    successRate: totalUses === 0 ? 100 : Math.round((successUses / totalUses) * 1000) / 10,
    ...engagement,
    ...repeat,
  };
}

function parseFeature(metadata: string | null): {
  kind: string;
  seconds?: number;
} | null {
  if (!metadata) return null;
  try {
    const parsed = JSON.parse(metadata) as { kind?: unknown; seconds?: unknown };
    if (typeof parsed.kind !== "string") return null;
    return {
      kind: parsed.kind,
      seconds: typeof parsed.seconds === "number" ? parsed.seconds : undefined,
    };
  } catch {
    return null;
  }
}

async function getFeatureRows(range: DateRange, toolId?: string) {
  await ensureAnalyticsSchema();
  const db = getDb();
  const filters = [
    gte(toolUsage.timestamp, range.start),
    lte(toolUsage.timestamp, range.end),
    eq(toolUsage.eventType, "feature"),
  ];
  if (toolId) filters.push(eq(toolUsage.toolId, toolId));

  return db
    .select({
      sessionId: toolUsage.sessionId,
      metadata: toolUsage.metadata,
    })
    .from(toolUsage)
    .where(and(...filters));
}

export async function getEngagementStats(
  range: DateRange,
  toolId?: string,
): Promise<{
  conversionRate: number | null;
  uploads: number;
  downloads: number;
  avgTimeOnToolSeconds: number | null;
}> {
  const rows = await getFeatureRows(range, toolId);
  const uploadSessions = new Set<string>();
  const downloadSessions = new Set<string>();
  let dwellTotal = 0;
  let dwellCount = 0;

  for (const row of rows) {
    const feature = parseFeature(row.metadata);
    if (!feature) continue;
    if (feature.kind === "upload") uploadSessions.add(row.sessionId);
    if (feature.kind === "download") downloadSessions.add(row.sessionId);
    if (feature.kind === "dwell" && typeof feature.seconds === "number") {
      dwellTotal += feature.seconds;
      dwellCount += 1;
    }
  }

  let converted = 0;
  for (const session of uploadSessions) {
    if (downloadSessions.has(session)) converted += 1;
  }

  return {
    uploads: uploadSessions.size,
    downloads: downloadSessions.size,
    conversionRate:
      uploadSessions.size === 0
        ? null
        : Math.round((converted / uploadSessions.size) * 1000) / 10,
    avgTimeOnToolSeconds:
      dwellCount === 0 ? null : Math.round((dwellTotal / dwellCount) * 10) / 10,
  };
}

export async function getRepeatUserStats(
  range: DateRange,
  toolId?: string,
): Promise<{ repeatUsers: number; repeatRate: number }> {
  await ensureAnalyticsSchema();
  const db = getDb();

  const inRangeRows = await db
    .selectDistinct({ sessionId: toolUsage.sessionId })
    .from(toolUsage)
    .where(
      toolId
        ? and(rangeFilter(range), eq(toolUsage.toolId, toolId))
        : rangeFilter(range),
    );

  const inRange = [...new Set(inRangeRows.map((row) => row.sessionId))];
  if (inRange.length === 0) {
    return { repeatUsers: 0, repeatRate: 0 };
  }

  const prior = new Set<string>();
  const chunkSize = 400;
  for (let i = 0; i < inRange.length; i += chunkSize) {
    const chunk = inRange.slice(i, i + chunkSize);
    const priorUsageFilters = [
      lt(toolUsage.timestamp, range.start),
      inArray(toolUsage.sessionId, chunk),
    ];
    if (toolId) priorUsageFilters.push(eq(toolUsage.toolId, toolId));

    const [priorUsage, priorViews] = await Promise.all([
      db
        .selectDistinct({ sessionId: toolUsage.sessionId })
        .from(toolUsage)
        .where(and(...priorUsageFilters)),
      toolId
        ? Promise.resolve([] as Array<{ sessionId: string }>)
        : db
            .selectDistinct({ sessionId: pageViews.sessionId })
            .from(pageViews)
            .where(
              and(
                lt(pageViews.timestamp, range.start),
                inArray(pageViews.sessionId, chunk),
              ),
            ),
    ]);
    for (const row of priorUsage) prior.add(row.sessionId);
    for (const row of priorViews) prior.add(row.sessionId);
  }

  const repeatUsers = inRange.filter((id) => prior.has(id)).length;
  return {
    repeatUsers,
    repeatRate: Math.round((repeatUsers / inRange.length) * 1000) / 10,
  };
}

export async function getTopKeywords(
  range: DateRange,
  limit = 12,
  toolId?: string,
): Promise<NamedCount[]> {
  await ensureAnalyticsSchema();
  const db = getDb();

  const viewFilters = [
    gte(pageViews.timestamp, range.start),
    lte(pageViews.timestamp, range.end),
  ];
  if (toolId) {
    const paths = landingPathsForTool(toolId);
    if (paths.length === 0) return [];
    viewFilters.push(inArray(pageViews.path, paths));
  }

  const viewRows = await db
    .select({
      path: pageViews.path,
      value: count(),
    })
    .from(pageViews)
    .where(and(...viewFilters))
    .groupBy(pageViews.path);

  const mapped: Array<{ name: string; count: number }> = [];

  if (!toolId) {
    const searchRows = await db
      .select({
        name: searchQueries.query,
        value: count(),
      })
      .from(searchQueries)
      .where(
        and(
          gte(searchQueries.timestamp, range.start),
          lte(searchQueries.timestamp, range.end),
        ),
      )
      .groupBy(searchQueries.query);

    for (const row of searchRows) {
      mapped.push({ name: row.name, count: row.value });
    }
  }

  for (const row of viewRows) {
    const keyword = keywordForPath(row.path);
    if (!keyword) continue;
    mapped.push({ name: keyword, count: row.value });
  }

  return aggregateNamedCounts(mapped, limit);
}

export function getCountryDistribution(range: DateRange, toolId?: string) {
  return getNamedBreakdown(range, "country", 12, toolId);
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

  const items = rows.map((r) => ({
    name:
      column === "country" ? countryDisplayName(r.name) : r.name || "Unknown",
    count: r.value,
  }));
  return column === "country" ? aggregateNamedCounts(items, limit) : items;
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

  const [countries, devices, browsers, sources, keywords, engagement, repeat] =
    await Promise.all([
      getNamedBreakdown(range, "country", 10, toolId),
      getDeviceDistribution(range, toolId),
      getBrowserDistribution(range, toolId),
      getSourceDistribution(range, toolId),
      getTopKeywords(range, 10, toolId),
      getEngagementStats(range, toolId),
      getRepeatUserStats(range, toolId),
    ]);

  return {
    toolId,
    toolName: tool.name,
    total,
    successRate: total === 0 ? 100 : Math.round((successUses / total) * 1000) / 10,
    ...engagement,
    ...repeat,
    daily,
    weekly,
    monthly,
    countries,
    devices,
    browsers,
    sources,
    keywords,
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
