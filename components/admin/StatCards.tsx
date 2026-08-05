import type { OverviewStats } from "@/lib/analytics/types";

const CARDS: Array<{ key: keyof OverviewStats; label: string; format?: "percent" }> = [
  { key: "totalUses", label: "Total uses" },
  { key: "usesToday", label: "Uses today" },
  { key: "usesThisWeek", label: "Uses this week" },
  { key: "usesThisMonth", label: "Uses this month" },
  { key: "uniqueVisitors", label: "Unique visitors" },
  { key: "averageDailyUses", label: "Avg daily uses" },
  { key: "successRate", label: "Success rate", format: "percent" },
];

export default function StatCards({
  stats,
  loading,
}: {
  stats: OverviewStats | null;
  loading?: boolean;
}) {
  return (
    <div className="admin-stat-grid">
      {CARDS.map((card) => {
        const raw = stats?.[card.key];
        let display = "—";
        if (!loading && typeof raw === "number") {
          display =
            card.format === "percent"
              ? `${raw}%`
              : Number.isInteger(raw)
                ? raw.toLocaleString()
                : raw.toLocaleString(undefined, { maximumFractionDigits: 1 });
        }
        return (
          <article key={card.key} className="admin-stat-card">
            <p className="admin-stat-card__label">{card.label}</p>
            <p className="admin-stat-card__value">
              {loading ? <span className="admin-skeleton" /> : display}
            </p>
          </article>
        );
      })}
    </div>
  );
}
