"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAdminPath } from "@/components/admin/AdminPathContext";
import { adminFetch } from "@/lib/admin/csrf-client";
import type { PostListItem, PostStatus } from "@/lib/content/types";

type ListResponse = {
  ok: boolean;
  posts: PostListItem[];
  total: number;
  error?: string;
};

function formatWhen(ms: number | null): string {
  if (!ms) return "—";
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function PostsList() {
  const { api, contentPostsPath } = useAdminPath();
  const [status, setStatus] = useState<"all" | PostStatus>("all");
  const [query, setQuery] = useState("");
  const [queryInput, setQueryInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [data, setData] = useState<ListResponse | null>(null);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      if (query) params.set("q", query);
      params.set("limit", "100");
      try {
        const response = await adminFetch(
          `${api("/content/posts")}?${params.toString()}`,
          { signal },
        );
        if (signal?.aborted) return;
        const payload = (await response.json().catch(() => null)) as ListResponse | null;
        if (!response.ok) {
          throw new Error(payload?.error || `Failed to load posts (${response.status}).`);
        }
        setData(payload);
        setError("");
      } catch (err) {
        if (signal?.aborted) return;
        setError(err instanceof Error ? err.message : "Failed to load posts.");
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [api, query, status],
  );

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      await load(controller.signal);
    })();
    return () => controller.abort();
  }, [load]);

  const posts = data?.posts ?? [];

  const counts = useMemo(() => {
    const all = data?.total ?? posts.length;
    return { all, shown: posts.length };
  }, [data?.total, posts.length]);

  async function handleDelete(post: PostListItem) {
    if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    setBusyId(post.id);
    setError("");
    try {
      const response = await adminFetch(api(`/content/posts/${post.id}`), {
        method: "DELETE",
      });
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(body?.error || "Could not delete post.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete post.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="admin-dashboard">
      {error ? (
        <div className="admin-error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="admin-toolbar">
        <div className="admin-filters">
          <label className="admin-field">
            Status
            <select
              value={status}
              onChange={(event) => {
                setLoading(true);
                setStatus(event.target.value as "all" | PostStatus);
              }}
            >
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <form
            className="admin-field admin-field--grow"
            onSubmit={(event) => {
              event.preventDefault();
              setQuery(queryInput.trim());
              setLoading(true);
            }}
          >
            Search
            <input
              type="search"
              value={queryInput}
              onChange={(event) => setQueryInput(event.target.value)}
              placeholder="Search by title"
            />
          </form>
        </div>
        <div className="admin-toolbar__export">
          <Link href={`${contentPostsPath}/new`} className="ui-btn ui-btn--primary">
            New post
          </Link>
        </div>
      </div>

      <section className="admin-table-card">
        <div className="admin-table-card__head">
          <h2>Posts</h2>
          <p>
            {loading ? "Loading…" : `${counts.shown} of ${counts.all} posts`}
          </p>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && !posts.length ? (
                <tr>
                  <td colSpan={5}>
                    <span className="admin-skeleton" />
                  </td>
                </tr>
              ) : null}
              {!loading && !posts.length ? (
                <tr>
                  <td colSpan={5}>No posts yet. Create one to start the blog.</td>
                </tr>
              ) : null}
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="is-wrap">
                    <Link
                      href={`${contentPostsPath}/${post.id}`}
                      className="admin-table__link"
                    >
                      {post.title}
                      <span className="admin-table__slug">/{post.slug}</span>
                    </Link>
                  </td>
                  <td>
                    <span
                      className={
                        post.status === "published"
                          ? "admin-badge admin-badge--system"
                          : "admin-badge admin-badge--user"
                      }
                    >
                      {post.status}
                    </span>
                  </td>
                  <td>{formatWhen(post.updatedAt)}</td>
                  <td>{formatWhen(post.publishedAt)}</td>
                  <td>
                    <div className="admin-row-actions">
                      <Link
                        href={`${contentPostsPath}/${post.id}`}
                        className="admin-table__link"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="admin-table__link admin-table__link--danger"
                        disabled={busyId === post.id}
                        onClick={() => handleDelete(post)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
