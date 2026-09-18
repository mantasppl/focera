import type { PostMetrics } from "@/lib/content/types";

export function topTrafficSources(
  metrics: PostMetrics | null | undefined,
  limit = 3,
): string {
  const names = (metrics?.sources ?? [])
    .slice(0, limit)
    .map((source) => source.name)
    .filter(Boolean);
  return names.join(", ");
}
