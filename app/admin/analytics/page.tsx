import AdminChrome from "@/components/admin/AdminChrome";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";

export default function AdminAnalyticsPage() {
  return (
    <AdminChrome title="Tool usage analytics">
      <AnalyticsDashboard />
    </AdminChrome>
  );
}
