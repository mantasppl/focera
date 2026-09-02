import { createHash } from "node:crypto";
import { avg, count, desc, eq, isNotNull, sql } from "drizzle-orm";
import { ensureAnalyticsSchema, getDb } from "@/lib/analytics/db";
import { toolRatings } from "@/lib/analytics/schema";
import type {
  RatingListItem,
  RatingOverviewStats,
  ToolRatingSummary,
} from "@/lib/ratings/types";
import type { RatingPayload } from "@/lib/ratings/validate";

export type { RatingListItem, RatingOverviewStats, ToolRatingSummary };

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

export async function insertToolRating(
  payload: RatingPayload,
  request: Request,
): Promise<{ id: number }> {
  await ensureAnalyticsSchema();
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
  const rows = await getDb()
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

  return rows.map((row) => ({
    toolId: row.toolId,
    toolName: row.toolName,
    count: Number(row.count) || 0,
    average: Math.round(Number(row.average || 0) * 10) / 10,
    withComments: Number(row.withComments) || 0,
    stars: {
      1: Number(row.star1) || 0,
      2: Number(row.star2) || 0,
      3: Number(row.star3) || 0,
      4: Number(row.star4) || 0,
      5: Number(row.star5) || 0,
    },
  }));
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
