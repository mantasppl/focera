import {
  buildContentImproverSystemPrompt,
  buildContentImproverUserPrompt,
  isContentImproverModeId,
  isContentImproverStrengthId,
  validateContentImproverText,
} from "@/lib/content-improver";
import {
  AiTextGenerateError,
  generateAiText,
} from "@/lib/ai-text-server";
import { trackToolUsageServer } from "@/lib/analytics/track";
import { getToolBySlug } from "@/data/tools";
import { guardApiRequest } from "@/lib/security/request";

export const runtime = "nodejs";
export const maxDuration = 60;

const TOOL_SLUG = "content-improver";

type ImproveBody = {
  text?: unknown;
  mode?: unknown;
  strength?: unknown;
  seed?: unknown;
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
    bucket: "content-improver",
    limit: 12,
    windowMs: 60_000,
    requireSameOrigin: true,
    maxBodyBytes: 40_960,
  });
  if (guarded) return guarded;

  let body: ImproveBody;

  try {
    body = (await request.json()) as ImproveBody;
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const text = typeof body.text === "string" ? body.text : "";
  const textError = validateContentImproverText(text);
  if (textError) {
    return jsonError(textError, 400);
  }

  if (!isContentImproverModeId(body.mode)) {
    return jsonError("Choose a valid improvement mode.", 400);
  }

  if (!isContentImproverStrengthId(body.strength)) {
    return jsonError("Choose a valid rewrite strength.", 400);
  }

  const seed =
    typeof body.seed === "number" &&
    Number.isFinite(body.seed) &&
    body.seed >= 0
      ? Math.floor(body.seed)
      : Math.floor(Math.random() * 1_000_000_000);

  const systemPrompt = buildContentImproverSystemPrompt(
    body.mode,
    body.strength,
  );
  const userPrompt = buildContentImproverUserPrompt(text);
  const temperature =
    body.mode === "creative" || body.mode === "humanize" ? 0.75 : 0.45;

  // Optional local mock for demos / offline QA when upstream models are unavailable.
  if (process.env.CONTENT_IMPROVER_MOCK === "1") {
    const improved = mockImproveText(text, body.mode, body.strength);
    track(request, true);
    return Response.json(
      {
        improved,
        seed,
        mode: body.mode,
        strength: body.strength,
        provider: "mock",
        mock: true,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  try {
    const result = await generateAiText({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature,
      seed,
      preferFast: true,
      timeoutMs: 55_000,
    });

    const cleaned = result.text
      .replace(
        /^(here(?:'s| is) (?:the |your )?(?:improved|rewritten|updated)(?: text| version)?[:\s-]*)/i,
        "",
      )
      .replace(/^```(?:\w+)?\n?([\s\S]*?)\n?```$/u, "$1")
      .trim();

    if (!cleaned) {
      track(request, false);
      return jsonError(
        "The improver returned an empty result. Try again.",
        502,
      );
    }

    track(request, true);

    return Response.json(
      {
        improved: cleaned,
        seed,
        mode: body.mode,
        strength: body.strength,
        provider: result.provider,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (err) {
    track(request, false);
    if (err instanceof AiTextGenerateError) {
      return jsonError(err.message, err.status);
    }
    return jsonError(
      "Could not improve that text. Try a shorter passage or a different mode.",
      502,
    );
  }
}

function mockImproveText(
  text: string,
  mode: string,
  strength: string,
): string {
  let out = text.trim();

  out = out
    .replace(/\bthere\b(?=\s+projects)/gi, "their")
    .replace(/\bthen\b(?=\s+before)/gi, "than")
    .replace(/\bmore easier\b/gi, "more easily")
    .replace(/\bare working\b/gi, "is working")
    .replace(/\s+/g, " ")
    .trim();

  if (mode === "formal") {
    out = out
      .replace(/\bhey\b/gi, "Hello")
      .replace(/\basap\b/gi, "as soon as possible")
      .replace(/\bchat through\b/gi, "discuss");
  }

  if (mode === "shorten" || strength === "strong") {
    out = out
      .replace(/\bhopefully\b/gi, "")
      .replace(/\bjust checking if\b/gi, "Checking whether")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  if (mode === "expand") {
    out = `${out} This clearer wording keeps the original intent while making the message easier to read.`;
  }

  if (mode === "casual") {
    out = out.replace(/\bHello\b/g, "Hey");
  }

  return out;
}
