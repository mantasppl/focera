import {
  handleDeletePost,
  handleGetPost,
  handleUpdatePost,
} from "@/lib/content/http";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return handleGetPost(id, request);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return handleUpdatePost(id, request);
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return handleDeletePost(id, request);
}
