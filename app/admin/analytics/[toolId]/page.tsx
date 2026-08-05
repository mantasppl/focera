import AdminChrome from "@/components/admin/AdminChrome";
import ToolDetailDashboard from "@/components/admin/ToolDetailDashboard";

type PageProps = {
  params: Promise<{ toolId: string }>;
};

export default async function AdminToolAnalyticsPage({ params }: PageProps) {
  const { toolId } = await params;
  return (
    <AdminChrome>
      <ToolDetailDashboard toolId={decodeURIComponent(toolId)} />
    </AdminChrome>
  );
}
