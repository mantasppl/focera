import { formatDurationSeconds } from "@/lib/analytics/format";
import type { OverviewStats } from "@/lib/analytics/types";

type CardFormat = "percent" | "duration" | "nullable-percent";

const CARDS: Array<{
  key: keyof OverviewStats;
  label: string;
  format?: CardFormat;
  hint?: (stats: OverviewStats) => string | null;
}> = [
  { key: "totalUses", label: "Total uses" },
  { key: "usesToday", label: "Uses today" },
  { key: "usesThisWeek", label: "Uses this week" },
  { key: "usesThisMonth", label: "Uses this month" },
  { key: "uniqueVisitors", label: "Unique visitors" },
  {
    key: "repeatUsers",
    label: "Repeat users",
    hint: (stats) =>
      stats.uniqueVisitors > 0
        ? `${stats.repeatRate}% of visitors came back`
        : "Visitors who also came before this range",
  },
  {
    key: "conversionRate",
    label: "Conversion rate",
    format: "nullable-percent",
    hint: (stats) =>
      stats.uploads > 0
        ? `${stats.downloads.toLocaleString()} downloads / ${stats.uploads.toLocaleString()} uploads`
        : "Upload → download (tracked going forward)",
  },
  {
    key: "avgTimeOnToolSeconds",
    label: "Time on tool",
    format: "duration",
    hint: () => "Average visible time on a tool page",
  },
  { key: "averageDailyUses", label: "Avg daily uses" },
  { key: "successRate", label: "Success rate", format: "percent" },
];

function formatValue(
  raw: OverviewStats[keyof OverviewStats] | undefined,
  format?: CardFormat,
): string {
  if (raw === null || raw === undefined) return "—";
  if (typeof raw !== "number") return "—";
  if (format === "nullable-percent" || format === "percent") return `${raw}%`;
  if (format === "duration") return formatDurationSeconds(raw);
  return Number.isInteger(raw)
    ? raw.toLocaleString()
    : raw.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

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
        const display =
          loading || !stats ? "—" : formatValue(raw, card.format);
        const hint = !loading && stats ? card.hint?.(stats) : null;
        return (
          <article key={card.key} className="admin-stat-card">
            <p className="admin-stat-card__label">{card.label}</p>
            <p className="admin-stat-card__value">
              {loading ? <span className="admin-skeleton" /> : display}
            </p>
            {hint ? <p className="admin-stat-card__hint">{hint}</p> : null}
          </article>
        );
      })}
    </div>
  );
}
