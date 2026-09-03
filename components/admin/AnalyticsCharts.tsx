"use client";

import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { NamedCount, TimeBucket } from "@/lib/analytics/types";

const ACCENT = "#0d9488";
const ACCENT_DEEP = "#0f766e";
const MUTED = "#94a3b8";
const PIE_COLORS = ["#0d9488", "#0f766e", "#14b8a6", "#2dd4bf", "#5eead4", "#99f6e4", "#64748b", "#334155"];

function ChartCard({
  title,
  empty,
  children,
}: {
  title: string;
  empty?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="admin-chart-card">
      <h2 className="admin-chart-card__title">{title}</h2>
      {empty ? (
        <div className="admin-empty">No data for this range yet.</div>
      ) : (
        <div className="admin-chart-card__body">{children}</div>
      )}
    </section>
  );
}

function hasData(rows: Array<{ count: number }>): boolean {
  return rows.some((row) => row.count > 0);
}

export default function AnalyticsCharts({
  daily,
  hourly,
  topTools,
  devices,
  browsers,
  sources,
  loading,
}: {
  daily: TimeBucket[];
  hourly: TimeBucket[];
  topTools: NamedCount[];
  devices: NamedCount[];
  browsers: NamedCount[];
  sources: NamedCount[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="admin-chart-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <section key={i} className="admin-chart-card">
            <div className="admin-skeleton admin-skeleton--chart" />
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="admin-chart-grid">
      <ChartCard title="Daily usage" empty={!hasData(daily)}>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={daily}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-grid)" />
            <XAxis dataKey="label" tick={{ fill: MUTED, fontSize: 11 }} minTickGap={24} />
            <YAxis allowDecimals={false} tick={{ fill: MUTED, fontSize: 11 }} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="count"
              stroke={ACCENT}
              fill={ACCENT}
              fillOpacity={0.18}
              name="Uses"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Hourly usage" empty={!hasData(hourly)}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={hourly}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-grid)" />
            <XAxis dataKey="label" tick={{ fill: MUTED, fontSize: 10 }} interval={2} />
            <YAxis allowDecimals={false} tick={{ fill: MUTED, fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" fill={ACCENT_DEEP} name="Uses" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Top 10 tools" empty={!hasData(topTools)}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={topTools} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-grid)" />
            <XAxis type="number" allowDecimals={false} tick={{ fill: MUTED, fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tick={{ fill: MUTED, fontSize: 11 }}
            />
            <Tooltip />
            <Bar dataKey="count" fill={ACCENT} name="Uses" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Device distribution" empty={!hasData(devices)}>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={devices}
              dataKey="count"
              nameKey="name"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
            >
              {devices.map((_, index) => (
                <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Browser distribution" empty={!hasData(browsers)}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={browsers}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-grid)" />
            <XAxis dataKey="name" tick={{ fill: MUTED, fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fill: MUTED, fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" fill={ACCENT} name="Uses" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Where users came from" empty={!hasData(sources)}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={sources} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-grid)" />
            <XAxis type="number" allowDecimals={false} tick={{ fill: MUTED, fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tick={{ fill: MUTED, fontSize: 11 }}
            />
            <Tooltip />
            <Bar dataKey="count" fill={ACCENT_DEEP} name="Uses" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
