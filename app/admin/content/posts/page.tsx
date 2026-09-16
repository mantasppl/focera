import AdminChrome from "@/components/admin/AdminChrome";
import PostsList from "@/components/admin/content/PostsList";
import { listPosts } from "@/lib/content/store";
import type { PostListItem } from "@/lib/content/types";

export const runtime = "nodejs";

export default async function AdminPostsPage() {
  let initial: { items: PostListItem[]; total: number } = { items: [], total: 0 };
  try {
    initial = await listPosts({ limit: 100 });
  } catch (error) {
    console.error("[admin/content/posts]", error);
  }

  return (
    <AdminChrome title="Content">
      <PostsList initialPosts={initial.items} initialTotal={initial.total} />
    </AdminChrome>
  );
}
