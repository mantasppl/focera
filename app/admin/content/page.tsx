import { redirect } from "next/navigation";
import { getAdminPath } from "@/lib/admin/config";

export default function AdminContentIndexPage() {
  redirect(`${getAdminPath()}/content/posts`);
}
