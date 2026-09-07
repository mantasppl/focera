import { createHash } from "node:crypto";
import { and, avg, count, desc, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { getReadyTools, getToolBySlug } from "@/data/tools";
import { ensureAnalyticsSchema, getDb } from "@/lib/analytics/db";
import {
  toolComments,
  toolRatingBases,
  toolRatings,
} from "@/lib/analytics/schema";
import type {
  PublicToolRating,
  RatingListItem,
  RatingOverviewStats,
  ToolRatingSummary,
} from "@/lib/ratings/types";
import type { RatingPayload } from "@/lib/ratings/validate";

export type {
  PublicToolRating,
  RatingListItem,
  RatingOverviewStats,
  ToolRatingSummary,
};

const BASE_COUNT_MIN = 115;
const BASE_COUNT_MAX = 2541;
const BASE_COUNT_SPAN = BASE_COUNT_MAX - BASE_COUNT_MIN + 1;

function hashIp(ip: string): string {
  const salt =
    process.env.ANALYTICS_IP_SALT?.trim() ||
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    (process.env.NODE_ENV === "production" ? null : "focera-analytics-dev");
  if (!salt) {
    return createHash("sha256")
      .update(`ephemeral:${ip}:${process.pid}`)
      .digest("hex")
      .slice(0, 32);
  }
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

function extractIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  return realIp || null;
}

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

export async function setRatingBaseCount(
  toolSlug: string,
  baseCount: number,
): Promise<number> {
  if (
    !Number.isInteger(baseCount) ||
    baseCount < 0 ||
    baseCount > 10_000_000
  ) {
    throw new Error("INVALID_BASE_COUNT");
  }
  const tool = getToolBySlug(toolSlug);
  if (!tool || tool.status !== "ready") {
    throw new Error("UNKNOWN_TOOL");
  }

  await ensureAnalyticsSchema();
  const db = getDb();
  const [existing] = await db
    .select({ toolId: toolRatingBases.toolId })
    .from(toolRatingBases)
    .where(eq(toolRatingBases.toolId, toolSlug))
    .limit(1);

  if (existing) {
    await db
      .update(toolRatingBases)
      .set({ baseCount, updatedAt: new Date() })
      .where(eq(toolRatingBases.toolId, toolSlug));
  } else {
    await db.insert(toolRatingBases).values({
      toolId: toolSlug,
      baseCount,
      updatedAt: new Date(),
    });
  }
  return baseCount;
}

export async function insertToolRating(
  payload: RatingPayload,
  request: Request,
): Promise<{ id: number }> {
  await ensureAnalyticsSchema();
  // Ensure a public base exists so display count grows from the seeded floor.
  await getOrCreateRatingBaseCount(payload.toolSlug);
  const ip = extractIp(request);
  const [row] = await getDb()
    .insert(toolRatings)
    .values({
      toolId: payload.toolSlug,
      toolName: payload.toolName,
      stars: payload.stars,
      comment: payload.comment,
      createdAt: new Date(),
      sessionId: payload.sessionId,
      ipHash: ip ? hashIp(ip) : null,
    })
    .returning({ id: toolRatings.id });

  return { id: row?.id ?? 0 };
}

export async function getRatingOverview(): Promise<RatingOverviewStats> {
  await ensureAnalyticsSchema();
  const db = getDb();

  const [totalRow] = await db
    .select({ value: count() })
    .from(toolRatings);

  const [commentRow] = await db
    .select({ value: count() })
    .from(toolRatings)
    .where(isNotNull(toolRatings.comment));

  const [avgRow] = await db
    .select({ value: avg(toolRatings.stars) })
    .from(toolRatings);

  const average = avgRow?.value ? Number(avgRow.value) : 0;

  return {
    total: totalRow?.value ?? 0,
    withComments: commentRow?.value ?? 0,
    average: Math.round(average * 10) / 10,
  };
}

export async function getPerToolRatingSummaries(): Promise<ToolRatingSummary[]> {
  await ensureAnalyticsSchema();
  const db = getDb();
  const rows = await db
    .select({
      toolId: toolRatings.toolId,
      toolName: toolRatings.toolName,
      count: count(),
      average: avg(toolRatings.stars),
      withComments: sql<number>`sum(case when ${toolRatings.comment} is not null then 1 else 0 end)`,
      star1: sql<number>`sum(case when ${toolRatings.stars} = 1 then 1 else 0 end)`,
      star2: sql<number>`sum(case when ${toolRatings.stars} = 2 then 1 else 0 end)`,
      star3: sql<number>`sum(case when ${toolRatings.stars} = 3 then 1 else 0 end)`,
      star4: sql<number>`sum(case when ${toolRatings.stars} = 4 then 1 else 0 end)`,
      star5: sql<number>`sum(case when ${toolRatings.stars} = 5 then 1 else 0 end)`,
    })
    .from(toolRatings)
    .groupBy(toolRatings.toolId, toolRatings.toolName)
    .orderBy(desc(count()));

  const bases = await db.select().from(toolRatingBases);
  const baseMap = new Map(bases.map((row) => [row.toolId, row.baseCount]));

  const byId = new Map(
    rows.map((row) => {
      const liveCount = Number(row.count) || 0;
      const baseCount =
        baseMap.get(row.toolId) ?? defaultRatingBaseCount(row.toolId);
      return [
        row.toolId,
        {
          toolId: row.toolId,
          toolName: row.toolName,
          count: liveCount,
          average: Math.round(Number(row.average || 0) * 10) / 10,
          withComments: Number(row.withComments) || 0,
          stars: {
            1: Number(row.star1) || 0,
            2: Number(row.star2) || 0,
            3: Number(row.star3) || 0,
            4: Number(row.star4) || 0,
            5: Number(row.star5) || 0,
          },
          baseCount,
          liveCount,
          displayCount: baseCount + liveCount,
        } satisfies ToolRatingSummary,
      ] as const;
    }),
  );

  // Include every ready tool so admins can edit base counts even with 0 live ratings.
  for (const tool of getReadyTools()) {
    if (byId.has(tool.slug)) continue;
    const baseCount =
      baseMap.get(tool.slug) ?? defaultRatingBaseCount(tool.slug);
    byId.set(tool.slug, {
      toolId: tool.slug,
      toolName: tool.name,
      count: 0,
      average: 0,
      withComments: 0,
      stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      baseCount,
      liveCount: 0,
      displayCount: baseCount,
    });
  }

  return [...byId.values()].sort((a, b) => {
    if (b.displayCount !== a.displayCount) return b.displayCount - a.displayCount;
    return a.toolName.localeCompare(b.toolName);
  });
}

export async function listToolRatings(options: {
  toolId?: string;
  limit?: number;
  offset?: number;
}): Promise<{ items: RatingListItem[]; total: number }> {
  await ensureAnalyticsSchema();
  const db = getDb();
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 200);
  const offset = Math.max(options.offset ?? 0, 0);
  const toolFilter = options.toolId
    ? eq(toolRatings.toolId, options.toolId)
    : undefined;

  const [totalRow] = await db
    .select({ value: count() })
    .from(toolRatings)
    .where(toolFilter);

  const rows = await db
    .select({
      id: toolRatings.id,
      toolId: toolRatings.toolId,
      toolName: toolRatings.toolName,
      stars: toolRatings.stars,
      comment: toolRatings.comment,
      createdAt: toolRatings.createdAt,
    })
    .from(toolRatings)
    .where(toolFilter)
    .orderBy(desc(toolRatings.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    total: totalRow?.value ?? 0,
    items: rows.map((row) => ({
      id: row.id,
      toolId: row.toolId,
      toolName: row.toolName,
      stars: row.stars,
      comment: row.comment,
      createdAt:
        row.createdAt instanceof Date
          ? row.createdAt.toISOString()
          : new Date(row.createdAt).toISOString(),
    })),
  };
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
 * Display count = base (115–2541 seed or admin override) + live tool_ratings.
 * Average uses live ratings + comment stars when available.
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
