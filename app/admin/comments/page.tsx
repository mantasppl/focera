import AdminChrome from "@/components/admin/AdminChrome";
import CommentsDashboard from "@/components/admin/CommentsDashboard";

export default function AdminCommentsPage() {
  return (
    <AdminChrome title="Tool comments">
      <CommentsDashboard />
    </AdminChrome>
  );
}
