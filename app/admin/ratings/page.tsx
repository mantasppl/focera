import AdminChrome from "@/components/admin/AdminChrome";
import RatingsDashboard from "@/components/admin/RatingsDashboard";

export default function AdminRatingsPage() {
  return (
    <AdminChrome title="Tool ratings">
      <RatingsDashboard />
    </AdminChrome>
  );
}
