import { createHash } from "node:crypto";
import { and, count, eq, inArray } from "drizzle-orm";
import { ensureAnalyticsSchema, getAnalyticsClient, getDb } from "@/lib/analytics/db";
import { toolCommentLikes, toolComments } from "@/lib/analytics/schema";
import { COMMENT_SEED_VERSION } from "@/lib/comments/seed";
import type { CommentListResult, CommentSort, PublicComment } from "@/lib/comments/types";
import type { CommentPayload } from "@/lib/comments/validate";
import { getClientIp } from "@/lib/security/request";

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

export function resolveLikeIdentifier(
  request: Request,
  clientId?: string | null,
): string {
  const ip = getClientIp(request);
  if (ip && ip !== "unknown") return `ip:${hashIp(ip)}`;
  const local =
    typeof clientId === "string" ? clientId.trim().slice(0, 64) : "";
  if (local && /^[a-zA-Z0-9_-]{8,64}$/.test(local)) return `local:${local}`;
  return `ip:${hashIp("unknown")}`;
}

function toIso(value: Date | number): string {
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}

function scoreComment(likes: number, rating: number | null): number {
  return likes + (rating ?? 0);
}

function mapPublic(
  row: {
    id: number;
    name: string;
    content: string;
    rating: number | null;
    likesCount: number;
    parentId: number | null;
    createdAt: Date | number;
    isSeed?: boolean | null;
  },
  likedIds: Set<number>,
  isTop: boolean,
  replies: PublicComment[] = [],
): PublicComment {
  return {
    id: row.id,
    name: row.name,
    content: row.content,
    rating: row.rating,
    likesCount: row.likesCount,
    likedByMe: likedIds.has(row.id),
    parentId: row.parentId,
    createdAt: toIso(row.createdAt),
    isTop,
    isSystem: Boolean(row.isSeed),
    replies,
  };
}

const seedingLocks = new Set<string>();
let seedVersionReady: Promise<void> | null = null;

function seedClaimKey(toolId: string): string {
  return `comment_seeded:${toolId}`;
}

async function deleteSystemComments(client: ReturnType<typeof getAnalyticsClient>): Promise<void> {
  const seedRows = await client.execute(
    `SELECT id FROM tool_comments WHERE is_seed = 1`,
  );
  const ids = seedRows.rows
    .map((row) => Number(row.id))
    .filter((id) => Number.isInteger(id) && id > 0);
  if (ids.length === 0) return;

  const placeholders = ids.map(() => "?").join(",");
  await client.execute({
    sql: `UPDATE tool_comments SET parent_id = NULL WHERE is_seed = 0 AND parent_id IN (${placeholders})`,
    args: ids,
  });
  await client.execute({
    sql: `DELETE FROM tool_comment_likes WHERE comment_id IN (${placeholders})`,
    args: ids,
  });
  await client.execute(`DELETE FROM tool_comments WHERE is_seed = 1`);
}

async function ensureCommentSeedVersion(): Promise<void> {
  if (!seedVersionReady) {
    seedVersionReady = (async () => {
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
        args: ["comment_seed_version"],
      });
      const current = String(existing.rows[0]?.value ?? "");
      if (current === COMMENT_SEED_VERSION) return;

      // Drop generated system comments only — keep real user comments.
      await deleteSystemComments(client);
      await client.execute(
        `DELETE FROM analytics_meta WHERE key LIKE 'comment_seeded:%'`,
      );
      await client.execute({
        sql: `INSERT OR REPLACE INTO analytics_meta (key, value) VALUES (?, ?)`,
        args: ["comment_seed_version", COMMENT_SEED_VERSION],
      });
    })().catch((error) => {
      seedVersionReady = null;
      throw error;
    });
  }
  await seedVersionReady;
}

