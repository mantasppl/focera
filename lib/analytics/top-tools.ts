import { unstable_cache } from "next/cache";
import {
  getReadyTools,
  getToolBySlug,
  getTopTools,
  topToolSlugs,
  type Tool,
} from "@/data/tools";
import { resolveDateRange, type DateRange } from "@/lib/analytics/dates";
import { getToolRankingStats } from "@/lib/analytics/queries";
import { compareToolRanking, scoreAllTimeBestTool, scoreTrendingTool } from "@/lib/analytics/tool-score";
import type { ToolRankingStats } from "@/lib/analytics/types";

const UNCURATED_INDEX = Number.MAX_SAFE_INTEGER;
const TOP_TOOLS_REVALIDATE_SECONDS = 60 * 60;
const TRENDING_TOOLS_REVALIDATE_SECONDS = 15 * 60;
const MS_PER_DAY = 86_400_000;

function rollingRange(days: number): DateRange {
  const end = new Date();
  const start = new Date(end.getTime() - days * MS_PER_DAY);
  return {
    start,
    end,
    preset: days <= 7 ? "last_7_days" : "last_30_days",
  };
}

function curatedIndex(slug: string): number {
  const index = topToolSlugs.indexOf(slug);
  return index === -1 ? UNCURATED_INDEX : index;
}

export function rankReadyTools(
  stats: Pick<
    ToolRankingStats,
    "toolId" | "uniqueUsers" | "totalUses" | "returningUsers"
  >[],
  limit: number,
): Tool[] {
  const byId = new Map(stats.map((row) => [row.toolId, row]));

  return getReadyTools()
    .map((tool) => {
      const row = byId.get(tool.slug);
      return {
        item: tool,
        toolId: tool.slug,
        uniqueUsers: row?.uniqueUsers ?? 0,
        totalUses: row?.totalUses ?? 0,
        returningUsers: row?.returningUsers ?? 0,
        curatedIndex: curatedIndex(tool.slug),
      };
    })
    .sort(compareToolRanking)
    .slice(0, limit)
    .map((entry) => entry.item);
}

async function loadRankedTopToolSlugs(limit: number): Promise<string[]> {
  try {
    const stats = await getToolRankingStats(resolveDateRange("last_30_days"));
    return rankReadyTools(stats, limit).map((tool) => tool.slug);
  } catch (error) {
    console.error("[top-tools] failed to rank from analytics", error);
    return getTopTools(limit).map((tool) => tool.slug);
  }
}

const getCachedRankedTopToolSlugs = unstable_cache(
  loadRankedTopToolSlugs,
  ["ranked-top-tool-slugs-v2"],
  { revalidate: TOP_TOOLS_REVALIDATE_SECONDS, tags: ["top-tools"] },
);

