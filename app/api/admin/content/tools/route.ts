import { requirePostReadAuth } from "@/lib/content/http";
import { listContentTools } from "@/lib/content/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const denied = await requirePostReadAuth(request);
  if (denied) return denied;

  try {
    const tools = await listContentTools();
    return Response.json({ ok: true, tools });
  } catch (error) {
    console.error("[admin/content/tools]", error);
    return Response.json({ error: "Failed to list tools." }, { status: 500 });
  }
}
