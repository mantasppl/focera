import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "@/lib/analytics/schema";

let client: Client | null = null;
let db: LibSQLDatabase<typeof schema> | null = null;
let bootstrapped = false;

function resolveDatabaseUrl(): string {
  const configured = process.env.DATABASE_URL?.trim();
  if (configured) return configured;
  // Local default — file is gitignored under /data
  return "file:./data/analytics.db";
}

export function getAnalyticsClient(): Client {
  if (!client) {
    const url = resolveDatabaseUrl();
    const authToken = process.env.DATABASE_AUTH_TOKEN?.trim();
    client = createClient(authToken ? { url, authToken } : { url });
  }
  return client;
}

export function getDb(): LibSQLDatabase<typeof schema> {
  if (!db) {
    db = drizzle(getAnalyticsClient(), { schema });
  }
  return db;
}

/** Create tables/indexes if missing (safe to call on every request once). */
export async function ensureAnalyticsSchema(): Promise<void> {
  if (bootstrapped) return;
  const c = getAnalyticsClient();
  await c.executeMultiple(`
CREATE TABLE IF NOT EXISTS tool_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL DEFAULT 'tool_usage',
  tool_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  session_id TEXT NOT NULL,
  user_id TEXT,
  ip_hash TEXT,
  country TEXT,
  browser TEXT,
  os TEXT,
  device TEXT,
  referrer TEXT,
  success INTEGER NOT NULL DEFAULT 1,
  metadata TEXT
);
CREATE INDEX IF NOT EXISTS tool_usage_tool_id_idx ON tool_usage (tool_id);
CREATE INDEX IF NOT EXISTS tool_usage_timestamp_idx ON tool_usage (timestamp);
CREATE INDEX IF NOT EXISTS tool_usage_session_id_idx ON tool_usage (session_id);
CREATE INDEX IF NOT EXISTS tool_usage_event_type_idx ON tool_usage (event_type);
CREATE INDEX IF NOT EXISTS tool_usage_tool_time_idx ON tool_usage (tool_id, timestamp);
CREATE INDEX IF NOT EXISTS tool_usage_success_time_idx ON tool_usage (success, timestamp);
`);
  bootstrapped = true;
}

export function isAnalyticsConfigured(): boolean {
  // Always available with local file fallback; Turso remote needs URL + token.
  const url = resolveDatabaseUrl();
  if (url.startsWith("libsql://") || url.startsWith("https://")) {
    return Boolean(process.env.DATABASE_AUTH_TOKEN?.trim() || process.env.DATABASE_URL);
  }
  return true;
}
