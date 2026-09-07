import { and, avg, count, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { ensureAnalyticsSchema, getDb } from "@/lib/analytics/db";
import {
  toolComments,
  toolRatingBases,
  toolRatings,
} from "@/lib/analytics/schema";
import type { PublicToolRating } from "@/lib/ratings/types";

export type { PublicToolRating };

const BASE_COUNT_MIN = 115;
const BASE_COUNT_MAX = 2541;
const BASE_COUNT_SPAN = BASE_COUNT_MAX - BASE_COUNT_MIN + 1;

function slugHash(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Stable pseudo-random base in 115–2541 for a tool slug. */
export function defaultRatingBaseCount(toolSlug: string): number {
  return BASE_COUNT_MIN + (slugHash(toolSlug) % BASE_COUNT_SPAN);
}

/** Fallback average when a tool has no real ratings yet (4.5–4.9). */
function defaultPublicAverage(toolSlug: string): number {
  return Math.round((4.5 + (slugHash(`${toolSlug}:avg`) % 5) / 10) * 10) / 10;
}

export async function getOrCreateRatingBaseCount(
  toolSlug: string,
): Promise<number> {
  await ensureAnalyticsSchema();
  const db = getDb();
  const [existing] = await db
    .select({ baseCount: toolRatingBases.baseCount })
    .from(toolRatingBases)
    .where(eq(toolRatingBases.toolId, toolSlug))
    .limit(1);
  if (existing) return existing.baseCount;

  const baseCount = defaultRatingBaseCount(toolSlug);
  try {
    await db.insert(toolRatingBases).values({
      toolId: toolSlug,
      baseCount,
      updatedAt: new Date(),
    });
  } catch {
    const [again] = await db
      .select({ baseCount: toolRatingBases.baseCount })
      .from(toolRatingBases)
      .where(eq(toolRatingBases.toolId, toolSlug))
      .limit(1);
    if (again) return again.baseCount;
  }
  return baseCount;
}

const EMPTY_STARS: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
};

/**
 * Public aggregate for a tool page.
 * Display count = base (115–2541 seed) + any historical tool_ratings.
 * Average uses historical ratings + comment stars when available.
 */
export async function getPublicToolRating(
  toolSlug: string,
): Promise<PublicToolRating> {
  await ensureAnalyticsSchema();
  const db = getDb();
  const baseCount = await getOrCreateRatingBaseCount(toolSlug);

  const [ratingAgg] = await db
    .select({
      count: count(),
      average: avg(toolRatings.stars),
      star1: sql<number>`sum(case when ${toolRatings.stars} = 1 then 1 else 0 end)`,
      star2: sql<number>`sum(case when ${toolRatings.stars} = 2 then 1 else 0 end)`,
      star3: sql<number>`sum(case when ${toolRatings.stars} = 3 then 1 else 0 end)`,
      star4: sql<number>`sum(case when ${toolRatings.stars} = 4 then 1 else 0 end)`,
      star5: sql<number>`sum(case when ${toolRatings.stars} = 5 then 1 else 0 end)`,
    })
    .from(toolRatings)
    .where(eq(toolRatings.toolId, toolSlug));

  const [commentAgg] = await db
    .select({
      count: count(),
      average: avg(toolComments.rating),
      star1: sql<number>`sum(case when ${toolComments.rating} = 1 then 1 else 0 end)`,
      star2: sql<number>`sum(case when ${toolComments.rating} = 2 then 1 else 0 end)`,
      star3: sql<number>`sum(case when ${toolComments.rating} = 3 then 1 else 0 end)`,
      star4: sql<number>`sum(case when ${toolComments.rating} = 4 then 1 else 0 end)`,
      star5: sql<number>`sum(case when ${toolComments.rating} = 5 then 1 else 0 end)`,
    })
    .from(toolComments)
    .where(
      and(
        eq(toolComments.toolId, toolSlug),
        isNull(toolComments.parentId),
        isNotNull(toolComments.rating),
        sql`${toolComments.name} != '__seed_empty__'`,
      ),
    );

  const liveCount = Number(ratingAgg?.count) || 0;
  const commentCount = Number(commentAgg?.count) || 0;
  const sampleCount = liveCount + commentCount;
  const displayCount = baseCount + liveCount;

  if (sampleCount === 0) {
    return {
      toolSlug,
      average: defaultPublicAverage(toolSlug),
      count: displayCount,
      baseCount,
      liveCount,
      stars: { ...EMPTY_STARS },
    };
  }

  const ratingSum =
    liveCount * (Number(ratingAgg?.average) || 0) +
    commentCount * (Number(commentAgg?.average) || 0);
  const average = Math.round((ratingSum / sampleCount) * 10) / 10;

  return {
    toolSlug,
    average,
    count: displayCount,
    baseCount,
    liveCount,
    stars: {
      1: (Number(ratingAgg?.star1) || 0) + (Number(commentAgg?.star1) || 0),
      2: (Number(ratingAgg?.star2) || 0) + (Number(commentAgg?.star2) || 0),
      3: (Number(ratingAgg?.star3) || 0) + (Number(commentAgg?.star3) || 0),
      4: (Number(ratingAgg?.star4) || 0) + (Number(commentAgg?.star4) || 0),
      5: (Number(ratingAgg?.star5) || 0) + (Number(commentAgg?.star5) || 0),
    },
  };
}
