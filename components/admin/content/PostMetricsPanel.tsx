"use client";

import { useEffect, useState } from "react";
import BreakdownList from "@/components/admin/BreakdownList";
import { useAdminPath } from "@/components/admin/AdminPathContext";
import { adminFetch } from "@/lib/admin/csrf-client";
import {
  EMPTY_POST_METRICS,
  type PostMetrics,
} from "@/lib/content/types";

function formatCount(value: number): string {
  return value.toLocaleString();
}

export default function PostMetricsPanel({
  postId,
  slug,
}: {
  postId?: string;
  slug: string;
}) {
  const { adminPath } = useAdminPath();
  const [metrics, setMetrics] = useState<PostMetrics>(EMPTY_POST_METRICS);
  const [loading, setLoading] = useState(Boolean(postId && slug));

  useEffect(() => {
    if (!postId || !slug.trim()) {
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const response = await adminFetch(
          `${adminPath}/api/content/posts/${postId}/metrics`,
        );
        const body = (await response.json().catch(() => null)) as {
          metrics?: PostMetrics;
        } | null;
        if (cancelled) return;
        setMetrics(body?.metrics ?? EMPTY_POST_METRICS);
      } catch {
        if (!cancelled) setMetrics(EMPTY_POST_METRICS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [adminPath, postId, slug]);

  if (!postId) return null;

  return (
    <section className="admin-panel">
      <h2>Traffic</h2>
      <p className="admin-muted">
        Views of <code>/blog/{slug || "…"}</code> from site analytics.
      </p>
      <div className="admin-stat-grid admin-stat-grid--compact">
        <article className="admin-stat-card">
          <p className="admin-stat-card__label">Views</p>
          <p className="admin-stat-card__value">
            {loading ? <span className="admin-skeleton" /> : formatCount(metrics.views)}
          </p>
        </article>
        <article className="admin-stat-card">
          <p className="admin-stat-card__label">Unique</p>
          <p className="admin-stat-card__value">
            {loading ? (
              <span className="admin-skeleton" />
            ) : (
              formatCount(metrics.unique)
            )}
          </p>
        </article>
      </div>
      <div>
        <p className="admin-stat-card__label">Came from</p>
        {loading ? (
          <span className="admin-skeleton" />
        ) : (
          <BreakdownList
            items={metrics.sources}
            empty="No referrers recorded yet."
          />
        )}
      </div>
    </section>
  );
}
