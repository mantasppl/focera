import { handleGetPublishedPostMetrics } from "@/lib/content/http";
import { guardApiRequest } from "@/lib/security/request";
import { isValidSlug } from "@/lib/content/slug";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const guarded = guardApiRequest(request, {
    bucket: "blog-post-metrics",
    limit: 120,
    windowMs: 60_000,
    requireSameOrigin: false,
  });
  if (guarded) return guarded;

  const { slug } = await context.params;
  if (!isValidSlug(slug)) {
    return Response.json({ error: "Post not found." }, { status: 404 });
  }
  return handleGetPublishedPostMetrics(slug);
}
