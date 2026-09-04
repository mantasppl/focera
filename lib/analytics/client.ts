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
import { PRODUCT_DOWNLOAD_EVENT } from "@/lib/ratings/notify";
import {
  clickIdReferrer,
  isOwnSiteReferrer,
  referrerFromUtmSource,
} from "@/lib/analytics/source";
import type { AnalyticsEventType } from "@/lib/analytics/types";

const SESSION_KEY = "focera_analytics_session";
const FIRST_TOUCH_KEY = "focera_traffic_source";
const ENDPOINT = "/api/analytics/event";
const PAGEVIEW_ENDPOINT = "/api/analytics/pageview";
const SEARCH_ENDPOINT = "/api/analytics/search";
const HEARTBEAT_MS = 25_000;
const MIN_DWELL_SECONDS = 3;
const MAX_DWELL_SECONDS = 1800;

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

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let lastView = { path: "", at: 0 };

function landingReferrer(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const params = new URLSearchParams(window.location.search);
  const utm =
    params.get("utm_source")?.trim() ||
    params.get("ref")?.trim() ||
    "";
  if (utm) return referrerFromUtmSource(utm);
  const fromClickId = clickIdReferrer(params);
  if (fromClickId) return fromClickId;
  const referrer = document.referrer?.trim() || "";
  if (referrer && !isOwnSiteReferrer(referrer)) return referrer.slice(0, 500);
  return undefined;
}

/** First-touch source for this browser tab (UTM, click id, or external referrer). */
function getFirstTouchReferrer(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const existing = window.sessionStorage.getItem(FIRST_TOUCH_KEY);
    if (existing === "") return undefined;
    if (existing) return existing;
  } catch {
    // private mode / blocked storage
  }

  const captured = landingReferrer() || "";
  try {
    window.sessionStorage.setItem(FIRST_TOUCH_KEY, captured);
  } catch {
    // ignore
  }
  return captured || undefined;
}

function postPresence(kind: "view" | "heartbeat", path: string) {
  if (typeof window === "undefined") return;
  const sessionId = getAnalyticsSessionId();
  if (!UUID_RE.test(sessionId)) return;

  const firstTouch = getFirstTouchReferrer();
  const body = JSON.stringify({
    sessionId,
    path,
    referrer: document.referrer || firstTouch || undefined,
    kind,
  });

  void fetch(PAGEVIEW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // best-effort
  });
}

export function trackSitePageView(path: string) {
  if (typeof window === "undefined") return;
  const now = Date.now();
  if (lastView.path === path && now - lastView.at < 1500) return;
  lastView = { path, at: now };
  postPresence("view", path);
}

export function trackSiteHeartbeat(path: string) {
  if (typeof window === "undefined") return;
  if (document.visibilityState !== "visible") return;
  postPresence("heartbeat", path);
}

