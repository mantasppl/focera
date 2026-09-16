import { requireAdminApi } from "@/lib/admin/guard";
import { isAdminApiRequest } from "@/lib/content/admin-access";
import { revalidatePostPaths } from "@/lib/content/revalidate";
import {
  createPost,
  deletePost,
  getPostById,
  getPostBySlug,
  getPublishedPostBySlug,
  listPosts,
  updatePost,
} from "@/lib/content/store";
import {
  validatePartialPostInput,
  validatePostInput,
} from "@/lib/content/validate";
import { readJsonBody } from "@/lib/security/request";

export function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function requirePostMutationAuth(request: Request) {
  return requireAdminApi(request, {
    bucket: "admin-content-mutate",
    limit: 60,
    windowMs: 60_000,
  });
}

export async function requirePostReadAuth(request: Request) {
  return requireAdminApi(request, {
    bucket: "admin-content-read",
    limit: 90,
    windowMs: 60_000,
    requireCsrf: false,
  });
}

function storeErrorResponse(error: unknown) {
  const code = error instanceof Error ? error.message : "";
  if (code === "SLUG_TAKEN") return jsonError("Slug is already in use.", 409);
  if (code === "INVALID_TOOL") return jsonError("Unknown tool id.", 400);
  if (code === "POST_NOT_FOUND") return jsonError("Post not found.", 404);
  console.error("[content]", error);
  return jsonError("Could not save post.", 500);
}

export async function handleListPosts(request: Request, requireAdmin: boolean) {
  if (requireAdmin) {
    const denied = await requirePostReadAuth(request);
    if (denied) return denied;
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const query = searchParams.get("q") || searchParams.get("search");
  const isAdmin = requireAdmin || isAdminApiRequest(request);

  if (status === "draft" && !isAdmin) {
    return jsonError("Unauthorized.", 401);
  }

  try {
    const result = await listPosts({
      status: isAdmin ? status : "published",
      q: query,
      limit: Number(searchParams.get("limit") || 50),
      offset: Number(searchParams.get("offset") || 0),
    });
    return Response.json({ ok: true, posts: result.items, total: result.total });
  } catch (error) {
    console.error("[content] list failed:", error);
    return jsonError("Failed to list posts.", 500);
  }
}

export async function handleCreatePost(request: Request) {
  const denied = await requirePostMutationAuth(request);
  if (denied) return denied;

  const parsed = await readJsonBody<unknown>(request, 500_000);
  if (!parsed.ok) return parsed.response;

  const validated = validatePostInput(parsed.data);
  if (!validated.ok) return jsonError(validated.error, 400);

  try {
    const post = await createPost(validated.data);
    revalidatePostPaths(post.slug);
    return Response.json({ ok: true, post }, { status: 201 });
  } catch (error) {
    return storeErrorResponse(error);
  }
}

async function resolvePostId(id: string): Promise<string | null> {
  const post = (await getPostById(id)) || (await getPostBySlug(id));
  return post?.id ?? null;
}

export async function handleGetPost(id: string, request: Request) {
  try {
    const post = (await getPostById(id)) || (await getPostBySlug(id));
    if (!post) return jsonError("Post not found.", 404);
    if (post.status !== "published" && !isAdminApiRequest(request)) {
      return jsonError("Unauthorized.", 401);
    }
    return Response.json({ ok: true, post });
  } catch (error) {
    console.error("[content] get failed:", error);
    return jsonError("Failed to load post.", 500);
  }
}

export async function handleUpdatePost(id: string, request: Request) {
  const denied = await requirePostMutationAuth(request);
  if (denied) return denied;

  const parsed = await readJsonBody<unknown>(request, 500_000);
  if (!parsed.ok) return parsed.response;

  const validated = validatePartialPostInput(parsed.data);
  if (!validated.ok) return jsonError(validated.error, 400);

  try {
    const postId = await resolvePostId(id);
    if (!postId) return jsonError("Post not found.", 404);
    const post = await updatePost(postId, validated.data);
    revalidatePostPaths(post.slug);
    return Response.json({ ok: true, post });
  } catch (error) {
    return storeErrorResponse(error);
  }
}

export async function handleDeletePost(id: string, request: Request) {
  const denied = await requirePostMutationAuth(request);
  if (denied) return denied;

  try {
    const postId = await resolvePostId(id);
    if (!postId) return jsonError("Post not found.", 404);
    const result = await deletePost(postId);
    revalidatePostPaths(result.slug);
    return Response.json({ ok: true, id: postId });
  } catch (error) {
    return storeErrorResponse(error);
  }
}

export async function handleGetPostBySlug(slug: string, request: Request) {
  try {
    const preview =
      new URL(request.url).searchParams.get("preview") === "true" &&
      isAdminApiRequest(request);
    const post = preview
      ? await getPostBySlug(slug)
      : await getPublishedPostBySlug(slug);
    if (!post) return jsonError("Post not found.", 404);
    return Response.json({ ok: true, post });
  } catch (error) {
    console.error("[content] slug lookup failed:", error);
    return jsonError("Failed to load post.", 500);
  }
}