async function ensureToolCommentSeeds(toolId: string): Promise<void> {
  await ensureCommentSeedVersion();
  if (seedingLocks.has(toolId)) return;
  seedingLocks.add(toolId);
  try {
    const db = getDb();
    const [existing] = await db
      .select({ value: count() })
      .from(toolComments)
      .where(eq(toolComments.toolId, toolId));

    if ((existing?.value ?? 0) > 0) return;

    // Marker so we don't keep re-running this on every request.
    const client = getAnalyticsClient();
    const claimed = await client.execute({
      sql: `INSERT OR IGNORE INTO analytics_meta (key, value) VALUES (?, ?)`,
      args: [seedClaimKey(toolId), COMMENT_SEED_VERSION],
    });
    if ((claimed.rowsAffected ?? 0) === 0) return;

    await db.insert(toolComments).values({
      toolId,
      name: "__seed_empty__",
      email: null,
      content: "",
      rating: null,
      likesCount: 0,
      parentId: null,
      createdAt: new Date(),
      ipHash: null,
      isSeed: true,
    });
  } finally {
    seedingLocks.delete(toolId);
  }
}

/** Ensures seed version is applied so ratings don't include removed system comments. */
export async function ensureToolCommentSeedsForRating(
  toolSlug: string,
  _toolName: string,
): Promise<void> {
  await ensureToolCommentSeeds(toolSlug);
}

export async function listToolComments(options: {
  toolSlug: string;
  toolName: string;
  sort?: CommentSort;
  likedIds?: number[];
}): Promise<CommentListResult> {
  await ensureAnalyticsSchema();
  await ensureToolCommentSeeds(options.toolSlug);

  const sort: CommentSort = options.sort === "newest" ? "newest" : "top";
  const likedIds = new Set(options.likedIds ?? []);
  const db = getDb();

  const rows = await db
    .select({
      id: toolComments.id,
      name: toolComments.name,
      content: toolComments.content,
      rating: toolComments.rating,
      likesCount: toolComments.likesCount,
      parentId: toolComments.parentId,
      createdAt: toolComments.createdAt,
      isSeed: toolComments.isSeed,
    })
    .from(toolComments)
    .where(eq(toolComments.toolId, options.toolSlug));

  const visible = rows.filter(
    (row) => row.name !== "__seed_empty__" && row.content.trim().length > 0,
  );

  const roots = visible.filter((row) => row.parentId == null);
  const repliesByParent = new Map<number, typeof visible>();
  for (const row of visible) {
    if (row.parentId == null) continue;
    const list = repliesByParent.get(row.parentId) ?? [];
    list.push(row);
    repliesByParent.set(row.parentId, list);
  }

  const ranked = [...roots].sort((a, b) => {
    if (sort === "newest") {
      return (
        new Date(toIso(b.createdAt)).getTime() -
        new Date(toIso(a.createdAt)).getTime()
      );
    }
    const scoreDiff =
      scoreComment(b.likesCount, b.rating) -
      scoreComment(a.likesCount, a.rating);
    if (scoreDiff !== 0) return scoreDiff;
    return (
      new Date(toIso(b.createdAt)).getTime() -
      new Date(toIso(a.createdAt)).getTime()
    );
  });

  const topIds = new Set(
    [...ranked]
      .sort(
        (a, b) =>
          scoreComment(b.likesCount, b.rating) -
          scoreComment(a.likesCount, a.rating),
      )
      .slice(0, 3)
      .map((row) => row.id),
  );

  const comments = ranked.map((root) => {
    const replyRows = (repliesByParent.get(root.id) ?? []).sort(
      (a, b) =>
        new Date(toIso(a.createdAt)).getTime() -
        new Date(toIso(b.createdAt)).getTime(),
    );
    return mapPublic(
      root,
      likedIds,
      topIds.has(root.id),
      replyRows.map((reply) => mapPublic(reply, likedIds, false)),
    );
  });

  return {
    comments,
    total: roots.length,
    sort,
  };
}

