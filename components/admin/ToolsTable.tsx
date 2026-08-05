"use client";

import Link from "next/link";
import type { ToolStatsRow } from "@/lib/analytics/types";

export default function ToolsTable({
  tools,
  loading,
  query,
}: {
  tools: ToolStatsRow[];
  loading?: boolean;
  query: { preset: string; start?: string; end?: string };
}) {
  const params = new URLSearchParams();
  params.set("preset", query.preset);
  if (query.start) params.set("start", query.start);
  if (query.end) params.set("end", query.end);
  const qs = params.toString();

  return (
    <section className="admin-table-card">
      <div className="admin-table-card__head">
        <h2>Per-tool statistics</h2>
        <p>Sorted by all-time usage. Click a tool for detail.</p>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tool</th>
              <th className="is-num">Today</th>
              <th className="is-num">7 Days</th>
              <th className="is-num">30 Days</th>
              <th className="is-num">Total</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5}>
                  <div className="admin-skeleton admin-skeleton--row" />
                </td>
              </tr>
            ) : tools.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="admin-empty">
                    No tool usage recorded yet. Complete a tool once to see data here.
                  </div>
                </td>
              </tr>
            ) : (
              tools.map((tool) => (
                <tr key={tool.toolId}>
                  <td>
                    <Link
                      href={`/admin/analytics/${encodeURIComponent(tool.toolId)}?${qs}`}
                      className="admin-table__link"
                    >
                      {tool.toolName}
                      <span className="admin-table__slug">{tool.toolId}</span>
                    </Link>
                  </td>
                  <td className="is-num">{tool.today.toLocaleString()}</td>
                  <td className="is-num">{tool.last7Days.toLocaleString()}</td>
                  <td className="is-num">{tool.last30Days.toLocaleString()}</td>
                  <td className="is-num">{tool.total.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
