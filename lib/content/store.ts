import { cache } from "react";
import { and, desc, eq, like } from "drizzle-orm";
import {
  parseContentBlocks,
  parseCtaConfig,
  parseRelatedToolIds,
  stringifyContentBlocks,
} from "@/lib/content/blocks";
import { ensureContentSchema, getContentDb } from "@/lib/content/db";
import { posts, type PostRow } from "@/lib/content/schema";
import {
  DEFAULT_CTA_CONFIG,
  type Post,
  type PostListItem,
  type PostStatus,
  type RobotsDirective,
  type SchemaType,
} from "@/lib/content/types";
import type { ValidatedPostInput } from "@/lib/content/validate";

function isConstraintError(error: unknown, kind: "slug" | "tool"): boolean {
  const message = error instanceof Error ? error.message : String(error);
  if (kind === "slug") return /unique/i.test(message) && /slug/i.test(message);
  return /foreign key/i.test(message);
}

function parseRobots(value: string): RobotsDirective {
  if (value === "noindex,follow" || value === "noindex,nofollow") return value;
  return "index,follow";
}

function parseSchemaType(value: string): SchemaType {
  if (value === "faq" || value === "howto") return value;
  return "article";
}

function parseStatus(value: string): PostStatus {
  return value === "published" ? "published" : "draft";
}

export function rowToPost(row: PostRow): Post {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt || "",
    coverImage: row.coverImage || "",
    content: parseContentBlocks(row.contentJson),
    seoTitle: row.seoTitle || "",
    metaDescription: row.metaDescription || "",
    ogTitle: row.ogTitle || "",
    ogDescription: row.ogDescription || "",
    ogImage: row.ogImage || "",
    canonicalUrl: row.canonicalUrl || "",
    robots: parseRobots(row.robots),
    schemaType: parseSchemaType(row.schemaType),
    schemaJson: row.schemaJson || "",
    primaryToolId: row.primaryToolId || null,
    relatedToolIds: parseRelatedToolIds(row.relatedToolsJson),
    ctaConfig: parseCtaConfig(row.ctaConfigJson || DEFAULT_CTA_CONFIG),
    status: parseStatus(row.status),
    publishedAt: row.publishedAt ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function rowToListItem(row: PostRow): PostListItem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt || "",
    status: parseStatus(row.status),
    publishedAt: row.publishedAt ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toRowValues(input: ValidatedPostInput, now: number) {
  const status = input.status || "draft";
  let publishedAt = input.publishedAt ?? null;
  if (status === "published" && !publishedAt) publishedAt = now;
  if (status === "draft" && input.publishedAt === null) publishedAt = null;

  return {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt || "",
    coverImage: input.coverImage || null,
    contentJson: stringifyContentBlocks(input.content || []),
    seoTitle: input.seoTitle || "",
    metaDescription: input.metaDescription || "",
    ogTitle: input.ogTitle || "",
    ogDescription: input.ogDescription || "",
    ogImage: input.ogImage || "",
    canonicalUrl: input.canonicalUrl || "",
    robots: input.robots || "index,follow",
    schemaType: input.schemaType || "article",
    schemaJson: input.schemaJson || null,
    primaryToolId: input.primaryToolId || null,
    relatedToolsJson: JSON.stringify(input.relatedToolIds || []),
    ctaConfigJson: JSON.stringify(input.ctaConfig || DEFAULT_CTA_CONFIG),
    status,
    publishedAt,
  };
}

export async function listPosts(options: {
  status?: string | null;
  q?: string | null;
  limit?: number;
  offset?: number;
}): Promise<{ items: PostListItem[]; total: number }> {
  await ensureContentSchema();
  const db = getContentDb();
  const status =
    options.status === "draft" || options.status === "published"
      ? options.status
      : null;
  const query = options.q?.trim().replace(/[%_]/g, "").slice(0, 80) || "";
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 200);
  const offset = Math.max(options.offset ?? 0, 0);

  const filters = [];
  if (status) filters.push(eq(posts.status, status));
  if (query) filters.push(like(posts.title, `%${query}%`));
  const where = filters.length ? and(...filters) : undefined;

  const rows = await db
    .select()
    .from(posts)
    .where(where)
    .orderBy(desc(posts.updatedAt))
    .limit(limit)
    .offset(offset);

  const countRows = await db.select({ id: posts.id }).from(posts).where(where);

  return {
    items: rows.map(rowToListItem),
    total: countRows.length,
  };
}

