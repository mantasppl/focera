import AdminChrome from "@/components/admin/AdminChrome";
import TrafficDashboard from "@/components/admin/TrafficDashboard";

export default function AdminTrafficPage() {
  return (
    <AdminChrome title="Site traffic">
      <TrafficDashboard />
    </AdminChrome>
  );
}
