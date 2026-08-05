import { brandedUrlPdfFilename, isUrlToPdfPageFormat } from "@/lib/url-to-pdf";
import {
  renderUrlToPdf,
  UrlToPdfError,
} from "@/lib/url-to-pdf-server";
import { trackToolUsageServer } from "@/lib/analytics/track";
import { getToolBySlug } from "@/data/tools";
import { publicErrorMessage } from "@/lib/security/public-error";
import { guardApiRequest } from "@/lib/security/request";

export const runtime = "nodejs";
export const maxDuration = 60;

const TOOL_SLUG = "url-to-pdf";

type RequestBody = {
  url?: unknown;
  format?: unknown;
};

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function track(request: Request, success: boolean) {
  const tool = getToolBySlug(TOOL_SLUG);
  if (tool) {
    trackToolUsageServer(
      { toolId: tool.slug, toolName: tool.name, success },
      request,
    );
  }
}

export async function POST(request: Request) {
  const guarded = guardApiRequest(request, {
    bucket: "url-to-pdf",
    limit: 8,
    windowMs: 60_000,
    requireSameOrigin: true,
    maxBodyBytes: 8_192,
  });
  if (guarded) return guarded;

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const url = typeof body.url === "string" ? body.url : "";
  const format = isUrlToPdfPageFormat(body.format) ? body.format : "full";

  try {
    const result = await renderUrlToPdf({ url, format });
    const filename = brandedUrlPdfFilename(result.finalUrl);

    track(request, true);

    return new Response(new Uint8Array(result.pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(result.pdf.length),
        "Cache-Control": "private, no-store",
        "X-Page-Title": encodeURIComponent(result.title.slice(0, 200)),
        "X-Final-Url": encodeURIComponent(result.finalUrl.slice(0, 2048)),
        "X-Page-Mode": result.pageCountHint,
      },
    });
  } catch (err) {
    if (err instanceof UrlToPdfError) {
      if (err.status !== 400) track(request, false);
      return jsonError(err.message, err.status);
    }

    const message = publicErrorMessage(
      err,
      "Could not convert this webpage to PDF.",
    );

    const status =
      /valid webpage|Paste a webpage|HTTPS|credentials|cannot be converted|too long|resolve/i.test(
        message,
      )
        ? 400
        : /too large|not found/i.test(message)
          ? 422
          : /Timed out/i.test(message)
            ? 504
            : /temporarily unavailable/i.test(message)
              ? 503
              : 502;

    if (status !== 400) track(request, false);
    return jsonError(message, status);
  }
}
