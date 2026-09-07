import { and, avg, count, desc, eq, gte, inArray, isNotNull, isNull, ne, sql, sum } from "drizzle-orm";
import { getToolBySlug } from "@/data/tools";
import { ensureAnalyticsSchema, getDb } from "@/lib/analytics/db";
import { toolCommentLikes, toolComments } from "@/lib/analytics/schema";
import type {
  AdminCommentItem,
  AdminCommentKind,
  CommentOverviewStats,
  ToolCommentSummary,
} from "@/lib/comments/admin-types";

const EMPTY_MARKER = "__seed_empty__";

function toIso(value: Date | number): string {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

function startOfUtcDay(d = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function notMarker() {
  return ne(toolComments.name, EMPTY_MARKER);
}

export async function getCommentOverview(): Promise<CommentOverviewStats> {
  await ensureAnalyticsSchema();
  const db = getDb();
  const today = startOfUtcDay();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [totals] = await db
    .select({
      total: count(),
      roots: sql<number>`sum(case when ${toolComments.parentId} is null then 1 else 0 end)`,
      replies: sql<number>`sum(case when ${toolComments.parentId} is not null then 1 else 0 end)`,
      systemComments: sql<number>`sum(case when ${toolComments.isSeed} = 1 then 1 else 0 end)`,
      userComments: sql<number>`sum(case when ${toolComments.isSeed} = 0 then 1 else 0 end)`,
      totalLikes: sum(toolComments.likesCount),
      averageRating: avg(toolComments.rating),
    })
    .from(toolComments)
    .where(notMarker());

  const [newToday] = await db
    .select({ value: count() })
    .from(toolComments)
    .where(and(notMarker(), gte(toolComments.createdAt, today)));

  const [newWeek] = await db
    .select({ value: count() })
    .from(toolComments)
    .where(and(notMarker(), gte(toolComments.createdAt, weekAgo)));

  const toolRows = await db
    .select({ toolId: toolComments.toolId })
    .from(toolComments)
    .where(notMarker())
    .groupBy(toolComments.toolId);

  return {
    total: Number(totals?.total) || 0,
    roots: Number(totals?.roots) || 0,
    replies: Number(totals?.replies) || 0,
    systemComments: Number(totals?.systemComments) || 0,
    userComments: Number(totals?.userComments) || 0,
    totalLikes: Number(totals?.totalLikes) || 0,
    newToday: Number(newToday?.value) || 0,
    newThisWeek: Number(newWeek?.value) || 0,
    toolsWithComments: toolRows.length,
    averageRating: Math.round(Number(totals?.averageRating || 0) * 10) / 10,
  };
}

export async function getPerToolCommentSummaries(): Promise<ToolCommentSummary[]> {
  await ensureAnalyticsSchema();
  const rows = await getDb()
    .select({
      toolId: toolComments.toolId,
      total: count(),
      roots: sql<number>`sum(case when ${toolComments.parentId} is null then 1 else 0 end)`,
      replies: sql<number>`sum(case when ${toolComments.parentId} is not null then 1 else 0 end)`,
      systemCount: sql<number>`sum(case when ${toolComments.isSeed} = 1 then 1 else 0 end)`,
      userCount: sql<number>`sum(case when ${toolComments.isSeed} = 0 then 1 else 0 end)`,
      likes: sum(toolComments.likesCount),
      averageRating: avg(toolComments.rating),
    })
    .from(toolComments)
    .where(notMarker())
    .groupBy(toolComments.toolId)
    .orderBy(desc(count()));

  return rows.map((row) => {
    const tool = getToolBySlug(row.toolId);
    return {
      toolId: row.toolId,
      toolName: tool?.name ?? row.toolId,
      total: Number(row.total) || 0,
      roots: Number(row.roots) || 0,
      replies: Number(row.replies) || 0,
      systemCount: Number(row.systemCount) || 0,
      userCount: Number(row.userCount) || 0,
      likes: Number(row.likes) || 0,
      averageRating: Math.round(Number(row.averageRating || 0) * 10) / 10,
    };
  });
}

export async function listAdminComments(options: {
  toolId?: string;
  kind?: AdminCommentKind;
  query?: string;
  limit?: number;
  offset?: number;
}): Promise<{ items: AdminCommentItem[]; total: number }> {
  await ensureAnalyticsSchema();
  const db = getDb();
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 200);
  const offset = Math.max(options.offset ?? 0, 0);
  const kind = options.kind ?? "all";

  const filters = [notMarker()];
  if (options.toolId) {
    filters.push(eq(toolComments.toolId, options.toolId));
  }
  if (kind === "user") filters.push(eq(toolComments.isSeed, false));
  if (kind === "system") filters.push(eq(toolComments.isSeed, true));
  if (kind === "replies") filters.push(isNotNull(toolComments.parentId));
  if (kind === "roots") filters.push(isNull(toolComments.parentId));

  const q = options.query?.trim().toLowerCase();
  if (q) {
    filters.push(
      sql`(lower(${toolComments.name}) like ${`%${q}%`} or lower(${toolComments.content}) like ${`%${q}%`} or lower(coalesce(${toolComments.email}, '')) like ${`%${q}%`})`,
    );
  }

  const where = and(...filters);

  const [totalRow] = await db
    .select({ value: count() })
    .from(toolComments)
    .where(where);

  const rows = await db
    .select({
      id: toolComments.id,
      toolId: toolComments.toolId,
      name: toolComments.name,
      email: toolComments.email,
      content: toolComments.content,
      rating: toolComments.rating,
      likesCount: toolComments.likesCount,
      parentId: toolComments.parentId,
      createdAt: toolComments.createdAt,
      isSeed: toolComments.isSeed,
    })
    .from(toolComments)
    .where(where)
    .orderBy(desc(toolComments.createdAt))
    .limit(limit)
    .offset(offset);

  const ids = rows.map((row) => row.id);
  const replyCounts = new Map<number, number>();
  if (ids.length > 0) {
    const replyRows = await db
      .select({
        parentId: toolComments.parentId,
        value: count(),
      })
      .from(toolComments)
      .where(and(notMarker(), inArray(toolComments.parentId, ids)))
      .groupBy(toolComments.parentId);
    for (const row of replyRows) {
      if (row.parentId != null) {
        replyCounts.set(row.parentId, Number(row.value) || 0);
      }
    }
  }

  return {
    total: totalRow?.value ?? 0,
    items: rows.map((row) => {
      const tool = getToolBySlug(row.toolId);
      return {
        id: row.id,
        toolId: row.toolId,
        toolName: tool?.name ?? row.toolId,
        name: row.name,
        email: row.email,
        content: row.content,
        rating: row.rating,
        likesCount: row.likesCount,
        parentId: row.parentId,
        createdAt: toIso(row.createdAt),
        isSystem: Boolean(row.isSeed),
        replyCount: replyCounts.get(row.id) ?? 0,
      };
    }),
  };
}

export async function updateAdminComment(
  id: number,
  patch: {
    name?: string;
    content?: string;
    email?: string | null;
    rating?: number | null;
    likesCount?: number;
    isSystem?: boolean;
  },
): Promise<AdminCommentItem> {
  await ensureAnalyticsSchema();
  const db = getDb();

  const [existing] = await db
    .select({ id: toolComments.id })
    .from(toolComments)
    .where(and(eq(toolComments.id, id), notMarker()))
    .limit(1);
  if (!existing) throw new Error("COMMENT_NOT_FOUND");

  const updates: Partial<typeof toolComments.$inferInsert> = {};
  if (typeof patch.name === "string") {
    const name = patch.name.trim();
    if (!name || name.length > 50) throw new Error("INVALID_NAME");
    updates.name = name;
  }
  if (typeof patch.content === "string") {
    const content = patch.content.trim();
    if (!content || content.length > 1000) throw new Error("INVALID_CONTENT");
    updates.content = content;
  }
  if (patch.email !== undefined) {
    if (patch.email === null || patch.email === "") {
      updates.email = null;
    } else {
      const email = patch.email.trim();
      if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("INVALID_EMAIL");
      }
      updates.email = email;
    }
  }
  if (patch.rating !== undefined) {
    if (patch.rating === null) {
      updates.rating = null;
    } else if (
      !Number.isInteger(patch.rating) ||
      patch.rating < 1 ||
      patch.rating > 5
    ) {
      throw new Error("INVALID_RATING");
    } else {
      updates.rating = patch.rating;
    }
  }
  if (typeof patch.likesCount === "number") {
    if (!Number.isInteger(patch.likesCount) || patch.likesCount < 0 || patch.likesCount > 1_000_000) {
      throw new Error("INVALID_LIKES");
    }
    updates.likesCount = patch.likesCount;
  }
  if (typeof patch.isSystem === "boolean") {
    updates.isSeed = patch.isSystem;
  }

  if (Object.keys(updates).length === 0) throw new Error("EMPTY_PATCH");

  await db.update(toolComments).set(updates).where(eq(toolComments.id, id));

  const [row] = await db
    .select({
      id: toolComments.id,
      toolId: toolComments.toolId,
      name: toolComments.name,
      email: toolComments.email,
      content: toolComments.content,
      rating: toolComments.rating,
      likesCount: toolComments.likesCount,
      parentId: toolComments.parentId,
      createdAt: toolComments.createdAt,
      isSeed: toolComments.isSeed,
    })
    .from(toolComments)
    .where(eq(toolComments.id, id))
    .limit(1);

  if (!row) throw new Error("COMMENT_NOT_FOUND");
  const tool = getToolBySlug(row.toolId);

  const [replyRow] = await db
    .select({ value: count() })
    .from(toolComments)
    .where(and(notMarker(), eq(toolComments.parentId, id)));

  return {
    id: row.id,
    toolId: row.toolId,
    toolName: tool?.name ?? row.toolId,
    name: row.name,
    email: row.email,
    content: row.content,
    rating: row.rating,
    likesCount: row.likesCount,
    parentId: row.parentId,
    createdAt: toIso(row.createdAt),
    isSystem: Boolean(row.isSeed),
    replyCount: Number(replyRow?.value) || 0,
  };
}

export async function deleteAdminComment(id: number): Promise<{ deleted: number }> {
  await ensureAnalyticsSchema();
  const db = getDb();

  const [existing] = await db
    .select({ id: toolComments.id })
    .from(toolComments)
    .where(and(eq(toolComments.id, id), notMarker()))
    .limit(1);
  if (!existing) throw new Error("COMMENT_NOT_FOUND");

  const replyRows = await db
    .select({ id: toolComments.id })
    .from(toolComments)
    .where(eq(toolComments.parentId, id));
  const ids = [id, ...replyRows.map((row) => row.id)];

  await db
    .delete(toolCommentLikes)
    .where(inArray(toolCommentLikes.commentId, ids));
  await db.delete(toolComments).where(inArray(toolComments.id, ids));

  return { deleted: ids.length };
}
