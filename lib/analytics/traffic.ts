import { and, count, countDistinct, gte, lt, lte } from "drizzle-orm";
import { ensureAnalyticsSchema, getDb } from "@/lib/analytics/db";
import { parseUserAgent } from "@/lib/analytics/parse-ua";
import { isAdminClientPath } from "@/lib/analytics/paths";
import {
  extractRequestCountry,
  extractRequestIp,
  hashVisitorIp,
  isBotUserAgent,
} from "@/lib/analytics/request-meta";
import { pageViews, visitorPresence } from "@/lib/analytics/schema";
import {
  endOfZonedDay,
  startOfZonedDay,
  startOfZonedIsoWeek,
  startOfZonedMonth,
} from "@/lib/analytics/timezone";
import {
  ONLINE_WINDOW_MS,
  type SiteTrafficStats,
  type TrafficPeriodStats,
} from "@/lib/analytics/types";

const PRESENCE_PRUNE_MS = 60 * 60 * 1000;
const MAX_PATH_LENGTH = 200;

export type PresenceKind = "view" | "heartbeat";

export type RecordPresenceInput = {
  sessionId: string;
  path: string;
  referrer?: string;
  kind: PresenceKind;
};

function sanitizePath(raw: string): string | null {
  const trimmed = raw.trim().split("?")[0]?.split("#")[0] ?? "";
  if (!trimmed.startsWith("/")) return null;
  const collapsed = trimmed.replace(/\/{2,}/g, "/");
  if (collapsed.length > MAX_PATH_LENGTH) return collapsed.slice(0, MAX_PATH_LENGTH);
  return collapsed || "/";
}

function sanitizeReferrer(raw: string | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.slice(0, 500);
  return /^[=+\-@]/.test(trimmed) ? trimmed.slice(1) : trimmed;
}

export async function recordSitePresence(
  input: RecordPresenceInput,
  request: Request,
): Promise<{ recorded: boolean }> {
  if (isBotUserAgent(request.headers.get("user-agent"))) {
    return { recorded: false };
  }

  const path = sanitizePath(input.path);
  if (!path || isAdminClientPath(path)) {
    return { recorded: false };
  }

  await ensureAnalyticsSchema();
  const db = getDb();
  const now = new Date();
  const ip = extractRequestIp(request);
  const ua = parseUserAgent(request.headers.get("user-agent"));
  const country = extractRequestCountry(request);
  const ipHash = ip ? hashVisitorIp(ip) : null;
  const countryCode = country && country !== "XX" ? country.toUpperCase() : null;

  await db
    .insert(visitorPresence)
    .values({
      sessionId: input.sessionId,
      firstSeen: now,
      lastSeen: now,
      path,
      ipHash,
      country: countryCode,
      browser: ua.browser,
      os: ua.os,
      device: ua.device,
    })
    .onConflictDoUpdate({
      target: visitorPresence.sessionId,
      set: {
        lastSeen: now,
        path,
      },
    });

  if (input.kind === "view") {
    try {
      await db.insert(pageViews).values({
        eventId: crypto.randomUUID(),
        sessionId: input.sessionId,
        timestamp: now,
        path,
        referrer: sanitizeReferrer(input.referrer),
        ipHash,
        country: countryCode,
        browser: ua.browser,
        os: ua.os,
        device: ua.device,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (
        !message.includes("UNIQUE") &&
        !message.includes("unique") &&
        !message.includes("SQLITE_CONSTRAINT")
      ) {
        throw error;
      }
    }
  }

  if (Math.random() < 0.02) {
    const cutoff = new Date(Date.now() - PRESENCE_PRUNE_MS);
    void db
      .delete(visitorPresence)
      .where(lt(visitorPresence.lastSeen, cutoff))
      .catch(() => {
        // best-effort cleanup
      });
  }

  return { recorded: true };
}

async function periodStats(
  start?: Date,
  end?: Date,
): Promise<TrafficPeriodStats> {
  const db = getDb();
  const filters = [];
  if (start) filters.push(gte(pageViews.timestamp, start));
  if (end) filters.push(lte(pageViews.timestamp, end));

  const [row] = await db
    .select({
      views: count(),
      unique: countDistinct(pageViews.sessionId),
    })
    .from(pageViews)
    .where(filters.length ? and(...filters) : undefined);

  return {
    views: row?.views ?? 0,
    unique: row?.unique ?? 0,
  };
}

export async function getSiteTrafficStats(): Promise<SiteTrafficStats> {
  await ensureAnalyticsSchema();
  const db = getDb();
  const now = new Date();
  const todayStart = startOfZonedDay(now);
  const todayEnd = endOfZonedDay(now);
  const weekStart = startOfZonedIsoWeek(now);
  const monthStart = startOfZonedMonth(now);
  const onlineSince = new Date(Date.now() - ONLINE_WINDOW_MS);

  const [onlineRow, today, week, month, allTime] = await Promise.all([
    db
      .select({ value: count() })
      .from(visitorPresence)
      .where(gte(visitorPresence.lastSeen, onlineSince))
      .then((rows) => rows[0]),
    periodStats(todayStart, todayEnd),
    periodStats(weekStart, todayEnd),
    periodStats(monthStart, todayEnd),
    periodStats(),
  ]);

  return {
    onlineNow: onlineRow?.value ?? 0,
    onlineWindowSeconds: ONLINE_WINDOW_MS / 1000,
    today,
    week,
    month,
    allTime,
  };
}
