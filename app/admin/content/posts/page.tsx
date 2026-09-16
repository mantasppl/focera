import AdminChrome from "@/components/admin/AdminChrome";
import PostsList from "@/components/admin/content/PostsList";

export default function AdminPostsPage() {
  return (
    <AdminChrome title="Content">
      <PostsList />
    </AdminChrome>
  );
}
