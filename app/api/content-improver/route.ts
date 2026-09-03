import {
  buildContentImproverSystemPrompt,
  buildContentImproverUserPrompt,
  isContentImproverModeId,
  isContentImproverStrengthId,
  validateContentImproverText,
} from "@/lib/content-improver";
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

function extractImprovedText(payload: unknown): string | null {
  if (typeof payload === "string") {
    const trimmed = payload.trim();
    return trimmed || null;
  }

  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;

  if (typeof record.improved === "string" && record.improved.trim()) {
    return record.improved.trim();
  }

  if (typeof record.text === "string" && record.text.trim()) {
    return record.text.trim();
  }

  if (typeof record.content === "string" && record.content.trim()) {
    return record.content.trim();
  }

  const choices = record.choices;
  if (Array.isArray(choices) && choices[0] && typeof choices[0] === "object") {
    const choice = choices[0] as Record<string, unknown>;
    const message = choice.message;
    if (message && typeof message === "object") {
      const content = (message as Record<string, unknown>).content;
      if (typeof content === "string" && content.trim()) {
        return content.trim();
      }
    }
    if (typeof choice.text === "string" && choice.text.trim()) {
      return choice.text.trim();
    }
  }

  return null;
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
  const apiKey = process.env.POLLINATIONS_API_KEY?.trim();

  const chatBody = {
    model: "openai",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    seed,
    temperature: body.mode === "creative" || body.mode === "humanize" ? 0.75 : 0.45,
  };

  const headers: Record<string, string> = {
    Accept: "application/json, text/plain;q=0.9,*/*;q=0.8",
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  let upstream: Response;
  try {
    upstream = await fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      headers,
      body: JSON.stringify(chatBody),
      cache: "no-store",
      signal: AbortSignal.timeout(55_000),
    });
  } catch {
    track(request, false);
    return jsonError(
      "The content improver timed out. Wait a moment and try again.",
      504,
    );
  }

  if (!upstream.ok) {
    track(request, false);
    if (upstream.status === 429) {
      return jsonError(
        "Too many requests right now. Wait about 15 seconds and try again.",
        429,
      );
    }

    if (upstream.status === 401 || upstream.status === 402) {
      return jsonError(
        "Content improvement is temporarily unavailable. Try again in a minute.",
        503,
      );
    }

    return jsonError(
      "Could not improve that text. Try a shorter passage or a different mode.",
      502,
    );
  }

  const contentType = upstream.headers.get("content-type") ?? "";
  let improved: string | null = null;

  if (contentType.includes("application/json")) {
    const data = (await upstream.json().catch(() => null)) as unknown;
    improved = extractImprovedText(data);
  } else {
    const raw = (await upstream.text()).trim();
    improved = raw || null;
  }

  if (!improved) {
    track(request, false);
    return jsonError(
      "The improver returned an empty result. Try again.",
      502,
    );
  }

  const cleaned = improved
    .replace(
      /^(here(?:'s| is) (?:the |your )?(?:improved|rewritten|updated)(?: text| version)?[:\s-]*)/i,
      "",
    )
    .replace(/^```(?:\w+)?\n?([\s\S]*?)\n?```$/u, "$1")
    .trim();

  track(request, true);

  return Response.json(
    {
      improved: cleaned || improved,
      seed,
      mode: body.mode,
      strength: body.strength,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