export function rankTrendingTools(
  stats: Pick<
    ToolRankingStats,
    "toolId" | "uniqueUsers" | "totalUses" | "returningUsers" | "lastUsedMs"
  >[],
  limit: number,
  nowMs = Date.now(),
): Tool[] {
  const ready = new Map(getReadyTools().map((tool) => [tool.slug, tool]));

  return stats
    .filter((row) => row.totalUses > 0 && ready.has(row.toolId))
    .map((row) => {
      const lastUsedMs = row.lastUsedMs > 0 ? row.lastUsedMs : nowMs;
      return {
        tool: ready.get(row.toolId) as Tool,
        toolId: row.toolId,
        lastUsedMs,
        uniqueUsers: row.uniqueUsers,
        score: scoreTrendingTool(
          {
            uniqueUsers: row.uniqueUsers,
            totalUses: row.totalUses,
            returningUsers: row.returningUsers,
            lastUsedMs,
          },
          nowMs,
        ),
      };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.lastUsedMs - a.lastUsedMs ||
        b.uniqueUsers - a.uniqueUsers ||
        a.toolId.localeCompare(b.toolId),
    )
    .slice(0, limit)
    .map((entry) => entry.tool);
}

async function loadRankedTrendingToolSlugs(limit: number): Promise<string[]> {
  let stats = await getToolRankingStats(rollingRange(7));
  if (stats.length === 0) {
    stats = await getToolRankingStats(rollingRange(30));
  }
  return rankTrendingTools(stats, limit).map((tool) => tool.slug);
}

const getCachedRankedTrendingToolSlugs = unstable_cache(
  loadRankedTrendingToolSlugs,
  ["ranked-trending-tool-slugs-v3"],
  { revalidate: TRENDING_TOOLS_REVALIDATE_SECONDS, tags: ["top-tools"] },
);

export async function getRankedTrendingTools(limit = 5): Promise<Tool[]> {
  try {
    const slugs = await getCachedRankedTrendingToolSlugs(limit);
    const picked: Tool[] = [];
    const seen = new Set<string>();

    for (const slug of slugs) {
      const tool = getToolBySlug(slug);
      if (!tool || tool.status !== "ready" || seen.has(tool.slug)) continue;
      seen.add(tool.slug);
      picked.push(tool);
      if (picked.length >= limit) break;
    }

    return picked;
  } catch (error) {
    console.error("[trending-tools] failed to load ranked list", error);
    return [];
  }
}

export async function getRankedTopTools(limit = 5): Promise<Tool[]> {
  try {
    const slugs = await getCachedRankedTopToolSlugs(limit);
    const picked: Tool[] = [];
    const seen = new Set<string>();

    for (const slug of slugs) {
      const tool = getToolBySlug(slug);
      if (!tool || tool.status !== "ready" || seen.has(tool.slug)) continue;
      seen.add(tool.slug);
      picked.push(tool);
      if (picked.length >= limit) return picked;
    }

    for (const tool of getTopTools(limit)) {
      if (seen.has(tool.slug)) continue;
      seen.add(tool.slug);
      picked.push(tool);
      if (picked.length >= limit) break;
    }

    return picked;
  } catch (error) {
    console.error("[top-tools] falling back to curated list", error);
    return getTopTools(limit);
  }
}

export function rankAllTimeBestTools(
  stats: Pick<
    ToolRankingStats,
    "toolId" | "uniqueUsers" | "totalUses" | "returningUsers"
  >[],
  limit: number,
): Tool[] {
  const ready = new Map(getReadyTools().map((tool) => [tool.slug, tool]));

  return stats
    .filter((row) => row.totalUses > 0 && ready.has(row.toolId))
    .map((row) => ({
      tool: ready.get(row.toolId) as Tool,
      toolId: row.toolId,
      uniqueUsers: row.uniqueUsers,
      totalUses: row.totalUses,
      score: scoreAllTimeBestTool({
        uniqueUsers: row.uniqueUsers,
        totalUses: row.totalUses,
        returningUsers: row.returningUsers,
      }),
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.uniqueUsers - a.uniqueUsers ||
        b.totalUses - a.totalUses ||
        a.toolId.localeCompare(b.toolId),
    )
    .slice(0, limit)
    .map((entry) => entry.tool);
}

async function loadRankedAllTimeBestSlugs(limit: number): Promise<string[]> {
  const stats = await getToolRankingStats("all_time");
  const slugs = rankAllTimeBestTools(stats, limit).map((tool) => tool.slug);
  if (slugs.length > 0) return slugs;
  return getTopTools(limit).map((tool) => tool.slug);
}

const getCachedRankedAllTimeBestSlugs = unstable_cache(
  loadRankedAllTimeBestSlugs,
  ["ranked-all-time-best-slugs"],
  { revalidate: TOP_TOOLS_REVALIDATE_SECONDS, tags: ["top-tools"] },
);

export async function getRankedAllTimeBestTools(limit = 5): Promise<Tool[]> {
  try {
    const slugs = await getCachedRankedAllTimeBestSlugs(limit);
    const picked: Tool[] = [];
    const seen = new Set<string>();

    for (const slug of slugs) {
      const tool = getToolBySlug(slug);
      if (!tool || tool.status !== "ready" || seen.has(tool.slug)) continue;
      seen.add(tool.slug);
      picked.push(tool);
      if (picked.length >= limit) break;
    }

    if (picked.length > 0) return picked;
    return getTopTools(limit);
  } catch (error) {
    console.error("[all-time-best] falling back to curated list", error);
    return getTopTools(limit);
  }
}