export async function insertToolComment(
  payload: CommentPayload,
  request: Request,
): Promise<PublicComment> {
  await ensureAnalyticsSchema();
  const db = getDb();

  if (payload.parentId != null) {
    const [parent] = await db
      .select({
        id: toolComments.id,
        toolId: toolComments.toolId,
        parentId: toolComments.parentId,
      })
      .from(toolComments)
      .where(eq(toolComments.id, payload.parentId))
      .limit(1);

    if (!parent || parent.toolId !== payload.toolSlug) {
      throw new Error("REPLY_TARGET_INVALID");
    }
    // One-level nesting only.
    if (parent.parentId != null) {
      throw new Error("REPLY_NESTING");
    }
  }

  const ip = getClientIp(request);
  const [row] = await db
    .insert(toolComments)
    .values({
      toolId: payload.toolSlug,
      name: payload.name,
      email: payload.email,
      content: payload.content,
      rating: payload.rating,
      likesCount: 0,
      parentId: payload.parentId,
      createdAt: new Date(),
      ipHash: ip && ip !== "unknown" ? hashIp(ip) : null,
      isSeed: false,
    })
    .returning({
      id: toolComments.id,
      name: toolComments.name,
      content: toolComments.content,
      rating: toolComments.rating,
      likesCount: toolComments.likesCount,
      parentId: toolComments.parentId,
      createdAt: toolComments.createdAt,
      isSeed: toolComments.isSeed,
    });

  if (!row) throw new Error("INSERT_FAILED");
  return mapPublic(row, new Set(), false);
}

export async function toggleCommentLike(options: {
  commentId: number;
  toolSlug: string;
  identifier: string;
}): Promise<{ liked: boolean; likesCount: number }> {
  await ensureAnalyticsSchema();
  const db = getDb();

  const [comment] = await db
    .select({
      id: toolComments.id,
      toolId: toolComments.toolId,
      likesCount: toolComments.likesCount,
    })
    .from(toolComments)
    .where(eq(toolComments.id, options.commentId))
    .limit(1);

  if (!comment || comment.toolId !== options.toolSlug) {
    throw new Error("COMMENT_NOT_FOUND");
  }

  const [existing] = await db
    .select({ id: toolCommentLikes.id })
    .from(toolCommentLikes)
    .where(
      and(
        eq(toolCommentLikes.commentId, options.commentId),
        eq(toolCommentLikes.identifier, options.identifier),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .delete(toolCommentLikes)
      .where(eq(toolCommentLikes.id, existing.id));
    const next = Math.max(0, comment.likesCount - 1);
    await db
      .update(toolComments)
      .set({ likesCount: next })
      .where(eq(toolComments.id, options.commentId));
    return { liked: false, likesCount: next };
  }

  try {
    await db.insert(toolCommentLikes).values({
      commentId: options.commentId,
      identifier: options.identifier,
      createdAt: new Date(),
    });
  } catch {
    // Concurrent like — treat as already liked.
    return { liked: true, likesCount: comment.likesCount };
  }
  const next = comment.likesCount + 1;
  await db
    .update(toolComments)
    .set({ likesCount: next })
    .where(eq(toolComments.id, options.commentId));
  return { liked: true, likesCount: next };
}

export async function getLikedCommentIds(options: {
  toolSlug: string;
  identifier: string;
}): Promise<number[]> {
  await ensureAnalyticsSchema();
  const db = getDb();

  const toolCommentIds = await db
    .select({ id: toolComments.id })
    .from(toolComments)
    .where(eq(toolComments.toolId, options.toolSlug));

  if (toolCommentIds.length === 0) return [];

  const ids = toolCommentIds.map((row) => row.id);
  const likes = await db
    .select({ commentId: toolCommentLikes.commentId })
    .from(toolCommentLikes)
    .where(
      and(
        eq(toolCommentLikes.identifier, options.identifier),
        inArray(toolCommentLikes.commentId, ids),
      ),
    );

  return likes.map((row) => row.commentId);
}
