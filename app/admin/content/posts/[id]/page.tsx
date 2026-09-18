import AdminChrome from "@/components/admin/AdminChrome";
import PostEditor from "@/components/admin/content/PostEditor";
import { listContentTools } from "@/lib/content/db";
import { getPostById, getPostBySlug } from "@/lib/content/store";
import { connection } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditPostPage({ params }: PageProps) {
  await connection();
  const { id } = await params;
  const [post, tools] = await Promise.all([
    getPostById(id).then((row) => row || getPostBySlug(id)),
    listContentTools().catch((error) => {
      console.error("[admin/content/posts/id] tools", error);
      return [];
    }),
  ]);

  return (
    <AdminChrome title="Edit post">
      <PostEditor
        postId={post?.id || id}
        initialPost={post}
        initialTools={tools}
      />
    </AdminChrome>
  );
}
