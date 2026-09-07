"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/components/Button";
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
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [data, setData] = useState<RatingsResponse | null>(null);
  const [baseDrafts, setBaseDrafts] = useState<Record<string, string>>({});

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (toolId) params.set("toolId", toolId);
      params.set("limit", "100");
      try {
        const response = await adminFetch(
          `${api("/ratings")}?${params.toString()}`,
          { signal },
        );
        if (signal?.aborted) return;
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(
            body?.error || `Failed to load ratings (${response.status}).`,
          );
        }
        const payload = (await response.json()) as RatingsResponse;
        if (signal?.aborted) return;
        setData(payload);
        const drafts: Record<string, string> = {};
        for (const tool of payload.tools) {
          drafts[tool.toolId] = String(tool.baseCount);
        }
        setBaseDrafts(drafts);
      } catch (err) {
        if (signal?.aborted) return;
        setError(err instanceof Error ? err.message : "Failed to load ratings.");
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [api, toolId],
  );

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  async function saveBaseCount(tool: ToolRatingSummary) {
    const raw = baseDrafts[tool.toolId] ?? String(tool.baseCount);
    const next = Number(raw);
    if (!Number.isInteger(next) || next < 0) {
      setError("Base count must be a whole number ≥ 0.");
      return;
    }
    setBusyId(tool.toolId);
    setError("");
    try {
      const response = await adminFetch(api("/ratings"), {
        method: "PATCH",
        body: JSON.stringify({ toolId: tool.toolId, baseCount: next }),
      });
      const body = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok) {
        throw new Error(body?.error || "Could not update base count.");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update base count.");
    } finally {
      setBusyId(null);
    }
  }

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
            { label: "Tools listed", value: tools.length },
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
          <h2>Public rating counts</h2>
          <p>
            Displayed count = base + live ratings. Edit base to correct the
            public number (115–2541 seeded by default).
          </p>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tool</th>
                <th className="is-num">Base</th>
                <th className="is-num">Live</th>
                <th className="is-num">Display</th>
                <th className="is-num">Average</th>
                <th className="is-num">Comments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7}>
                    <div className="admin-skeleton admin-skeleton--row" />
                  </td>
                </tr>
              ) : tools.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="admin-empty">No tools found.</div>
                  </td>
                </tr>
              ) : (
                tools.map((tool) => {
                  const draft = baseDrafts[tool.toolId] ?? String(tool.baseCount);
                  const dirty = Number(draft) !== tool.baseCount;
                  return (
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
                      <td className="is-num">
                        <input
                          className="admin-base-input"
                          type="number"
                          min={0}
                          value={draft}
                          disabled={busyId === tool.toolId}
                          onChange={(e) =>
                            setBaseDrafts((prev) => ({
                              ...prev,
                              [tool.toolId]: e.target.value,
                            }))
                          }
                          aria-label={`Base count for ${tool.toolName}`}
                        />
                      </td>
                      <td className="is-num">{tool.liveCount.toLocaleString()}</td>
                      <td className="is-num">
                        {(
                          (Number.isInteger(Number(draft))
                            ? Number(draft)
                            : tool.baseCount) + tool.liveCount
                        ).toLocaleString()}
                      </td>
                      <td className="is-num">{tool.average.toFixed(1)}</td>
                      <td className="is-num">
                        {tool.withComments.toLocaleString()}
                      </td>
                      <td>
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={busyId === tool.toolId || !dirty}
                          onClick={() => void saveBaseCount(tool)}
                        >
                          {busyId === tool.toolId ? "Saving…" : "Save"}
                        </Button>
                      </td>
                    </tr>
                  );
                })
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
