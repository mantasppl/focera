import { requireAdminApi } from "@/lib/admin/guard";
import {
  GeneratePostError,
  generateAndSavePost,
} from "@/lib/content/generate-post";
import { jsonError } from "@/lib/content/http";
import { readJsonBody } from "@/lib/security/request";

export const runtime = "nodejs";
export const maxDuration = 60;

type GenerateBody = {
  keyword?: unknown;
};

function normalizeKeyword(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim();
}

export async function POST(request: Request) {
  const denied = await requireAdminApi(request, {
    bucket: "admin-ai-generate-post",
    limit: 8,
    windowMs: 60_000,
  });
  if (denied) return denied;

  const parsed = await readJsonBody<GenerateBody>(request, 4_096);
  if (!parsed.ok) return parsed.response;

  const keyword = normalizeKeyword(parsed.data.keyword);
  if (keyword.length < 2) {
    return jsonError("Enter a keyword of at least 2 characters.", 400);
  }
  if (keyword.length > 120) {
    return jsonError("Keyword must be 120 characters or fewer.", 400);
  }

  try {
    const post = await generateAndSavePost(keyword);
    return Response.json(
      { ok: true, post },
      {
        status: 201,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    if (error instanceof GeneratePostError) {
      return jsonError(error.message, error.status);
    }
    console.error("[ai/generate-post]", error);
    return jsonError("Could not generate a blog post. Try again.", 500);
  }
}
