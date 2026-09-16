import { handleGetPostBySlug } from "@/lib/content/http";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  return handleGetPostBySlug(slug, request);
}
