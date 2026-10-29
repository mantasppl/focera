"use client";

import { useEffect, useState } from "react";
import { useAdminPath } from "@/components/admin/AdminPathContext";
import { adminFetch } from "@/lib/admin/csrf-client";
import type { RepeatPeriod, RepeatSectionStats, RepeatUserCount } from "@/lib/analytics/types";

const PERIODS: Array<{ value: RepeatPeriod; label: string; hint: string }> = [
  { value: "today", label: "Today", hint: "Since midnight" },
  { value: "yesterday", label: "Yesterday", hint: "The previous calendar day" },
  { value: "week", label: "This week", hint: "Monday through now" },
  { value: "month", label: "This month", hint: "The 1st through now" },
  { value: "year", label: "This year", hint: "January 1 through now" },
];

type RepeatResponse = RepeatSectionStats & { ok: boolean };

function formatCount(value: number | undefined, loading: boolean): string {
  if (loading || typeof value !== "number") return "—";
  return value.toLocaleString();
}

function RepeatCard({
  label,
  hint,
  stats,
  loading,
  detail,
}: {
  label: string;
  hint: string;
  stats: RepeatUserCount | null;
  loading: boolean;
  detail: (stats: RepeatUserCount) => string;
}) {
  return (
    <article className="admin-stat-card">
      <p className="admin-stat-card__label">{label}</p>
      <p className="admin-stat-card__value">
        {loading ? (
          <span className="admin-skeleton" />
        ) : (
          formatCount(stats?.repeatUsers, false)
        )}
      </p>
      <p className="admin-traffic-card__unique">
        {loading || !stats ? "—" : detail(stats)}
      </p>
      <p className="admin-stat-card__hint">{hint}</p>
    </article>
  );
}

export default function RepeatUsersSection() {
  const { api } = useAdminPath();
  const [period, setPeriod] = useState<RepeatPeriod>("today");
  const [stats, setStats] = useState<RepeatSectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const response = await adminFetch(
          `${api("/analytics/repeat")}?period=${period}`,
          { signal: controller.signal },
        );
        if (!active || controller.signal.aborted) return;
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(body?.error || "Failed to load repeat users.");
        }
        const json = (await response.json()) as RepeatResponse;
        if (!active) return;
        setStats({
          period: json.period,
          selected: json.selected,
          allTime: json.allTime,
        });
        setError("");
      } catch (err) {
        if (!active || controller.signal.aborted) return;
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to load repeat users.");
      } finally {
        if (active && !controller.signal.aborted) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [api, period]);

  const selectedPeriod = PERIODS.find((item) => item.value === period) ?? PERIODS[0];
  const showSkeleton = loading && !stats;
  const periodPending = loading && stats?.period !== period;

  return (
    <section className="admin-repeat" aria-label="Repeat users">
      <div className="admin-repeat__head">
        <div>
          <h2>Repeat users</h2>
          <p>
            People who used a tool in the period and had visited on an earlier day.
            All time counts everyone who has come back on a later day.
          </p>
        </div>
        <label className="admin-field">
          <span>Period</span>
          <select
            className="ui-field"
            value={period}
            onChange={(event) => setPeriod(event.target.value as RepeatPeriod)}
          >
            {PERIODS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <div className="admin-error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="admin-repeat__grid">
        <RepeatCard
          label={selectedPeriod.label}
          hint={selectedPeriod.hint}
          stats={periodPending ? null : (stats?.selected ?? null)}
          loading={showSkeleton || periodPending}
          detail={(item) =>
            `${item.repeatRate}% of ${item.uniqueVisitors.toLocaleString()} tool users`
          }
        />
        <RepeatCard
          label="All time"
          hint="Came back on a later day. This total stays or grows."
          stats={stats?.allTime ?? null}
          loading={showSkeleton}
          detail={(item) =>
            `${item.repeatRate}% of ${item.uniqueVisitors.toLocaleString()} tool users`
          }
        />
      </div>
    </section>
  );
}
