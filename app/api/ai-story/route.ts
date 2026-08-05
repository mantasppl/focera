import {
  buildAiStorySystemPrompt,
  buildAiStoryUserPrompt,
  isAiStoryGenreId,
  isAiStoryLengthId,
  isAiStoryToneId,
  validateAiStoryPrompt,
} from "@/lib/ai-story";
import { trackToolUsageServer } from "@/lib/analytics/track";
import { getToolBySlug } from "@/data/tools";
import { guardApiRequest } from "@/lib/security/request";

export const runtime = "nodejs";
export const maxDuration = 60;

const TOOL_SLUG = "ai-story-generator";

type GenerateBody = {
  prompt?: unknown;
  genre?: unknown;
  length?: unknown;
  tone?: unknown;
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

function extractStoryText(payload: unknown): string | null {
  if (typeof payload === "string") {
    const trimmed = payload.trim();
    return trimmed || null;
  }

  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;

  if (typeof record.story === "string" && record.story.trim()) {
    return record.story.trim();
  }

  if (typeof record.text === "string" && record.text.trim()) {
    return record.text.trim();
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
    bucket: "ai-story",
    limit: 15,
    windowMs: 60_000,
    requireSameOrigin: true,
    maxBodyBytes: 32_768,
  });
  if (guarded) return guarded;

  let body: GenerateBody;

  try {
    body = (await request.json()) as GenerateBody;
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const prompt = typeof body.prompt === "string" ? body.prompt : "";
  const promptError = validateAiStoryPrompt(prompt);
  if (promptError) {
    return jsonError(promptError, 400);
  }

  if (!isAiStoryGenreId(body.genre)) {
    return jsonError("Choose a valid story genre.", 400);
  }

  if (!isAiStoryLengthId(body.length)) {
    return jsonError("Choose a valid story length.", 400);
  }

  if (!isAiStoryToneId(body.tone)) {
    return jsonError("Choose a valid story tone.", 400);
  }

  const seed =
    typeof body.seed === "number" &&
    Number.isFinite(body.seed) &&
    body.seed >= 0
      ? Math.floor(body.seed)
      : Math.floor(Math.random() * 1_000_000_000);

  const systemPrompt = buildAiStorySystemPrompt(
    body.genre,
    body.length,
    body.tone,
  );
  const userPrompt = buildAiStoryUserPrompt(prompt);
  const apiKey = process.env.POLLINATIONS_API_KEY?.trim();

  const chatBody = {
    model: "openai",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    seed,
    temperature: 0.9,
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
      "The story service timed out. Wait a moment and try again.",
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
        "Story generation is temporarily unavailable. Try again in a minute.",
        503,
      );
    }

    return jsonError(
      "Could not generate a story from that prompt. Try a different idea.",
      502,
    );
  }

  const contentType = upstream.headers.get("content-type") ?? "";
  let story: string | null = null;

  if (contentType.includes("application/json")) {
    const data = (await upstream.json().catch(() => null)) as unknown;
    story = extractStoryText(data);
  } else {
    const text = (await upstream.text()).trim();
    story = text || null;
  }

  if (!story) {
    track(request, false);
    return jsonError(
      "The story service returned an empty result. Try again.",
      502,
    );
  }

  // Strip common model preambles if they sneak through.
  const cleaned = story
    .replace(/^(here(?:'s| is) (?:a |your )?story[:\s-]*)/i, "")
    .trim();

  track(request, true);

  return Response.json(
    {
      story: cleaned || story,
      seed,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
