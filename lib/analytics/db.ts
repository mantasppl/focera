import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "@/lib/analytics/schema";

let client: Client | null = null;
let db: LibSQLDatabase<typeof schema> | null = null;
let bootstrapped = false;
let resolvedUrl: string | null = null;

function isServerlessRuntime(): boolean {
  return Boolean(
    process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.NETLIFY,
  );
}

function resolveDatabaseUrl(): string {
  const configured = process.env.DATABASE_URL?.trim();

  // Remote libSQL / Turso — preferred for production.
  if (
    configured &&
    (configured.startsWith("libsql://") ||
      configured.startsWith("https://") ||
      configured.startsWith("http://"))
  ) {
    return configured;
  }

  // file: URLs are not durable (and often not writable) on Vercel/serverless.
  if (isServerlessRuntime()) {
    if (configured?.startsWith("file:")) {
      console.warn(
        "[analytics] file: DATABASE_URL cannot persist on serverless. Using /tmp fallback. Set a Turso libsql:// URL + DATABASE_AUTH_TOKEN for durable analytics.",
      );
    } else if (!configured) {
      console.warn(
        "[analytics] No DATABASE_URL set on serverless. Using /tmp fallback. Set a Turso libsql:// URL + DATABASE_AUTH_TOKEN for durable analytics.",
      );
    }
    return "file:/tmp/focera-analytics.db";
  }

  if (configured?.startsWith("file:")) return configured;
  return "file:./data/analytics.db";
}

/** True when storage is local/tmp and will not survive deploys or cold starts. */
export function isEphemeralAnalyticsStorage(): boolean {
  const url = resolveDatabaseUrl();
  return url.startsWith("file:/tmp") || url.includes("/tmp/");
}

export function getAnalyticsStorageMode(): "remote" | "local" | "ephemeral" {
  const url = resolveDatabaseUrl();
  if (
    url.startsWith("libsql://") ||
    url.startsWith("https://") ||
    url.startsWith("http://")
  ) {
    return "remote";
  }
  if (isEphemeralAnalyticsStorage()) return "ephemeral";
  return "local";
}

function ensureLocalFileParent(url: string) {
  if (!url.startsWith("file:") || url.startsWith("file:/tmp")) return;
  const filePath = url.replace(/^file:/, "");
  try {
    mkdirSync(dirname(filePath), { recursive: true });
  } catch {
    // Directory may already exist or be unwritable; createClient will surface errors.
  }
}

export function getAnalyticsClient(): Client {
  if (!client) {
    const url = resolveDatabaseUrl();
    resolvedUrl = url;
    ensureLocalFileParent(url);
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
  const url = resolvedUrl ?? resolveDatabaseUrl();
  if (url.startsWith("libsql://") || url.startsWith("https://")) {
    return Boolean(process.env.DATABASE_AUTH_TOKEN?.trim());
  }
  return true;
}
