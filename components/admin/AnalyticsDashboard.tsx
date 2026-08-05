"use client";

import { useEffect, useState } from "react";
import AnalyticsCharts from "@/components/admin/AnalyticsCharts";
import { useAdminPath } from "@/components/admin/AdminPathContext";
import DateRangeFilter from "@/components/admin/DateRangeFilter";
import StatCards from "@/components/admin/StatCards";
import ToolsTable from "@/components/admin/ToolsTable";
import Button from "@/components/Button";
import { adminFetch } from "@/lib/admin/csrf-client";
import { todayZonedIso } from "@/lib/analytics/timezone";
import type {
  DatePreset,
  NamedCount,
  OverviewStats,
  TimeBucket,
  ToolStatsRow,
} from "@/lib/analytics/types";

type OverviewResponse = {
  ok: boolean;
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

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
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
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(body?.error || "Failed to load analytics.");
        }
        const json = (await response.json()) as OverviewResponse;
        setData(json);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to load analytics.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [preset, start, end, debouncedSearch, api]);

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
