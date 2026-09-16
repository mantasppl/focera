import AdminChrome from "@/components/admin/AdminChrome";
import PostEditor from "@/components/admin/content/PostEditor";

export default function AdminNewPostPage() {
  return (
    <AdminChrome title="New post">
      <PostEditor />
    </AdminChrome>
  );
}
