import { eq } from "drizzle-orm";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { getAnalyticsClient } from "@/lib/analytics/db";
import { getReadyTools, getToolBySlug, tools as catalogTools } from "@/data/tools";
import * as schema from "@/lib/content/schema";
import { tools } from "@/lib/content/schema";
import type { ContentTool } from "@/lib/content/types";

let db: LibSQLDatabase<typeof schema> | null = null;
let appliedSchemaVersion = 0;
const CONTENT_SCHEMA_VERSION = 2;
let toolsSeeded = false;

export function getContentDb(): LibSQLDatabase<typeof schema> {
  if (!db) {
    db = drizzle(getAnalyticsClient(), { schema });
  }
  return db;
}

export async function ensureContentSchema(): Promise<void> {
  if (appliedSchemaVersion >= CONTENT_SCHEMA_VERSION) {
    await seedContentTools();
    return;
  }

  const client = getAnalyticsClient();
  await client.executeMultiple(`
CREATE TABLE IF NOT EXISTS tools (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT ''
);
CREATE UNIQUE INDEX IF NOT EXISTS tools_slug_unique ON tools (slug);
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  cover_image TEXT,
  content_json TEXT NOT NULL DEFAULT '[]',
  seo_title TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  og_title TEXT NOT NULL DEFAULT '',
  og_description TEXT NOT NULL DEFAULT '',
  og_image TEXT NOT NULL DEFAULT '',
  canonical_url TEXT NOT NULL DEFAULT '',
  robots TEXT NOT NULL DEFAULT 'index,follow',
  schema_type TEXT NOT NULL DEFAULT 'article',
  schema_json TEXT,
  primary_tool_id TEXT REFERENCES tools(id),
  related_tools_json TEXT NOT NULL DEFAULT '[]',
  cta_config_json TEXT NOT NULL DEFAULT '{"positions":["top","bottom"],"labels":{}}',
  status TEXT NOT NULL DEFAULT 'draft',
  published_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS posts_slug_unique ON posts (slug);
CREATE INDEX IF NOT EXISTS posts_status_idx ON posts (status);
CREATE INDEX IF NOT EXISTS posts_published_at_idx ON posts (published_at);
CREATE TABLE IF NOT EXISTS content_images (
  id TEXT PRIMARY KEY NOT NULL,
  filename TEXT NOT NULL,
  mime TEXT NOT NULL,
  bytes BLOB NOT NULL,
  created_at INTEGER NOT NULL
);
`);
  appliedSchemaVersion = CONTENT_SCHEMA_VERSION;
  await seedContentTools();
}

async function seedContentTools(): Promise<void> {
  if (toolsSeeded) return;

  const client = getAnalyticsClient();
  const statements = catalogTools.map((tool) => ({
    sql: `INSERT INTO tools (id, name, slug, description, icon)
VALUES (?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  icon = excluded.icon`,
    args: [
      tool.slug,
      tool.name,
      tool.slug,
      tool.description,
      tool.categories[0] || "",
    ],
  }));

  if (statements.length) {
    await client.batch(statements, "write");
  }
  toolsSeeded = true;
}

export function catalogToolToContentTool(slug: string): ContentTool | null {
  const tool = getToolBySlug(slug);
  if (!tool) return null;
  return {
    id: tool.slug,
    name: tool.name,
    slug: tool.slug,
    description: tool.description,
    icon: tool.categories[0] || "",
    href: tool.href,
  };
}

export function listCatalogContentTools(): ContentTool[] {
  return getReadyTools().map((tool) => ({
    id: tool.slug,
    name: tool.name,
    slug: tool.slug,
    description: tool.description,
    icon: tool.categories[0] || "",
    href: tool.href,
  }));
}

export async function listContentTools(): Promise<ContentTool[]> {
  await ensureContentSchema();
  try {
    const rows = await getContentDb().select().from(tools).orderBy(tools.name);
    if (rows.length) {
      return rows.map((row) => {
        const catalog = getToolBySlug(row.slug);
        return {
          id: row.id,
          name: row.name,
          slug: row.slug,
          description: row.description,
          icon: row.icon,
          href: catalog?.href || `/${row.slug}`,
        };
      });
    }
  } catch (error) {
    console.error("[content] list tools failed:", error);
  }
  return listCatalogContentTools();
}

export async function getContentTool(id: string): Promise<ContentTool | null> {
  const fromCatalog = catalogToolToContentTool(id);
  if (fromCatalog) return fromCatalog;

  await ensureContentSchema();
  const [row] = await getContentDb()
    .select()
    .from(tools)
    .where(eq(tools.id, id))
    .limit(1);
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    icon: row.icon,
    href: `/${row.slug}`,
  };
}
