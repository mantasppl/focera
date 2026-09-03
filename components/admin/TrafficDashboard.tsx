"use client";

import { useEffect, useState } from "react";
import { useAdminPath } from "@/components/admin/AdminPathContext";
import TrafficCards from "@/components/admin/TrafficCards";
import { adminFetch } from "@/lib/admin/csrf-client";
import type { SiteTrafficStats } from "@/lib/analytics/types";

type TrafficResponse = {
  ok: boolean;
  traffic: SiteTrafficStats;
};

export default function TrafficDashboard() {
  const { api } = useAdminPath();
  const [traffic, setTraffic] = useState<SiteTrafficStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadTraffic() {
      try {
        const response = await adminFetch(api("/analytics/traffic"), {
          signal: controller.signal,
        });
        if (!active || controller.signal.aborted) return;
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(body?.error || "Failed to load traffic.");
        }
        const json = (await response.json()) as TrafficResponse;
        if (!active) return;
        setTraffic(json.traffic);
        setError("");
      } catch (err) {
        if (!active || controller.signal.aborted) return;
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to load traffic.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadTraffic();
    const interval = window.setInterval(() => void loadTraffic(), 20_000);
    return () => {
      active = false;
      controller.abort();
      window.clearInterval(interval);
    };
  }, [api]);

  return (
    <div className="admin-dashboard">
      {error ? (
        <div className="admin-error" role="alert">
          {error}
        </div>
      ) : null}
      <TrafficCards stats={traffic} loading={loading && !traffic} />
    </div>
  );
}
