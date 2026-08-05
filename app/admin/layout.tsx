import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminPathProvider } from "@/components/admin/AdminPathContext";
import { getAdminPath } from "@/lib/admin/config";

export const metadata: Metadata = {
  title: "Focera Admin",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  const adminPath = getAdminPath();
  return <AdminPathProvider adminPath={adminPath}>{children}</AdminPathProvider>;
}
