import AdminChrome from "@/components/admin/AdminChrome";
import PostsList from "@/components/admin/content/PostsList";
import { getBlogPostsMetrics } from "@/lib/analytics/blog-metrics";
import { listPosts } from "@/lib/content/store";
import { EMPTY_POST_METRICS, type PostListItem } from "@/lib/content/types";
import { connection } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  await connection();
  let initial: { items: PostListItem[]; total: number } = { items: [], total: 0 };
  try {
    initial = await listPosts({ limit: 100 });
    try {
      const metrics = await getBlogPostsMetrics(
        initial.items.map((item) => item.slug),
      );
      initial = {
        ...initial,
        items: initial.items.map((item) => ({
          ...item,
          metrics: metrics.get(item.slug) ?? EMPTY_POST_METRICS,
        })),
      };
    } catch (error) {
      console.error("[admin/content/posts] metrics", error);
    }
  } catch (error) {
    console.error("[admin/content/posts]", error);
  }

  return (
    <AdminChrome title="Content">
      <PostsList initialPosts={initial.items} initialTotal={initial.total} />
    </AdminChrome>
  );
}