export function useSiteTrafficTracker(path: string | null) {
  const pathRef = useRef(path);
  pathRef.current = path;

  useEffect(() => {
    if (!path) return;

    trackSitePageView(path);

    const tick = () => {
      const current = pathRef.current;
      if (current) trackSiteHeartbeat(current);
    };

    const interval = window.setInterval(tick, HEARTBEAT_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [path]);
}

type TrackOptions = {
  toolId: string;
  success: boolean;
  metadata?: Record<string, string | number | boolean | null>;
  /** Optional stable id for this completion — defaults to a new UUID. */
  eventId?: string;
  eventType?: AnalyticsEventType;
};

/**
 * Fire-and-forget tool usage event. Never awaits in the tool hot path;
 * uses sendBeacon when available, otherwise a keepalive fetch.
 */
export function trackToolUsage(options: TrackOptions): string {
  const eventId = options.eventId || randomId();

  if (typeof window === "undefined") return eventId;

  const firstTouch = getFirstTouchReferrer();
  const body = JSON.stringify({
    toolId: options.toolId,
    success: options.success,
    eventId,
    sessionId: getAnalyticsSessionId(),
    referrer: firstTouch || document.referrer || undefined,
    eventType: options.eventType || "tool_usage",
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

function normalizeSearchQuery(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 80);
}

let lastSearch = { query: "", at: 0 };

/** Record an explicit site search (submit or result click). */
export function trackSiteSearch(query: string): void {
  if (typeof window === "undefined") return;
  const normalized = normalizeSearchQuery(query);
  if (normalized.length < 2) return;

  const now = Date.now();
  if (lastSearch.query === normalized && now - lastSearch.at < 2000) return;
  lastSearch = { query: normalized, at: now };

  const sessionId = getAnalyticsSessionId();
  if (!UUID_RE.test(sessionId)) return;

  const body = JSON.stringify({ sessionId, query: normalized });
  void fetch(SEARCH_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // best-effort
  });
}

type ToolAnalyticsContextValue = {
  toolId: string;
  trackSuccess: (metadata?: TrackOptions["metadata"]) => void;
  trackFailure: (metadata?: TrackOptions["metadata"]) => void;
};

const ToolAnalyticsContext = createContext<ToolAnalyticsContextValue | null>(
  null,
);

function trackFeature(
  toolId: string,
  kind: "upload" | "download" | "dwell",
  extra?: Record<string, string | number | boolean | null>,
) {
  if (!toolId) return;
  trackToolUsage({
    toolId,
    success: true,
    eventType: "feature",
    metadata: { kind, ...extra },
  });
}

export function ToolAnalyticsProvider({
  toolId,
  children,
}: {
  toolId: string;
  children: ReactNode;
}) {
  const lastEventRef = useRef<string>("");
  const lastFunnelRef = useRef({ upload: 0, download: 0 });
  const toolIdRef = useRef(toolId);
  toolIdRef.current = toolId;

  // Prefetch session id and first-touch source so the first track call is snappy.
  useEffect(() => {
    getAnalyticsSessionId();
    getFirstTouchReferrer();
  }, []);

  useEffect(() => {
    function recordFunnel(kind: "upload" | "download") {
      const now = Date.now();
      if (now - lastFunnelRef.current[kind] < 1500) return;
      lastFunnelRef.current[kind] = now;
      trackFeature(toolIdRef.current, kind);
    }

    function onDownload() {
      recordFunnel("download");
    }

    function onFileChange(event: Event) {
      const target = event.target;
      if (
        target instanceof HTMLInputElement &&
        target.type === "file" &&
        target.files &&
        target.files.length > 0
      ) {
        recordFunnel("upload");
      }
    }

    function onDrop(event: DragEvent) {
      if (event.dataTransfer?.files?.length) {
        recordFunnel("upload");
      }
    }

    window.addEventListener(PRODUCT_DOWNLOAD_EVENT, onDownload);
    document.addEventListener("change", onFileChange, true);
    document.addEventListener("drop", onDrop, true);
    return () => {
      window.removeEventListener(PRODUCT_DOWNLOAD_EVENT, onDownload);
      document.removeEventListener("change", onFileChange, true);
      document.removeEventListener("drop", onDrop, true);
    };
  }, [toolId]);

  useEffect(() => {
    let visibleStarted = Date.now();
    let accumulated = 0;
    let sent = false;

    function flushVisible() {
      if (document.visibilityState === "visible" && visibleStarted) {
        accumulated += Date.now() - visibleStarted;
        visibleStarted = 0;
      }
    }

    function sendDwell() {
      if (sent) return;
      flushVisible();
      const seconds = Math.round(accumulated / 1000);
      if (seconds < MIN_DWELL_SECONDS) return;
      sent = true;
      trackFeature(toolIdRef.current, "dwell", {
        seconds: Math.min(seconds, MAX_DWELL_SECONDS),
      });
    }

    function onVisibility() {
      if (document.visibilityState === "hidden") {
        flushVisible();
      } else if (!visibleStarted) {
        visibleStarted = Date.now();
      }
    }

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", sendDwell);
    return () => {
      sendDwell();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", sendDwell);
    };
  }, [toolId]);

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
