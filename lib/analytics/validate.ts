import { getToolBySlug } from "@/data/tools";
import type {
  AnalyticsEventType,
  FeatureKind,
  TrackToolUsagePayload,
} from "@/lib/analytics/types";

const FEATURE_KINDS = new Set<FeatureKind>(["upload", "download", "dwell"]);

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isNonEmptyString(value: unknown, max: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max;
}

export type ValidatedTrackEvent =
  | { ok: true; data: TrackToolUsagePayload & { toolName: string } }
  | { ok: false; error: string };

export function validateTrackPayload(body: unknown): ValidatedTrackEvent {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid JSON body." };
  }

  const raw = body as Record<string, unknown>;
  const toolId = typeof raw.toolId === "string" ? raw.toolId.trim() : "";
  if (!toolId || toolId.length > 120) {
    return { ok: false, error: "Invalid toolId." };
  }

  const tool = getToolBySlug(toolId);
  if (!tool || tool.status !== "ready") {
    return { ok: false, error: "Unknown tool." };
  }

  if (typeof raw.success !== "boolean") {
    return { ok: false, error: "Invalid success flag." };
  }

  if (!isNonEmptyString(raw.eventId, 64) || !UUID_RE.test(raw.eventId)) {
    return { ok: false, error: "Invalid eventId." };
  }

  if (!isNonEmptyString(raw.sessionId, 80) || !UUID_RE.test(raw.sessionId)) {
    return { ok: false, error: "Invalid sessionId." };
  }

  // Public ingest accepts tool_usage plus a small feature set (upload/download/dwell).
  let eventType: AnalyticsEventType = "tool_usage";
  if (raw.eventType === "feature") {
    eventType = "feature";
  } else if (raw.eventType !== undefined && raw.eventType !== "tool_usage") {
    return { ok: false, error: "Invalid eventType." };
  }

  let referrer: string | undefined;
  if (raw.referrer !== undefined && raw.referrer !== null) {
    if (typeof raw.referrer !== "string" || raw.referrer.length > 500) {
      return { ok: false, error: "Invalid referrer." };
    }
    const trimmed = raw.referrer.slice(0, 500);
    referrer = /^[=+\-@]/.test(trimmed) ? trimmed.slice(1) : trimmed;
  }

  let metadata: TrackToolUsagePayload["metadata"];
  if (raw.metadata !== undefined && raw.metadata !== null) {
    if (typeof raw.metadata !== "object" || Array.isArray(raw.metadata)) {
      return { ok: false, error: "Invalid metadata." };
    }
    const entries = Object.entries(raw.metadata as Record<string, unknown>);
    if (entries.length > 20) {
      return { ok: false, error: "Metadata too large." };
    }
    metadata = {};
    for (const [key, value] of entries) {
      if (key.length > 40) {
        return { ok: false, error: "Invalid metadata key." };
      }
      if (
        value !== null &&
        typeof value !== "string" &&
        typeof value !== "number" &&
        typeof value !== "boolean"
      ) {
        return { ok: false, error: "Invalid metadata value." };
      }
      if (typeof value === "string" && value.length > 200) {
        return { ok: false, error: "Metadata value too long." };
      }
      metadata[key] = value as string | number | boolean | null;
    }
  }

  if (eventType === "feature") {
    const kind = metadata?.kind;
    if (typeof kind !== "string" || !FEATURE_KINDS.has(kind as FeatureKind)) {
      return { ok: false, error: "Invalid feature kind." };
    }
    if (kind === "dwell") {
      const seconds = metadata?.seconds;
      if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds < 3 || seconds > 1800) {
        return { ok: false, error: "Invalid dwell duration." };
      }
    }
  }

  return {
    ok: true,
    data: {
      toolId: tool.slug,
      toolName: tool.name,
      success: raw.success,
      eventId: raw.eventId.trim(),
      sessionId: raw.sessionId.trim(),
      referrer,
      eventType,
      metadata,
    },
  };
}
