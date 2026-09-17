import { CONTENT_IMAGE_ID_RE, getContentImage } from "@/lib/content/images";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!CONTENT_IMAGE_ID_RE.test(id)) {
    return new Response("Not found", { status: 404 });
  }

  const image = await getContentImage(id);
  if (!image) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(Buffer.from(image.bytes), {
    status: 200,
    headers: {
      "Content-Type": image.mime,
      "Content-Length": String(image.bytes.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": `inline; filename="${image.filename.replace(/"/g, "")}"`,
    },
  });
}
