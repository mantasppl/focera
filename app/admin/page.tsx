import { redirect } from "next/navigation";
import { getAdminPath } from "@/lib/admin/config";

export default function AdminIndexPage() {
  // Internal route only — public access is via ADMIN_PATH rewrite.
  redirect(`${getAdminPath()}/traffic`);
}
