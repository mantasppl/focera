import { listContentTools } from "@/lib/content/db";
import { guardApiRequest } from "@/lib/security/request";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const guarded = guardApiRequest(request, {
    bucket: "content-tools",
    limit: 120,
    windowMs: 60_000,
    requireSameOrigin: false,
  });
  if (guarded) return guarded;

  try {
    const tools = await listContentTools();
    return Response.json({ ok: true, tools });
  } catch (error) {
    console.error("[content] tools list failed:", error);
    return Response.json({ error: "Failed to list tools." }, { status: 500 });
  }
}
