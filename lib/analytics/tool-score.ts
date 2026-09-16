/**
 * Ranking score for public “Top tools” listings (last 30 days).
 *
 * score = unique_users * 0.7 + total_uses * 0.2 + returning_users * 0.1
 *
 * unique_users: distinct analytics session IDs (persistent per browser)
 * total_uses: tool_usage events
 * returning_users: unique sessions that used the same tool more than once
 */
export const TOP_TOOL_SCORE_WEIGHTS = {
  uniqueUsers: 0.7,
  totalUses: 0.2,
  returningUsers: 0.1,
} as const;

/**
 * Ranking score for public “Trending” listings (last 7 days).
 *
 * score = (unique_users * 0.6 + total_uses * 0.2 + returning_users * 0.2)
 *       * (1 / (1 + days_since_last_use * 0.15))
 */
export const TRENDING_TOOL_SCORE_WEIGHTS = {
  uniqueUsers: 0.6,
  totalUses: 0.2,
  returningUsers: 0.2,
} as const;

export const TRENDING_FRESHNESS_PER_DAY = 0.15;
const MS_PER_DAY = 86_400_000;

/**
 * Ranking score for public “All Time Best” listings (no date filter).
 *
 * score = unique_users * 0.6 + total_uses * 0.25 + returning_users * 0.15
 */
export const ALL_TIME_BEST_SCORE_WEIGHTS = {
  uniqueUsers: 0.6,
  totalUses: 0.25,
  returningUsers: 0.15,
} as const;

export type ToolUsageScoreInput = {
  uniqueUsers: number;
  totalUses: number;
  returningUsers: number;
};

export type TrendingScoreInput = ToolUsageScoreInput & {
  lastUsedMs: number;
};

export function scoreToolUsage({
  uniqueUsers,
  totalUses,
  returningUsers,
}: ToolUsageScoreInput): number {
  return (
    uniqueUsers * TOP_TOOL_SCORE_WEIGHTS.uniqueUsers +
    totalUses * TOP_TOOL_SCORE_WEIGHTS.totalUses +
    returningUsers * TOP_TOOL_SCORE_WEIGHTS.returningUsers
  );
}

export function trendingFreshness(
  lastUsedMs: number,
  nowMs = Date.now(),
): number {
  const daysSince = Math.max(0, (nowMs - lastUsedMs) / MS_PER_DAY);
  return 1 / (1 + daysSince * TRENDING_FRESHNESS_PER_DAY);
}

export function scoreTrendingTool(
  input: TrendingScoreInput,
  nowMs = Date.now(),
): number {
  const base =
    input.uniqueUsers * TRENDING_TOOL_SCORE_WEIGHTS.uniqueUsers +
    input.totalUses * TRENDING_TOOL_SCORE_WEIGHTS.totalUses +
    input.returningUsers * TRENDING_TOOL_SCORE_WEIGHTS.returningUsers;
  return base * trendingFreshness(input.lastUsedMs, nowMs);
}

export function scoreAllTimeBestTool({
  uniqueUsers,
  totalUses,
  returningUsers,
}: ToolUsageScoreInput): number {
  return (
    uniqueUsers * ALL_TIME_BEST_SCORE_WEIGHTS.uniqueUsers +
    totalUses * ALL_TIME_BEST_SCORE_WEIGHTS.totalUses +
    returningUsers * ALL_TIME_BEST_SCORE_WEIGHTS.returningUsers
  );
}

export type RankableTool<T> = ToolUsageScoreInput & {
  item: T;
  toolId: string;
  curatedIndex: number;
};

export function compareToolRanking<T>(
  a: RankableTool<T>,
  b: RankableTool<T>,
): number {
  const scoreDiff = scoreToolUsage(b) - scoreToolUsage(a);
  if (scoreDiff !== 0) return scoreDiff;
  if (b.uniqueUsers !== a.uniqueUsers) return b.uniqueUsers - a.uniqueUsers;
  if (b.totalUses !== a.totalUses) return b.totalUses - a.totalUses;
  if (a.curatedIndex !== b.curatedIndex) return a.curatedIndex - b.curatedIndex;
  return a.toolId.localeCompare(b.toolId);
}
