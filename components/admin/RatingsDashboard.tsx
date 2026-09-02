"use client";

import { useEffect, useState } from "react";
import { useAdminPath } from "@/components/admin/AdminPathContext";
import { adminFetch } from "@/lib/admin/csrf-client";
import type {
  RatingListItem,
  RatingOverviewStats,
  ToolRatingSummary,
} from "@/lib/ratings/types";

type RatingsResponse = {
  ok: boolean;
  stats: RatingOverviewStats;
  tools: ToolRatingSummary[];
  ratings: RatingListItem[];
  totalRatings: number;
  toolId: string | null;
};

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function StarLabel({ value }: { value: number }) {
  return (
    <span className="admin-stars" aria-label={`${value} out of 5 stars`}>
      {"★".repeat(value)}
      <span className="admin-stars__empty">{"★".repeat(5 - value)}</span>
    </span>
  );
}

export default function RatingsDashboard() {
  const { api } = useAdminPath();
  const [toolId, setToolId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<RatingsResponse | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (toolId) params.set("toolId", toolId);
      params.set("limit", "100");
      try {
        const response = await adminFetch(
          `${api("/ratings")}?${params.toString()}`,
          { signal: controller.signal },
        );
        if (!active || controller.signal.aborted) return;
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(body?.error || `Failed to load ratings (${response.status}).`);
        }
        const payload = (await response.json()) as RatingsResponse;
        if (!active) return;
        setData(payload);
      } catch (err) {
        if (!active || controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Failed to load ratings.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [api, toolId]);

  const stats = data?.stats;
  const tools = data?.tools ?? [];
  const ratings = data?.ratings ?? [];

  return (
    <div className="admin-dashboard">
      {error ? (
        <div className="admin-error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="admin-stat-grid">
        {(
          [
            { label: "Total ratings", value: stats?.total },
            { label: "Average stars", value: stats?.average },
            { label: "With comments", value: stats?.withComments },
            { label: "Tools rated", value: tools.length },
          ] as const
        ).map((card) => (
          <article key={card.label} className="admin-stat-card">
            <p className="admin-stat-card__label">{card.label}</p>
            <p className="admin-stat-card__value">
              {loading ? (
                <span className="admin-skeleton" />
              ) : typeof card.value === "number" ? (
                card.value.toLocaleString()
              ) : (
                "—"
              )}
            </p>
          </article>
        ))}
      </div>

      <section className="admin-table-card">
        <div className="admin-table-card__head">
          <h2>Every tool</h2>
          <p>Average rating, count, and comments per tool.</p>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tool</th>
                <th className="is-num">Ratings</th>
                <th className="is-num">Average</th>
                <th className="is-num">Comments</th>
                <th className="is-num">5★</th>
                <th className="is-num">4★</th>
                <th className="is-num">3★</th>
                <th className="is-num">2★</th>
                <th className="is-num">1★</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9}>
                    <div className="admin-skeleton admin-skeleton--row" />
                  </td>
                </tr>
              ) : tools.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="admin-empty">
                      No ratings yet. They appear here after someone rates a tool.
                    </div>
                  </td>
                </tr>
              ) : (
                tools.map((tool) => (
                  <tr key={tool.toolId}>
                    <td>
                      <button
                        type="button"
                        className="admin-table__link"
                        onClick={() =>
                          setToolId((current) =>
                            current === tool.toolId ? "" : tool.toolId,
                          )
                        }
                      >
                        {tool.toolName}
                        <span className="admin-table__slug">{tool.toolId}</span>
                      </button>
                    </td>
                    <td className="is-num">{tool.count.toLocaleString()}</td>
                    <td className="is-num">{tool.average.toFixed(1)}</td>
                    <td className="is-num">
                      {tool.withComments.toLocaleString()}
                    </td>
                    <td className="is-num">{tool.stars[5]}</td>
                    <td className="is-num">{tool.stars[4]}</td>
                    <td className="is-num">{tool.stars[3]}</td>
                    <td className="is-num">{tool.stars[2]}</td>
                    <td className="is-num">{tool.stars[1]}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-table-card">
        <div className="admin-table-card__head">
          <h2>Ratings and comments</h2>
          <p>
            {toolId
              ? `Showing ${toolId}. Click the same tool again to show all.`
              : "Newest first. Click a tool above to filter."}
          </p>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Tool</th>
                <th>Stars</th>
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4}>
                    <div className="admin-skeleton admin-skeleton--row" />
                  </td>
                </tr>
              ) : ratings.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="admin-empty">No ratings in this view yet.</div>
                  </td>
                </tr>
              ) : (
                ratings.map((rating) => (
                  <tr key={rating.id}>
                    <td>{formatWhen(rating.createdAt)}</td>
                    <td>
                      <span className="admin-table__link">
                        {rating.toolName}
                        <span className="admin-table__slug">{rating.toolId}</span>
                      </span>
                    </td>
                    <td>
                      <StarLabel value={rating.stars} />
                    </td>
                    <td className="is-wrap">
                      {rating.comment || (
                        <span className="admin-table__slug">No comment</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
