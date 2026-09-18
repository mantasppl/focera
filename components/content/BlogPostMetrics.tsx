"use client";

import { useEffect, useState } from "react";
import type { PostMetrics } from "@/lib/content/types";
import { EMPTY_POST_METRICS } from "@/lib/content/types";

function formatCount(value: number): string {
  return value.toLocaleString();
}

export default function BlogPostMetrics({
  slug,
  initial = EMPTY_POST_METRICS,
}: {
  slug: string;
  initial?: PostMetrics;
}) {
  const [metrics, setMetrics] = useState<PostMetrics>(initial);

  useEffect(() => {
    let cancelled = false;
    const encoded = encodeURIComponent(slug);
    void fetch(`/api/posts/slug/${encoded}/metrics`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((body: { metrics?: PostMetrics } | null) => {
        if (cancelled || !body?.metrics) return;
        setMetrics(body.metrics);
      })
      .catch(() => {
        // keep server metrics
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const topSources = metrics.sources.slice(0, 4);
  const cameFrom = topSources[0]?.name ?? "—";
  const otherSources = topSources
    .slice(1)
    .map((source) => source.name)
    .join(" · ");

  return (
    <dl className="blog-metrics" aria-label="Post traffic">
      <div className="blog-metrics__item">
        <dt>Views</dt>
        <dd>{formatCount(metrics.views)}</dd>
      </div>
      <div className="blog-metrics__item">
        <dt>Unique</dt>
        <dd>{formatCount(metrics.unique)}</dd>
      </div>
      <div className="blog-metrics__item blog-metrics__item--source">
        <dt>Came from</dt>
        <dd>{cameFrom}</dd>
        {otherSources ? (
          <p className="blog-metrics__more">{otherSources}</p>
        ) : null}
      </div>
    </dl>
  );
}