export async function listPublishedPosts(): Promise<PostListItem[]> {
  const { items } = await listPosts({ status: "published", limit: 200 });
  return items;
}

export const listPublishedPostSlugs = cache(async (): Promise<string[]> => {
  await ensureContentSchema();
  const rows = await getContentDb()
    .select({ slug: posts.slug })
    .from(posts)
    .where(eq(posts.status, "published"));
  return rows.map((row) => row.slug);
});

export async function getPostById(id: string): Promise<Post | null> {
  await ensureContentSchema();
  const [row] = await getContentDb()
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);
  return row ? rowToPost(row) : null;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  await ensureContentSchema();
  const [row] = await getContentDb()
    .select()
    .from(posts)
    .where(eq(posts.slug, slug))
    .limit(1);
  return row ? rowToPost(row) : null;
}

export const getPublishedPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  const post = await getPostBySlug(slug);
  if (!post || post.status !== "published") return null;
  return post;
});

export async function createPost(input: ValidatedPostInput): Promise<Post> {
  await ensureContentSchema();
  const db = getContentDb();
  const now = Date.now();
  const id = crypto.randomUUID();
  const values = toRowValues(input, now);

  try {
    await db.insert(posts).values({
      id,
      ...values,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    if (isConstraintError(error, "slug")) {
      throw new Error("SLUG_TAKEN");
    }
    if (isConstraintError(error, "tool")) {
      throw new Error("INVALID_TOOL");
    }
    throw error;
  }

  const created = await getPostById(id);
  if (!created) throw new Error("CREATE_FAILED");
  return created;
}

export async function updatePost(
  id: string,
  patch: Partial<ValidatedPostInput>,
): Promise<Post> {
  await ensureContentSchema();
  const existing = await getPostById(id);
  if (!existing) throw new Error("POST_NOT_FOUND");

  const merged: ValidatedPostInput = {
    title: patch.title ?? existing.title,
    slug: patch.slug ?? existing.slug,
    excerpt: patch.excerpt ?? existing.excerpt,
    coverImage: patch.coverImage ?? existing.coverImage,
    content: patch.content ?? existing.content,
    seoTitle: patch.seoTitle ?? existing.seoTitle,
    metaDescription: patch.metaDescription ?? existing.metaDescription,
    ogTitle: patch.ogTitle ?? existing.ogTitle,
    ogDescription: patch.ogDescription ?? existing.ogDescription,
    ogImage: patch.ogImage ?? existing.ogImage,
    canonicalUrl: patch.canonicalUrl ?? existing.canonicalUrl,
    robots: patch.robots ?? existing.robots,
    schemaType: patch.schemaType ?? existing.schemaType,
    schemaJson: patch.schemaJson ?? existing.schemaJson,
    primaryToolId:
      patch.primaryToolId === undefined ? existing.primaryToolId : patch.primaryToolId,
    relatedToolIds: patch.relatedToolIds ?? existing.relatedToolIds,
    ctaConfig: patch.ctaConfig ?? existing.ctaConfig,
    status: patch.status ?? existing.status,
    publishedAt:
      patch.publishedAt === undefined ? existing.publishedAt : patch.publishedAt,
  };

  const now = Date.now();
  const values = toRowValues(merged, now);

  try {
    await getContentDb()
      .update(posts)
      .set({ ...values, updatedAt: now })
      .where(eq(posts.id, id));
  } catch (error) {
    if (isConstraintError(error, "slug")) {
      throw new Error("SLUG_TAKEN");
    }
    if (isConstraintError(error, "tool")) {
      throw new Error("INVALID_TOOL");
    }
    throw error;
  }

  const updated = await getPostById(id);
  if (!updated) throw new Error("POST_NOT_FOUND");
  return updated;
}

export async function deletePost(id: string): Promise<{ slug: string }> {
  await ensureContentSchema();
  const existing = await getPostById(id);
  if (!existing) throw new Error("POST_NOT_FOUND");
  await getContentDb().delete(posts).where(eq(posts.id, id));
  return { slug: existing.slug };
}
