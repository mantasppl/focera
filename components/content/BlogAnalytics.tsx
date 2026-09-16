"use client";

import { useEffect } from "react";

type BlogAnalyticsProps = {
  slug: string;
  path: string;
};

function sendEvent(payload: Record<string, string>) {
  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/event",
        new Blob([body], { type: "application/json" }),
      );
      return;
    }
    void fetch("/api/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    // ignore analytics failures
  }
}

export function trackToolClick(toolId: string, slug: string) {
  sendEvent({ type: "tool_click", toolId, slug });
}

export default function BlogAnalytics({ slug, path }: BlogAnalyticsProps) {
  useEffect(() => {
    sendEvent({ type: "page_view", slug, path });
  }, [slug, path]);
  return null;
}
