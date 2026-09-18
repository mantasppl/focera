import { count, countDistinct, inArray, sql } from "drizzle-orm";
import { ensureAnalyticsSchema, getDb } from "@/lib/analytics/db";
import { pageViews } from "@/lib/analytics/schema";
import {
  aggregateNamedCounts,
  classifyTrafficSource,
} from "@/lib/analytics/source";
import {
  EMPTY_POST_METRICS,
  type PostMetrics,
} from "@/lib/content/types";

const BLOG_PATH_PREFIX = "/blog/";
const SOURCE_LIMIT = 8;

export function blogPostPath(slug: string): string {
  return `${BLOG_PATH_PREFIX}${slug}`;
}

function pathsForSlug(slug: string): string[] {
  const path = blogPostPath(slug);
  return [path, `${path}/`];
}

function slugFromCanonicalPath(
  path: string,
  allowed: Set<string>,
): string | null {
  if (!path.startsWith(BLOG_PATH_PREFIX)) return null;
  const slug = path.slice(BLOG_PATH_PREFIX.length);
  if (!slug || slug.includes("/")) return null;
  if (allowed.size > 0 && !allowed.has(slug)) return null;
  return slug;
}

function cloneEmpty(): PostMetrics {
  return { views: 0, unique: 0, sources: [] };
}

export async function getBlogPostsMetrics(
  slugs: string[],
): Promise<Map<string, PostMetrics>> {
  const uniqueSlugs = [
    ...new Set(slugs.map((slug) => slug.trim()).filter(Boolean)),
  ];
  const result = new Map<string, PostMetrics>();
  for (const slug of uniqueSlugs) result.set(slug, cloneEmpty());
  if (uniqueSlugs.length === 0) return result;

  await ensureAnalyticsSchema();
  const db = getDb();
  const paths = uniqueSlugs.flatMap(pathsForSlug);
  const allowed = new Set(uniqueSlugs);
  const canonicalPath = sql<string>`rtrim(${pageViews.path}, '/')`;

  const [viewRows, sourceRows] = await Promise.all([
    db
      .select({
        path: canonicalPath.as("canonical_path"),
        views: count(),
        unique: countDistinct(pageViews.sessionId),
      })
      .from(pageViews)
      .where(inArray(pageViews.path, paths))
      .groupBy(canonicalPath),
    db
      .select({
        path: canonicalPath.as("canonical_path"),
        referrer: pageViews.referrer,
        value: count(),
      })
      .from(pageViews)
      .where(inArray(pageViews.path, paths))
      .groupBy(canonicalPath, pageViews.referrer),
  ]);

  for (const row of viewRows) {
    const slug = slugFromCanonicalPath(row.path, allowed);
    if (!slug) continue;
    result.set(slug, {
      views: row.views ?? 0,
      unique: row.unique ?? 0,
      sources: [],
    });
  }

  const sourcesBySlug = new Map<string, Array<{ name: string; count: number }>>();
  for (const row of sourceRows) {
    const slug = slugFromCanonicalPath(row.path, allowed);
    if (!slug) continue;
    const list = sourcesBySlug.get(slug) ?? [];
    list.push({
      name: classifyTrafficSource(row.referrer),
      count: row.value,
    });
    sourcesBySlug.set(slug, list);
  }

  for (const [slug, sources] of sourcesBySlug) {
    const current = result.get(slug) ?? cloneEmpty();
    current.sources = aggregateNamedCounts(sources, SOURCE_LIMIT);
    result.set(slug, current);
  }

  return result;
}

export async function getBlogPostMetrics(slug: string): Promise<PostMetrics> {
  const trimmed = slug.trim();
  if (!trimmed) return { ...EMPTY_POST_METRICS, sources: [] };
  try {
    const map = await getBlogPostsMetrics([trimmed]);
    return map.get(trimmed) ?? cloneEmpty();
  } catch (error) {
    console.error("[blog-metrics] failed:", error);
    return cloneEmpty();
  }
}
