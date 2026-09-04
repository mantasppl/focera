"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import BreakdownList from "@/components/admin/BreakdownList";
import { useAdminPath } from "@/components/admin/AdminPathContext";
import DateRangeFilter from "@/components/admin/DateRangeFilter";
import Button from "@/components/Button";
import { adminFetch } from "@/lib/admin/csrf-client";
import { formatDurationSeconds } from "@/lib/analytics/format";
import { todayZonedIso } from "@/lib/analytics/timezone";
import type { DatePreset, ToolDetailStats } from "@/lib/analytics/types";

const ACCENT = "#0d9488";
const MUTED = "#94a3b8";

function todayIso(): string {
  return todayZonedIso();
}

export default function ToolDetailDashboard({ toolId }: { toolId: string }) {
  const { api, analyticsPath } = useAdminPath();
  const [preset, setPreset] = useState<DatePreset>("last_30_days");
  const [start, setStart] = useState(todayIso());
  const [end, setEnd] = useState(todayIso());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<ToolDetailStats | null>(null);

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
      try {
        const response = await adminFetch(
          `${api(`/analytics/tools/${encodeURIComponent(toolId)}`)}?${params}`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(body?.error || "Failed to load tool stats.");
        }
        const json = (await response.json()) as { detail: ToolDetailStats };
        setDetail(json.detail);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to load tool stats.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [toolId, preset, start, end, api]);

  async function downloadExport(format: "csv" | "xlsx") {
    const response = await adminFetch(api("/analytics/export"), {
      method: "POST",
      body: JSON.stringify({
        format,
        preset,
        toolId,
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
    const filename = match?.[1] || `focera-analytics-${toolId}.${format}`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-detail-head">
        <Link href={analyticsPath} className="admin-back">
          ← All tools
        </Link>
        <div className="admin-detail-head__titles">
          <h1 className="admin-title">{detail?.toolName || toolId}</h1>
          <p className="admin-subtitle">{toolId}</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <DateRangeFilter
          preset={preset}
          start={start}
          end={end}
          onPresetChange={setPreset}
          onStartChange={setStart}
          onEndChange={setEnd}
        />
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

      <div className="admin-stat-grid admin-stat-grid--compact">
        <article className="admin-stat-card">
          <p className="admin-stat-card__label">Total uses</p>
          <p className="admin-stat-card__value">
            {loading && !detail ? (
              <span className="admin-skeleton" />
            ) : (
              (detail?.total ?? 0).toLocaleString()
            )}
          </p>
        </article>
        <article className="admin-stat-card">
          <p className="admin-stat-card__label">Success rate</p>
          <p className="admin-stat-card__value">
            {loading && !detail ? (
              <span className="admin-skeleton" />
            ) : (
              `${detail?.successRate ?? 100}%`
            )}
          </p>
        </article>
        <article className="admin-stat-card">
          <p className="admin-stat-card__label">Conversion rate</p>
          <p className="admin-stat-card__value">
            {loading && !detail ? (
              <span className="admin-skeleton" />
            ) : detail?.conversionRate == null ? (
              "—"
            ) : (
              `${detail.conversionRate}%`
            )}
          </p>
          <p className="admin-stat-card__hint">
            {detail?.uploads
              ? `${detail.downloads.toLocaleString()} downloads / ${detail.uploads.toLocaleString()} uploads`
              : "Upload → download"}
          </p>
        </article>
        <article className="admin-stat-card">
          <p className="admin-stat-card__label">Time on tool</p>
          <p className="admin-stat-card__value">
            {loading && !detail ? (
              <span className="admin-skeleton" />
            ) : detail?.avgTimeOnToolSeconds == null ? (
              "—"
            ) : (
              formatDurationSeconds(detail.avgTimeOnToolSeconds)
            )}
          </p>
          <p className="admin-stat-card__hint">Average visible time</p>
        </article>
        <article className="admin-stat-card">
          <p className="admin-stat-card__label">Repeat users</p>
          <p className="admin-stat-card__value">
            {loading && !detail ? (
              <span className="admin-skeleton" />
            ) : (
              (detail?.repeatUsers ?? 0).toLocaleString()
            )}
          </p>
          <p className="admin-stat-card__hint">
            {detail ? `${detail.repeatRate}% of visitors came back` : "Prior visitors who used this tool again"}
          </p>
        </article>
      </div>

      <div className="admin-chart-grid">
        <section className="admin-chart-card">
          <h2 className="admin-chart-card__title">Daily history</h2>
          <div className="admin-chart-card__body">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={detail?.daily ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-grid)" />
                <XAxis dataKey="label" tick={{ fill: MUTED, fontSize: 11 }} minTickGap={24} />
                <YAxis allowDecimals={false} tick={{ fill: MUTED, fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke={ACCENT} fill={ACCENT} fillOpacity={0.18} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="admin-chart-card">
          <h2 className="admin-chart-card__title">Weekly history</h2>
          <div className="admin-chart-card__body">
            {(detail?.weekly.length ?? 0) === 0 ? (
              <div className="admin-empty">No weekly data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={detail?.weekly ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-grid)" />
                  <XAxis dataKey="label" tick={{ fill: MUTED, fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: MUTED, fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill={ACCENT} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="admin-chart-card">
          <h2 className="admin-chart-card__title">Monthly history</h2>
          <div className="admin-chart-card__body">
            {(detail?.monthly.length ?? 0) === 0 ? (
              <div className="admin-empty">No monthly data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={detail?.monthly ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-grid)" />
                  <XAxis dataKey="label" tick={{ fill: MUTED, fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: MUTED, fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill={ACCENT} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="admin-chart-card">
          <h2 className="admin-chart-card__title">Top countries</h2>
          <BreakdownList items={detail?.countries ?? []} empty="No country data yet." />
        </section>

        <section className="admin-chart-card">
          <h2 className="admin-chart-card__title">Top keywords</h2>
          <BreakdownList
            items={detail?.keywords ?? []}
            empty="No keyword data yet."
          />
        </section>

        <section className="admin-chart-card">
          <h2 className="admin-chart-card__title">Device breakdown</h2>
          <BreakdownList items={detail?.devices ?? []} empty="No device data yet." />
        </section>

        <section className="admin-chart-card">
          <h2 className="admin-chart-card__title">Browsers</h2>
          <BreakdownList items={detail?.browsers ?? []} empty="No browser data yet." />
        </section>

        <section className="admin-chart-card">
          <h2 className="admin-chart-card__title">Where users came from</h2>
          <BreakdownList
            items={detail?.sources ?? []}
            empty="No traffic source data yet."
          />
        </section>
      </div>
    </div>
  );
}
