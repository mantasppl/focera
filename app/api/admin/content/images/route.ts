import { requireAdminApi } from "@/lib/admin/guard";
import { jsonError } from "@/lib/content/http";
import {
  CONTENT_IMAGE_MAX_BYTES,
  contentImagePublicUrl,
  saveContentImage,
} from "@/lib/content/images";
import { enforceContentLength } from "@/lib/security/request";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const denied = await requireAdminApi(request, {
    bucket: "admin-content-image-upload",
    limit: 30,
    windowMs: 60_000,
  });
  if (denied) return denied;

  const tooLarge = enforceContentLength(request, CONTENT_IMAGE_MAX_BYTES + 64_000);
  if (tooLarge) return tooLarge;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("Could not read the uploaded file.", 400);
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return jsonError("Choose a JPG, PNG, WebP, or GIF image.", 400);
  }
  if (file.size > CONTENT_IMAGE_MAX_BYTES) {
    return jsonError("Image must be 4 MB or smaller.", 413);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  try {
    const saved = await saveContentImage({
      filename: file.name || "image",
      bytes,
    });
    return Response.json(
      {
        ok: true,
        url: contentImagePublicUrl(saved.id, request),
        path: saved.url,
        filename: saved.filename,
        mime: saved.mime,
      },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "UNSUPPORTED_IMAGE") {
      return jsonError("Upload a JPG, PNG, WebP, or GIF image.", 400);
    }
    if (code === "IMAGE_TOO_LARGE") {
      return jsonError("Image must be 4 MB or smaller.", 413);
    }
    console.error("[content/images] upload failed:", error);
    return jsonError("Could not upload the image.", 500);
  }
}
