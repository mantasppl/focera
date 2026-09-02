import {
  index,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

/**
 * Primary analytics fact table.
 *
 * `eventType` + `metadata` keep this future-proof for registered users,
 * API usage, AI tokens, revenue, conversions, and feature analytics
 * without a schema rewrite.
 */
export const toolUsage = sqliteTable(
  "tool_usage",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** Client-generated UUID for idempotent inserts (dedupe). */
    eventId: text("event_id").notNull().unique(),
    /**
     * Discriminator for future event kinds.
     * Current: tool_usage
     * Planned: api_usage | ai_token | revenue | conversion | feature
     */
    eventType: text("event_type").notNull().default("tool_usage"),
    toolId: text("tool_id").notNull(),
    toolName: text("tool_name").notNull(),
    timestamp: integer("timestamp", { mode: "timestamp_ms" }).notNull(),
    sessionId: text("session_id").notNull(),
    /** Reserved for authenticated users later. */
    userId: text("user_id"),
    ipHash: text("ip_hash"),
    country: text("country"),
    browser: text("browser"),
    os: text("os"),
    device: text("device"),
    referrer: text("referrer"),
    success: integer("success", { mode: "boolean" }).notNull().default(true),
    /** JSON blob for tokens, revenue cents, feature keys, etc. */
    metadata: text("metadata"),
  },
  (table) => [
    index("tool_usage_tool_id_idx").on(table.toolId),
    index("tool_usage_timestamp_idx").on(table.timestamp),
    index("tool_usage_session_id_idx").on(table.sessionId),
    index("tool_usage_event_type_idx").on(table.eventType),
    index("tool_usage_tool_time_idx").on(table.toolId, table.timestamp),
    index("tool_usage_success_time_idx").on(table.success, table.timestamp),
  ],
);

export type ToolUsageRow = typeof toolUsage.$inferSelect;
export type NewToolUsageRow = typeof toolUsage.$inferInsert;

export const toolRatings = sqliteTable(
  "tool_ratings",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    toolId: text("tool_id").notNull(),
    toolName: text("tool_name").notNull(),
    stars: integer("stars").notNull(),
    comment: text("comment"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    sessionId: text("session_id"),
    ipHash: text("ip_hash"),
  },
  (table) => [
    index("tool_ratings_tool_id_idx").on(table.toolId),
    index("tool_ratings_created_at_idx").on(table.createdAt),
    index("tool_ratings_tool_time_idx").on(table.toolId, table.createdAt),
  ],
);

export type ToolRatingRow = typeof toolRatings.$inferSelect;
export type NewToolRatingRow = typeof toolRatings.$inferInsert;

export const pageViews = sqliteTable(
  "page_views",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    eventId: text("event_id").notNull().unique(),
    sessionId: text("session_id").notNull(),
    timestamp: integer("timestamp", { mode: "timestamp_ms" }).notNull(),
    path: text("path").notNull(),
    referrer: text("referrer"),
    ipHash: text("ip_hash"),
    country: text("country"),
    browser: text("browser"),
    os: text("os"),
    device: text("device"),
  },
  (table) => [
    index("page_views_timestamp_idx").on(table.timestamp),
    index("page_views_session_id_idx").on(table.sessionId),
    index("page_views_session_time_idx").on(table.sessionId, table.timestamp),
  ],
);

export type PageViewRow = typeof pageViews.$inferSelect;
export type NewPageViewRow = typeof pageViews.$inferInsert;

export const visitorPresence = sqliteTable(
  "visitor_presence",
  {
    sessionId: text("session_id").primaryKey(),
    firstSeen: integer("first_seen", { mode: "timestamp_ms" }).notNull(),
    lastSeen: integer("last_seen", { mode: "timestamp_ms" }).notNull(),
    path: text("path"),
    ipHash: text("ip_hash"),
    country: text("country"),
    browser: text("browser"),
    os: text("os"),
    device: text("device"),
  },
  (table) => [index("visitor_presence_last_seen_idx").on(table.lastSeen)],
);

export type VisitorPresenceRow = typeof visitorPresence.$inferSelect;
export type NewVisitorPresenceRow = typeof visitorPresence.$inferInsert;
