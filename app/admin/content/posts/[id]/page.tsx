import AdminChrome from "@/components/admin/AdminChrome";
import PostEditor from "@/components/admin/content/PostEditor";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditPostPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <AdminChrome title="Edit post">
      <PostEditor postId={id} />
    </AdminChrome>
  );
}
