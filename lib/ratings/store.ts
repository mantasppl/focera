import { and, avg, count, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { ensureAnalyticsSchema, getDb } from "@/lib/analytics/db";
import { toolComments, toolRatings } from "@/lib/analytics/schema";
import type { PublicToolRating } from "@/lib/ratings/types";

export type { PublicToolRating };

const EMPTY_STARS: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
};

/**
 * Public stars for a tool page.
 * No reviews → 5.0. With real reviews → weighted average of tool_ratings
 * + user (non-system) comment ratings. Count is real reviews only (not shown in UI).
 */
export async function getPublicToolRating(
  toolSlug: string,
): Promise<PublicToolRating> {
  await ensureAnalyticsSchema();
  const db = getDb();

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
        eq(toolComments.isSeed, false),
        sql`${toolComments.name} != '__seed_empty__'`,
      ),
    );

  const ratingCount = Number(ratingAgg?.count) || 0;
  const commentCount = Number(commentAgg?.count) || 0;
  const reviewCount = ratingCount + commentCount;

  if (reviewCount === 0) {
    return {
      toolSlug,
      average: 5,
      count: 0,
      stars: { ...EMPTY_STARS, 5: 0 },
    };
  }

  const ratingSum =
    ratingCount * (Number(ratingAgg?.average) || 0) +
    commentCount * (Number(commentAgg?.average) || 0);
  const average = Math.round((ratingSum / reviewCount) * 10) / 10;

  return {
    toolSlug,
    average,
    count: reviewCount,
    stars: {
      1: (Number(ratingAgg?.star1) || 0) + (Number(commentAgg?.star1) || 0),
      2: (Number(ratingAgg?.star2) || 0) + (Number(commentAgg?.star2) || 0),
      3: (Number(ratingAgg?.star3) || 0) + (Number(commentAgg?.star3) || 0),
      4: (Number(ratingAgg?.star4) || 0) + (Number(commentAgg?.star4) || 0),
      5: (Number(ratingAgg?.star5) || 0) + (Number(commentAgg?.star5) || 0),
    },
  };
}
