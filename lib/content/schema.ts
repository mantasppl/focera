import { index, sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

export const tools = sqliteTable(
  "tools",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description").notNull().default(""),
    icon: text("icon").notNull().default(""),
  },
  (table) => [
    uniqueIndex("tools_slug_unique").on(table.slug),
  ],
);

export type ToolRow = typeof tools.$inferSelect;
export type NewToolRow = typeof tools.$inferInsert;

export const posts = sqliteTable(
  "posts",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    coverImage: text("cover_image"),
    contentJson: text("content_json").notNull().default("[]"),
    seoTitle: text("seo_title").notNull().default(""),
    metaDescription: text("meta_description").notNull().default(""),
    ogTitle: text("og_title").notNull().default(""),
    ogDescription: text("og_description").notNull().default(""),
    ogImage: text("og_image").notNull().default(""),
    canonicalUrl: text("canonical_url").notNull().default(""),
    robots: text("robots").notNull().default("index,follow"),
    schemaType: text("schema_type").notNull().default("article"),
    schemaJson: text("schema_json"),
    primaryToolId: text("primary_tool_id").references(() => tools.id),
    relatedToolsJson: text("related_tools_json").notNull().default("[]"),
    ctaConfigJson: text("cta_config_json").notNull().default(
      '{"positions":["top","bottom"],"labels":{}}',
    ),
    status: text("status").notNull().default("draft"),
    publishedAt: integer("published_at"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("posts_slug_unique").on(table.slug),
    index("posts_status_idx").on(table.status),
    index("posts_published_at_idx").on(table.publishedAt),
  ],
);

export type PostRow = typeof posts.$inferSelect;
export type NewPostRow = typeof posts.$inferInsert;
