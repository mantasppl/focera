import AdminChrome from "@/components/admin/AdminChrome";
import PostEditor from "@/components/admin/content/PostEditor";
import { listContentTools } from "@/lib/content/db";
import { connection } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminNewPostPage() {
  await connection();
  let tools: Awaited<ReturnType<typeof listContentTools>> = [];
  try {
    tools = await listContentTools();
  } catch (error) {
    console.error("[admin/content/posts/new]", error);
  }

  return (
    <AdminChrome title="New post">
      <PostEditor initialTools={tools} />
    </AdminChrome>
  );
}
