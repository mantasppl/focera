"use client";

import type { SiteTrafficStats } from "@/lib/analytics/types";

function formatCount(value: number | undefined, loading: boolean): string {
  if (loading || typeof value !== "number") return "—";
  return value.toLocaleString();
}

const PERIODS: Array<{
  key: "today" | "week" | "month" | "allTime";
  label: string;
  hint: string;
}> = [
  { key: "today", label: "Today", hint: "Since midnight" },
  { key: "week", label: "This week", hint: "Mon–now" },
  { key: "month", label: "This month", hint: "1st–now" },
  { key: "allTime", label: "All time", hint: "Every recorded visit" },
];

export default function TrafficCards({
  stats,
  loading,
}: {
  stats: SiteTrafficStats | null;
  loading?: boolean;
}) {
  const windowSeconds = stats?.onlineWindowSeconds ?? 300;
  const windowMinutes = Math.max(1, Math.round(windowSeconds / 60));

  return (
    <section className="admin-traffic" aria-label="Site traffic">
      <article className="admin-online-card">
        <p className="admin-stat-card__label">
          <span className="admin-online-card__dot" aria-hidden="true" />
          Online now
        </p>
        <p className="admin-stat-card__value">
          {loading && !stats ? (
            <span className="admin-skeleton" />
          ) : (
            formatCount(stats?.onlineNow, false)
          )}
        </p>
        <p className="admin-online-card__hint">
          Unique visitors active in the last {windowMinutes} minutes
        </p>
      </article>

      <div className="admin-traffic-grid">
        {PERIODS.map((period) => {
          const data = stats?.[period.key];
          return (
            <article key={period.key} className="admin-stat-card admin-traffic-card">
              <p className="admin-stat-card__label">{period.label}</p>
              <p className="admin-stat-card__value">
                {loading && !stats ? (
                  <span className="admin-skeleton" />
                ) : (
                  formatCount(data?.views, false)
                )}
              </p>
              <p className="admin-traffic-card__unique">
                {loading && !stats
                  ? "—"
                  : `${formatCount(data?.unique, false)} unique`}
              </p>
              <p className="admin-traffic-card__hint">{period.hint}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
