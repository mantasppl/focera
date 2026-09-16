import { and, avg, count, eq, isNotNull, isNull, sql } from "drizzle-orm";
import {
  ensureAnalyticsSchema,
  getAnalyticsClient,
  getDb,
} from "@/lib/analytics/db";
import { toolComments, toolRatings } from "@/lib/analytics/schema";
import type { PublicToolRating } from "@/lib/ratings/types";

export type { PublicToolRating };

/** Bump to wipe leftover ratings and re-mark seeds once on next deploy/load. */
const PUBLIC_RATING_RESET_VERSION = "3";

const EMPTY_STARS: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
};

let ratingResetReady: Promise<void> | null = null;

async function ensurePublicRatingReset(): Promise<void> {
  if (!ratingResetReady) {
    ratingResetReady = (async () => {
      await ensureAnalyticsSchema();
      const client = getAnalyticsClient();
      await client.execute(`
CREATE TABLE IF NOT EXISTS analytics_meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);
`);
      const existing = await client.execute({
        sql: `SELECT value FROM analytics_meta WHERE key = ?`,
        args: ["public_rating_reset_version"],
      });
      const current = String(existing.rows[0]?.value ?? "");
      if (current === PUBLIC_RATING_RESET_VERSION) return;

      // Wipe form ratings and treat all existing comments as system so hero
      // stars reset to 5 until new real user reviews arrive.
      await client.execute(`DELETE FROM tool_ratings`);
      await client.execute(`
UPDATE tool_comments
SET is_seed = 1
WHERE name != '__seed_empty__'
`);
      await client.execute({
        sql: `INSERT OR REPLACE INTO analytics_meta (key, value) VALUES (?, ?)`,
        args: ["public_rating_reset_version", PUBLIC_RATING_RESET_VERSION],
      });
    })().catch((error) => {
      ratingResetReady = null;
      throw error;
    });
  }
  await ratingResetReady;
}

/**
 * Public stars for a tool page.
 * Real reviews = tool_ratings + user comments (is_seed = 0) with a rating.
 * No reviews → 5.
 */
export async function getPublicToolRating(
  toolSlug: string,
): Promise<PublicToolRating> {
  await ensurePublicRatingReset();
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
        sql`${toolComments.isSeed} = 0`,
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
      stars: { ...EMPTY_STARS },
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
