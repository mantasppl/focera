"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/components/Button";
import { useAdminPath } from "@/components/admin/AdminPathContext";
import { adminFetch } from "@/lib/admin/csrf-client";
import type {
  AdminCommentItem,
  AdminCommentKind,
  CommentOverviewStats,
  ToolCommentSummary,
} from "@/lib/comments/admin-types";

type CommentsResponse = {
  ok: boolean;
  stats: CommentOverviewStats;
  tools: ToolCommentSummary[];
  comments: AdminCommentItem[];
  totalComments: number;
  toolId: string | null;
  kind: AdminCommentKind;
  query: string | null;
};

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function StarLabel({ value }: { value: number | null }) {
  if (value == null) {
    return <span className="admin-table__slug">—</span>;
  }
  return (
    <span className="admin-stars" aria-label={`${value} out of 5 stars`}>
      {"★".repeat(value)}
      <span className="admin-stars__empty">{"★".repeat(5 - value)}</span>
    </span>
  );
}

export default function CommentsDashboard() {
  const { api } = useAdminPath();
  const [toolId, setToolId] = useState("");
  const [kind, setKind] = useState<AdminCommentKind>("all");
  const [query, setQuery] = useState("");
  const [queryInput, setQueryInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [data, setData] = useState<CommentsResponse | null>(null);
  const [editing, setEditing] = useState<AdminCommentItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editLikes, setEditLikes] = useState(0);
  const [editRating, setEditRating] = useState<number | "">("");
  const [editSystem, setEditSystem] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (toolId) params.set("toolId", toolId);
    if (kind !== "all") params.set("kind", kind);
    if (query) params.set("q", query);
    params.set("limit", "100");
    try {
      const response = await adminFetch(
        `${api("/comments")}?${params.toString()}`,
        { signal },
      );
      if (signal?.aborted) return;
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error || `Failed to load comments (${response.status}).`);
      }
      const payload = (await response.json()) as CommentsResponse;
      if (signal?.aborted) return;
      setData(payload);
    } catch (err) {
      if (signal?.aborted) return;
      setError(err instanceof Error ? err.message : "Failed to load comments.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [api, toolId, kind, query]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  function openEdit(comment: AdminCommentItem) {
    setEditing(comment);
    setEditName(comment.name);
    setEditContent(comment.content);
    setEditLikes(comment.likesCount);
    setEditRating(comment.rating ?? "");
    setEditSystem(comment.isSystem);
  }

  async function saveEdit() {
    if (!editing) return;
    setBusyId(editing.id);
    setError("");
    try {
      const response = await adminFetch(api("/comments"), {
        method: "PATCH",
        body: JSON.stringify({
          id: editing.id,
          name: editName,
          content: editContent,
          likesCount: editLikes,
          rating: editRating === "" ? null : editRating,
          isSystem: editSystem,
        }),
      });
      const body = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok) {
        throw new Error(body?.error || "Could not update comment.");
      }
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update comment.");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteComment(comment: AdminCommentItem) {
    const extra =
      comment.replyCount > 0
        ? ` This will also delete ${comment.replyCount} ${comment.replyCount === 1 ? "reply" : "replies"}.`
        : "";
    if (
      !window.confirm(
        `Delete comment by ${comment.name}?${extra}`,
      )
    ) {
      return;
    }
    setBusyId(comment.id);
    setError("");
    try {
      const response = await adminFetch(
        `${api("/comments")}?id=${comment.id}`,
        { method: "DELETE" },
      );
      const body = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok) {
        throw new Error(body?.error || "Could not delete comment.");
      }
      if (editing?.id === comment.id) setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete comment.");
    } finally {
      setBusyId(null);
    }
  }

  async function bumpLikes(comment: AdminCommentItem, delta: number) {
    const next = Math.max(0, comment.likesCount + delta);
    setBusyId(comment.id);
    setError("");
    try {
      const response = await adminFetch(api("/comments"), {
        method: "PATCH",
        body: JSON.stringify({ id: comment.id, likesCount: next }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error || "Could not update likes.");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update likes.");
    } finally {
      setBusyId(null);
    }
  }

  const stats = data?.stats;
  const tools = data?.tools ?? [];
  const comments = data?.comments ?? [];

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
            { label: "Total comments", value: stats?.total },
            { label: "User comments", value: stats?.userComments },
            { label: "System comments", value: stats?.systemComments },
            { label: "New today", value: stats?.newToday },
            { label: "New this week", value: stats?.newThisWeek },
            { label: "Total likes", value: stats?.totalLikes },
            { label: "Avg rating", value: stats?.averageRating },
            { label: "Tools with comments", value: stats?.toolsWithComments },
          ] as const
        ).map((card) => (
          <article key={card.label} className="admin-stat-card">
            <p className="admin-stat-card__label">{card.label}</p>
            <p className="admin-stat-card__value">
              {loading ? (
                <span className="admin-skeleton" />
              ) : typeof card.value === "number" ? (
                card.label === "Avg rating"
                  ? card.value.toFixed(1)
                  : card.value.toLocaleString()
              ) : (
                "—"
              )}
            </p>
          </article>
        ))}
      </div>

      <section className="admin-table-card">
        <div className="admin-table-card__head">
          <h2>Per tool</h2>
          <p>Click a tool to filter the comment list.</p>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tool</th>
                <th className="is-num">Total</th>
                <th className="is-num">User</th>
                <th className="is-num">System</th>
                <th className="is-num">Replies</th>
                <th className="is-num">Likes</th>
                <th className="is-num">Avg ★</th>
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
                    <div className="admin-empty">No comments yet.</div>
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
                    <td className="is-num">{tool.total.toLocaleString()}</td>
                    <td className="is-num">{tool.userCount.toLocaleString()}</td>
                    <td className="is-num">{tool.systemCount.toLocaleString()}</td>
                    <td className="is-num">{tool.replies.toLocaleString()}</td>
                    <td className="is-num">{tool.likes.toLocaleString()}</td>
                    <td className="is-num">{tool.averageRating.toFixed(1)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-table-card">
        <div className="admin-table-card__head">
          <h2>All comments</h2>
          <p>
            {toolId
              ? `Filtered to ${toolId}.`
              : "Newest first."}{" "}
            System = generated seed comments.
          </p>
        </div>

        <div className="admin-comments-filters">
          <label className="admin-comments-filters__field">
            <span>Type</span>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as AdminCommentKind)}
            >
              <option value="all">All</option>
              <option value="user">User only</option>
              <option value="system">System only</option>
              <option value="roots">Top-level</option>
              <option value="replies">Replies</option>
            </select>
          </label>
          <form
            className="admin-comments-filters__search"
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(queryInput.trim());
            }}
          >
            <input
              type="search"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Search name, email, text…"
              aria-label="Search comments"
            />
            <Button type="submit" variant="ghost">
              Search
            </Button>
            {query ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setQuery("");
                  setQueryInput("");
                }}
              >
                Clear
              </Button>
            ) : null}
          </form>
          {toolId ? (
            <Button type="button" variant="ghost" onClick={() => setToolId("")}>
              Clear tool filter
            </Button>
          ) : null}
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Tool</th>
                <th>Author</th>
                <th>Stars</th>
                <th className="is-num">Likes</th>
                <th>Comment</th>
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
              ) : comments.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="admin-empty">No comments in this view.</div>
                  </td>
                </tr>
              ) : (
                comments.map((comment) => (
                  <tr key={comment.id}>
                    <td>{formatWhen(comment.createdAt)}</td>
                    <td>
                      <span className="admin-table__link">
                        {comment.toolName}
                        <span className="admin-table__slug">{comment.toolId}</span>
                      </span>
                    </td>
                    <td>
                      <span className="admin-table__link">
                        {comment.name}
                        {comment.isSystem ? (
                          <span className="admin-badge admin-badge--system">
                            System
                          </span>
                        ) : (
                          <span className="admin-badge admin-badge--user">
                            User
                          </span>
                        )}
                        {comment.parentId ? (
                          <span className="admin-table__slug">
                            reply · parent #{comment.parentId}
                          </span>
                        ) : comment.replyCount > 0 ? (
                          <span className="admin-table__slug">
                            {comment.replyCount}{" "}
                            {comment.replyCount === 1 ? "reply" : "replies"}
                          </span>
                        ) : null}
                        {comment.email ? (
                          <span className="admin-table__slug">{comment.email}</span>
                        ) : null}
                      </span>
                    </td>
                    <td>
                      <StarLabel value={comment.rating} />
                    </td>
                    <td className="is-num">
                      <div className="admin-likes-edit">
                        <button
                          type="button"
                          className="admin-likes-edit__btn"
                          disabled={busyId === comment.id || comment.likesCount < 1}
                          onClick={() => bumpLikes(comment, -1)}
                          aria-label="Decrease likes"
                        >
                          −
                        </button>
                        <span>{comment.likesCount}</span>
                        <button
                          type="button"
                          className="admin-likes-edit__btn"
                          disabled={busyId === comment.id}
                          onClick={() => bumpLikes(comment, 1)}
                          aria-label="Increase likes"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="is-wrap">{comment.content}</td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="admin-table__link"
                          disabled={busyId === comment.id}
                          onClick={() => openEdit(comment)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="admin-table__link admin-table__link--danger"
                          disabled={busyId === comment.id}
                          onClick={() => deleteComment(comment)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {data ? (
          <p className="admin-table-card__foot">
            Showing {comments.length.toLocaleString()} of{" "}
            {data.totalComments.toLocaleString()}
          </p>
        ) : null}
      </section>

      {editing ? (
        <div className="admin-modal" role="presentation">
          <button
            type="button"
            className="admin-modal__backdrop"
            aria-label="Close editor"
            onClick={() => setEditing(null)}
          />
          <div
            className="admin-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-comment-edit-title"
          >
            <h2 id="admin-comment-edit-title">Edit comment #{editing.id}</h2>
            <label className="ui-field">
              <span className="ui-label">Name</span>
              <input
                className="ui-input"
                value={editName}
                maxLength={50}
                onChange={(e) => setEditName(e.target.value)}
              />
            </label>
            <label className="ui-field">
              <span className="ui-label">Comment</span>
              <textarea
                className="ui-input ui-input--textarea"
                rows={5}
                maxLength={1000}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
            </label>
            <div className="admin-modal__row">
              <label className="ui-field">
                <span className="ui-label">Likes</span>
                <input
                  className="ui-input"
                  type="number"
                  min={0}
                  value={editLikes}
                  onChange={(e) =>
                    setEditLikes(Math.max(0, Number(e.target.value) || 0))
                  }
                />
              </label>
              <label className="ui-field">
                <span className="ui-label">Rating (blank = none)</span>
                <input
                  className="ui-input"
                  type="number"
                  min={1}
                  max={5}
                  value={editRating}
                  onChange={(e) => {
                    const v = e.target.value;
                    setEditRating(v === "" ? "" : Number(v));
                  }}
                />
              </label>
            </div>
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={editSystem}
                onChange={(e) => setEditSystem(e.target.checked)}
              />
              <span>System comment (generated seed)</span>
            </label>
            <div className="admin-modal__actions">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={busyId === editing.id}
                onClick={() => void saveEdit()}
              >
                {busyId === editing.id ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
