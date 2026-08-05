import { createHash } from "node:crypto";
import { ensureAnalyticsSchema, getDb } from "@/lib/analytics/db";
import { parseUserAgent } from "@/lib/analytics/parse-ua";
import { toolUsage } from "@/lib/analytics/schema";
import type { TrackToolUsagePayload } from "@/lib/analytics/types";

function hashIp(ip: string): string {
  const salt =
    process.env.ANALYTICS_IP_SALT?.trim() ||
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    (process.env.NODE_ENV === "production" ? null : "focera-analytics-dev");
  if (!salt) {
    // Still hash — without a stable salt reuse across deploys is avoided by random salt per process.
    return createHash("sha256")
      .update(`ephemeral:${ip}:${process.pid}`)
      .digest("hex")
      .slice(0, 32);
  }
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

function extractIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  return realIp || null;
}

function extractCountry(request: Request): string | null {
  // Vercel / Cloudflare common headers
  return (
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-country-code") ||
    null
  );
}

export async function recordToolUsageEvent(
  payload: TrackToolUsagePayload & { toolName: string },
  request: Request,
): Promise<{ inserted: boolean }> {
  await ensureAnalyticsSchema();

  const ip = extractIp(request);
  const ua = parseUserAgent(request.headers.get("user-agent"));
  const country = extractCountry(request);

  try {
    await getDb().insert(toolUsage).values({
      eventId: payload.eventId,
      eventType: payload.eventType || "tool_usage",
      toolId: payload.toolId,
      toolName: payload.toolName,
      timestamp: new Date(),
      sessionId: payload.sessionId,
      ipHash: ip ? hashIp(ip) : null,
      country: country && country !== "XX" ? country.toUpperCase() : null,
      browser: ua.browser,
      os: ua.os,
      device: ua.device,
      referrer: payload.referrer?.slice(0, 500) || null,
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
