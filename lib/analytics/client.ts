"use client";

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

const SESSION_KEY = "focera_analytics_session";
const ENDPOINT = "/api/analytics/event";

function randomId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getAnalyticsSessionId(): string {
  if (typeof window === "undefined") return randomId();
  try {
    const existing = window.localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const next = randomId();
    window.localStorage.setItem(SESSION_KEY, next);
    return next;
  } catch {
    return randomId();
  }
}

type TrackOptions = {
  toolId: string;
  success: boolean;
  metadata?: Record<string, string | number | boolean | null>;
  /** Optional stable id for this completion — defaults to a new UUID. */
  eventId?: string;
};

/**
 * Fire-and-forget tool usage event. Never awaits in the tool hot path;
 * uses sendBeacon when available, otherwise a keepalive fetch.
 */
export function trackToolUsage(options: TrackOptions): string {
  const eventId = options.eventId || randomId();

  if (typeof window === "undefined") return eventId;

  const body = JSON.stringify({
    toolId: options.toolId,
    success: options.success,
    eventId,
    sessionId: getAnalyticsSessionId(),
    referrer: document.referrer || undefined,
    eventType: "tool_usage",
    metadata: options.metadata,
  });

  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      const queued = navigator.sendBeacon(ENDPOINT, blob);
      if (queued) return eventId;
    }
  } catch {
    // fall through to fetch
  }

  void fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // best-effort
  });

  return eventId;
}

type ToolAnalyticsContextValue = {
  toolId: string;
  trackSuccess: (metadata?: TrackOptions["metadata"]) => void;
  trackFailure: (metadata?: TrackOptions["metadata"]) => void;
};

const ToolAnalyticsContext = createContext<ToolAnalyticsContextValue | null>(
  null,
);

export function ToolAnalyticsProvider({
  toolId,
  children,
}: {
  toolId: string;
  children: ReactNode;
}) {
  const lastEventRef = useRef<string>("");
  const toolIdRef = useRef(toolId);
  toolIdRef.current = toolId;

  // Prefetch session id so the first track call is snappy.
  useEffect(() => {
    getAnalyticsSessionId();
  }, []);

  const value = useMemo<ToolAnalyticsContextValue>(
    () => ({
      toolId,
      trackSuccess(metadata) {
        const id = toolIdRef.current;
        const key = `${id}:success:${JSON.stringify(metadata ?? null)}`;
        if (lastEventRef.current === key) return;
        lastEventRef.current = key;
        window.setTimeout(() => {
          if (lastEventRef.current === key) lastEventRef.current = "";
        }, 1500);
        trackToolUsage({ toolId: id, success: true, metadata });
      },
      trackFailure(metadata) {
        trackToolUsage({
          toolId: toolIdRef.current,
          success: false,
          metadata,
        });
      },
    }),
    [toolId],
  );

  return createElement(
    ToolAnalyticsContext.Provider,
    { value },
    children,
  );
}

export function useToolAnalytics(): ToolAnalyticsContextValue {
  const ctx = useContext(ToolAnalyticsContext);
  if (!ctx) {
    return {
      toolId: "",
      trackSuccess() {},
      trackFailure() {},
    };
  }
  return ctx;
}
