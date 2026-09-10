import { createHash } from "node:crypto";
import { and, count, eq, inArray, isNull, ne } from "drizzle-orm";
import { getToolBySlug } from "@/data/tools";
import { ensureAnalyticsSchema, getAnalyticsClient, getDb } from "@/lib/analytics/db";
import { toolCommentLikes, toolComments } from "@/lib/analytics/schema";
import {
  buildSeedsForTool,
  COMMENT_SEED_VERSION,
} from "@/lib/comments/seed";
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

/** Drop exact duplicate seed roots (same content), keeping the oldest id. */
async function dedupeSeedRootsForTool(toolId: string): Promise<void> {
  const client = getAnalyticsClient();
  const dupes = await client.execute({
    sql: `
SELECT id FROM tool_comments
WHERE tool_id = ?
  AND is_seed = 1
  AND parent_id IS NULL
  AND name != '__seed_empty__'
  AND id NOT IN (
    SELECT MIN(id)
    FROM tool_comments
    WHERE tool_id = ?
      AND is_seed = 1
      AND parent_id IS NULL
      AND name != '__seed_empty__'
    GROUP BY content
  )
`,
    args: [toolId, toolId],
  });
  const rootIds = dupes.rows
    .map((row) => Number(row.id))
    .filter((id) => Number.isInteger(id) && id > 0);
  if (rootIds.length === 0) return;

  const replyRows = await client.execute({
    sql: `SELECT id FROM tool_comments WHERE parent_id IN (${rootIds.map(() => "?").join(",")})`,
    args: rootIds,
  });
  const ids = [
    ...rootIds,
    ...replyRows.rows
      .map((row) => Number(row.id))
      .filter((id) => Number.isInteger(id) && id > 0),
  ];

  await client.execute({
    sql: `DELETE FROM tool_comment_likes WHERE comment_id IN (${ids.map(() => "?").join(",")})`,
    args: ids,
  });
  await client.execute({
    sql: `DELETE FROM tool_comments WHERE id IN (${ids.map(() => "?").join(",")})`,
    args: ids,
  });
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

      // Wipe prior seeds/likes so tools can regenerate with the new rules.
      await client.execute(`DELETE FROM tool_comment_likes`);
      await client.execute(`DELETE FROM tool_comments`);
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

async function ensureToolCommentSeeds(
  toolId: string,
  toolName: string,
): Promise<void> {
  await ensureCommentSeedVersion();
  if (seedingLocks.has(toolId)) return;
  seedingLocks.add(toolId);
  try {
    const db = getDb();
    const [existing] = await db
      .select({ value: count() })
      .from(toolComments)
      .where(eq(toolComments.toolId, toolId));

    // Already seeded (including intentionally empty via marker) or has user comments.
    if ((existing?.value ?? 0) > 0) {
      // Max seed roots is 5; higher usually means a serverless race re-inserted seeds.
      const [seedRoots] = await db
        .select({ value: count() })
        .from(toolComments)
        .where(
          and(
            eq(toolComments.toolId, toolId),
            eq(toolComments.isSeed, true),
            isNull(toolComments.parentId),
            ne(toolComments.name, "__seed_empty__"),
          ),
        );
      if ((seedRoots?.value ?? 0) > 5) {
        await dedupeSeedRootsForTool(toolId);
      }
      return;
    }

    // Cross-isolate lock so concurrent cold starts don't insert the same seeds.
    const client = getAnalyticsClient();
    const claimed = await client.execute({
      sql: `INSERT OR IGNORE INTO analytics_meta (key, value) VALUES (?, ?)`,
      args: [seedClaimKey(toolId), COMMENT_SEED_VERSION],
    });
    if ((claimed.rowsAffected ?? 0) === 0) return;

    const tool = getToolBySlug(toolId);
    const seeds = tool
      ? buildSeedsForTool(tool)
      : buildSeedsForTool({
          slug: toolId,
          name: toolName,
          shortName: toolName,
          categories: ["file"],
        });

    const now = Date.now();

    if (seeds.length === 0) {
      // Marker so we don't keep re-rolling empty tools on every request.
      await db.insert(toolComments).values({
        toolId,
        name: "__seed_empty__",
        email: null,
        content: "",
        rating: null,
        likesCount: 0,
        parentId: null,
        createdAt: new Date(now),
        ipHash: null,
        isSeed: true,
      });
      return;
    }

    for (const seed of seeds) {
      const [parent] = await db
        .insert(toolComments)
        .values({
          toolId,
          name: seed.name,
          email: null,
          content: seed.content,
          rating: seed.rating,
          likesCount: seed.likes,
          parentId: null,
          createdAt: new Date(now - seed.hoursAgo * 3_600_000),
          ipHash: null,
          isSeed: true,
        })
        .returning({ id: toolComments.id });

      if (!parent?.id || !seed.replies?.length) continue;

      for (const reply of seed.replies) {
        await db.insert(toolComments).values({
          toolId,
          name: reply.name,
          email: null,
          content: reply.content,
          rating: null,
          likesCount: reply.likes,
          parentId: parent.id,
          createdAt: new Date(now - reply.hoursAgo * 3_600_000),
          ipHash: null,
          isSeed: true,
        });
      }
    }
  } finally {
    seedingLocks.delete(toolId);
  }
}

/** Ensures seed comments exist so public ratings can include them. */
export async function ensureToolCommentSeedsForRating(
  toolSlug: string,
  toolName: string,
): Promise<void> {
  await ensureToolCommentSeeds(toolSlug, toolName);
}

export async function listToolComments(options: {
  toolSlug: string;
  toolName: string;
  sort?: CommentSort;
  likedIds?: number[];
}): Promise<CommentListResult> {
  await ensureAnalyticsSchema();
  await ensureToolCommentSeeds(options.toolSlug, options.toolName);

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
