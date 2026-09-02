"use client";

import { useEffect, useState } from "react";
import AnalyticsCharts from "@/components/admin/AnalyticsCharts";
import { useAdminPath } from "@/components/admin/AdminPathContext";
import DateRangeFilter from "@/components/admin/DateRangeFilter";
import StatCards from "@/components/admin/StatCards";
import ToolsTable from "@/components/admin/ToolsTable";
import TrafficCards from "@/components/admin/TrafficCards";
import Button from "@/components/Button";
import { adminFetch } from "@/lib/admin/csrf-client";
import { todayZonedIso } from "@/lib/analytics/timezone";
import type {
  DatePreset,
  NamedCount,
  OverviewStats,
  SiteTrafficStats,
  TimeBucket,
  ToolStatsRow,
} from "@/lib/analytics/types";

type OverviewResponse = {
  ok: boolean;
  storage?: "remote" | "local" | "ephemeral";
  warning?: string;
  stats: OverviewStats;
  tools: ToolStatsRow[];
  charts: {
    daily: TimeBucket[];
    hourly: TimeBucket[];
    topTools: NamedCount[];
    devices: NamedCount[];
    browsers: NamedCount[];
  };
};

type TrafficResponse = {
  ok: boolean;
  traffic: SiteTrafficStats;
};

function todayIso(): string {
  return todayZonedIso();
}

export default function AnalyticsDashboard() {
  const { api } = useAdminPath();
  const [preset, setPreset] = useState<DatePreset>("last_30_days");
  const [start, setStart] = useState(todayIso());
  const [end, setEnd] = useState(todayIso());
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [traffic, setTraffic] = useState<SiteTrafficStats | null>(null);
  const [trafficLoading, setTrafficLoading] = useState(true);
  const [trafficError, setTrafficError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ preset });
      if (preset === "custom") {
        params.set("start", start);
        params.set("end", end);
      }
      if (debouncedSearch) params.set("search", debouncedSearch);

      try {
        const response = await adminFetch(
          `${api("/analytics/overview")}?${params}`,
          { signal: controller.signal },
        );
        if (!active || controller.signal.aborted) return;
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(
            body?.error ||
              `Failed to load analytics (${response.status}).`,
          );
        }
        const json = (await response.json()) as OverviewResponse;
        if (!active || controller.signal.aborted) return;
        setData(json);
      } catch (err) {
        if (!active || controller.signal.aborted) return;
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to load analytics.");
      } finally {
        if (active && !controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [preset, start, end, debouncedSearch, api]);

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
        setTrafficError("");
      } catch (err) {
        if (!active || controller.signal.aborted) return;
        if (err instanceof Error && err.name === "AbortError") return;
        setTrafficError(
          err instanceof Error ? err.message : "Failed to load traffic.",
        );
      } finally {
        if (active) setTrafficLoading(false);
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

  async function downloadExport(format: "csv" | "xlsx") {
    const response = await adminFetch(api("/analytics/export"), {
      method: "POST",
      body: JSON.stringify({
        format,
        preset,
        start: preset === "custom" ? start : undefined,
        end: preset === "custom" ? end : undefined,
      }),
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(body?.error || "Export failed.");
      return;
    }
    const blob = await response.blob();
    const disposition = response.headers.get("Content-Disposition") || "";
    const match = /filename="([^"]+)"/.exec(disposition);
    const filename = match?.[1] || `focera-analytics.${format}`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="admin-dashboard">
      {trafficError ? <div className="admin-error">{trafficError}</div> : null}
      <TrafficCards stats={traffic} loading={trafficLoading && !traffic} />

      <div className="admin-toolbar">
        <DateRangeFilter
          preset={preset}
          start={start}
          end={end}
          onPresetChange={setPreset}
          onStartChange={setStart}
          onEndChange={setEnd}
        />
        <label className="admin-field admin-field--grow">
          <span>Search tools</span>
          <input
            className="ui-field"
            type="search"
            placeholder="Search by name or slug…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <div className="admin-toolbar__export">
          <Button variant="ghost" onClick={() => void downloadExport("csv")}>
            Export CSV
          </Button>
          <Button variant="ghost" onClick={() => void downloadExport("xlsx")}>
            Export Excel
          </Button>
        </div>
      </div>

      {error ? <div className="admin-error">{error}</div> : null}
      {!error && data?.warning ? (
        <div className="admin-error" role="status">
          {data.warning}
        </div>
      ) : null}

      <div className="admin-table-card__head">
        <h2>Tool usage</h2>
        <p>
          Completions for the selected range, with today, last 7 days, and last
          30 days alongside.
        </p>
      </div>

      <StatCards stats={data?.stats ?? null} loading={loading && !data} />

      <AnalyticsCharts
        daily={data?.charts.daily ?? []}
        hourly={data?.charts.hourly ?? []}
        topTools={data?.charts.topTools ?? []}
        devices={data?.charts.devices ?? []}
        browsers={data?.charts.browsers ?? []}
        loading={loading && !data}
      />

      <ToolsTable
        tools={data?.tools ?? []}
        loading={loading && !data}
        query={{
          preset,
          start: preset === "custom" ? start : undefined,
          end: preset === "custom" ? end : undefined,
        }}
      />
    </div>
  );
}
