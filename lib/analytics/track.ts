import { asc, eq } from "drizzle-orm";
import { ensureAnalyticsSchema, getDb } from "@/lib/analytics/db";
import { parseUserAgent } from "@/lib/analytics/parse-ua";
import {
  extractRequestCountry,
  extractRequestIp,
  hashVisitorIp,
} from "@/lib/analytics/request-meta";
import { pageViews, toolUsage } from "@/lib/analytics/schema";
import { isOwnSiteReferrer } from "@/lib/analytics/source";
import type { TrackToolUsagePayload } from "@/lib/analytics/types";

async function resolveStoredReferrer(
  sessionId: string,
  raw: string | undefined,
): Promise<string | null> {
  const trimmed = raw?.trim().slice(0, 500) || null;
  if (trimmed && !isOwnSiteReferrer(trimmed)) return trimmed;

  try {
    const [row] = await getDb()
      .select({ referrer: pageViews.referrer })
      .from(pageViews)
      .where(eq(pageViews.sessionId, sessionId))
      .orderBy(asc(pageViews.timestamp))
      .limit(1);
    const first = row?.referrer?.trim().slice(0, 500) || null;
    if (first && !isOwnSiteReferrer(first)) return first;
  } catch {
    // best-effort attribution
  }

  return trimmed;
}

export async function recordToolUsageEvent(
  payload: TrackToolUsagePayload & { toolName: string },
  request: Request,
): Promise<{ inserted: boolean }> {
  await ensureAnalyticsSchema();

  const ip = extractRequestIp(request);
  const ua = parseUserAgent(request.headers.get("user-agent"));
  const country = extractRequestCountry(request);

  try {
    await getDb().insert(toolUsage).values({
      eventId: payload.eventId,
      eventType: payload.eventType || "tool_usage",
      toolId: payload.toolId,
      toolName: payload.toolName,
      timestamp: new Date(),
      sessionId: payload.sessionId,
      ipHash: ip ? hashVisitorIp(ip) : null,
      country: country && country !== "XX" ? country.toUpperCase() : null,
      browser: ua.browser,
      os: ua.os,
      device: ua.device,
      referrer: await resolveStoredReferrer(payload.sessionId, payload.referrer),
      success: payload.success,
      metadata: payload.metadata ? JSON.stringify(payload.metadata) : null,
    });
    return { inserted: true };
  } catch (error) {
    // Unique eventId → duplicate / retry — treat as success (idempotent).
    const message = error instanceof Error ? error.message : String(error);
    if (
      message.includes("UNIQUE") ||
      message.includes("unique") ||
      message.includes("SQLITE_CONSTRAINT")
    ) {
      return { inserted: false };
    }
    throw error;
  }
}

/**
 * Fire-and-forget server-side tracking for API-backed tools.
 * Never throws to the caller — analytics must not break tool responses.
 */
export function trackToolUsageServer(
  input: {
    toolId: string;
    toolName: string;
    success: boolean;
    sessionId?: string;
    eventId?: string;
    /** Defaults to api_usage so client tool_usage events are not double-counted. */
    eventType?: TrackToolUsagePayload["eventType"];
    metadata?: TrackToolUsagePayload["metadata"];
  },
  request: Request,
): void {
  const eventId = input.eventId || crypto.randomUUID();
  const sessionId = input.sessionId || crypto.randomUUID();

  void recordToolUsageEvent(
    {
      toolId: input.toolId,
      toolName: input.toolName,
      success: input.success,
      eventId,
      sessionId,
      referrer: request.headers.get("referer") || undefined,
      eventType: input.eventType || "api_usage",
      metadata: input.metadata,
    },
    request,
  ).catch(() => {
    // Swallow — analytics is best-effort.
  });
}
