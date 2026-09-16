import {
  handleCreatePost,
  handleListPosts,
} from "@/lib/content/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return handleListPosts(request, true);
}

export async function POST(request: Request) {
  return handleCreatePost(request);
}
