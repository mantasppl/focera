import { trackToolUsageServer } from "@/lib/analytics/track";
import { getToolBySlug } from "@/data/tools";
import {
  isTargetLanguageId,
  isTranslateLanguageId,
  languageLabel,
  MAX_TRANSLATE_CHUNK_CHARS,
  type TranslateLanguageId,
} from "@/lib/pdf-translator-core";
import { guardApiRequest } from "@/lib/security/request";

export const runtime = "nodejs";
export const maxDuration = 60;

const DEFAULT_TOOL_SLUG = "pdf-translator";
const TRANSLATE_TOOL_SLUGS = new Set([
  "pdf-translator",
  "translate-your-image",
]);

type TranslateBody = {
  text?: unknown;
  sourceLang?: unknown;
  targetLang?: unknown;
  toolSlug?: unknown;
};

function resolveToolSlug(value: unknown): string {
  if (typeof value === "string" && TRANSLATE_TOOL_SLUGS.has(value)) {
    return value;
  }
  return DEFAULT_TOOL_SLUG;
}

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function track(request: Request, success: boolean, toolSlug: string) {
  const tool = getToolBySlug(toolSlug);
  if (tool) {
    trackToolUsageServer(
      { toolId: tool.slug, toolName: tool.name, success },
      request,
    );
  }
}

function extractTranslatedText(payload: unknown): string | null {
  if (typeof payload === "string") {
    const trimmed = payload.trim();
    return trimmed || null;
  }

  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;

  if (typeof record.translatedText === "string" && record.translatedText.trim()) {
    return record.translatedText.trim();
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

function buildSystemPrompt(
  sourceLang: TranslateLanguageId,
  targetLang: Exclude<TranslateLanguageId, "auto">,
): string {
  const target = languageLabel(targetLang);
  const source =
    sourceLang === "auto"
      ? "the source language (auto-detect)"
      : languageLabel(sourceLang);

  return [
    "You are a professional document translator.",
    `Translate the user's text from ${source} into ${target}.`,
    "Return ONLY the translated text.",
    "Preserve paragraph breaks, lists, and page markers like \"--- Page N ---\".",
    "Do not add commentary, titles, quotes, or explanations.",
    "Keep numbers, emails, URLs, and proper nouns accurate when they should not change.",
  ].join(" ");
}

function cleanTranslation(text: string): string {
  return text
    .replace(/^(here(?:'s| is) (?:the |your )?translation[:\s-]*)/i, "")
    .replace(/^translated text[:\s-]*/i, "")
    .trim();
}

export async function POST(request: Request) {
  const guarded = guardApiRequest(request, {
    bucket: "pdf-translate",
    limit: 20,
    windowMs: 60_000,
    requireSameOrigin: true,
    maxBodyBytes: 32_768,
  });
  if (guarded) return guarded;

  let body: TranslateBody;

  try {
    body = (await request.json()) as TranslateBody;
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const toolSlug = resolveToolSlug(body.toolSlug);
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return jsonError("Nothing to translate.", 400);
  }

  if (text.length > MAX_TRANSLATE_CHUNK_CHARS) {
    return jsonError(
      `Each translation chunk must be ${MAX_TRANSLATE_CHUNK_CHARS.toLocaleString()} characters or fewer.`,
      400,
    );
  }

  if (!isTranslateLanguageId(body.sourceLang)) {
    return jsonError("Choose a valid source language.", 400);
  }

  if (!isTargetLanguageId(body.targetLang)) {
    return jsonError("Choose a valid target language.", 400);
  }

  if (body.sourceLang !== "auto" && body.sourceLang === body.targetLang) {
    return jsonError("Source and target languages must be different.", 400);
  }

  const apiKey = process.env.POLLINATIONS_API_KEY?.trim();
  const chatBody = {
    model: "openai",
    messages: [
      {
        role: "system",
        content: buildSystemPrompt(body.sourceLang, body.targetLang),
      },
      { role: "user", content: text },
    ],
    temperature: 0.2,
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
    track(request, false, toolSlug);
    return jsonError(
      "The translation service timed out. Wait a moment and try again.",
      504,
    );
  }

  if (!upstream.ok) {
    track(request, false, toolSlug);
    if (upstream.status === 429) {
      return jsonError(
        "Too many requests right now. Wait about 15 seconds and try again.",
        429,
      );
    }

    if (upstream.status === 401 || upstream.status === 402) {
      return jsonError(
        "Translation is temporarily unavailable. Try again in a minute.",
        503,
      );
    }

    return jsonError(
      "Could not translate that text right now. Try again shortly.",
      502,
    );
  }

  const contentType = upstream.headers.get("content-type") ?? "";
  let translated: string | null = null;

  if (contentType.includes("application/json")) {
    const data = (await upstream.json().catch(() => null)) as unknown;
    translated = extractTranslatedText(data);
  } else {
    const raw = (await upstream.text()).trim();
    translated = raw || null;
  }

  if (!translated) {
    track(request, false, toolSlug);
    return jsonError(
      "The translation service returned an empty result. Try again.",
      502,
    );
  }

  const cleaned = cleanTranslation(translated);
  if (!cleaned) {
    track(request, false, toolSlug);
    return jsonError(
      "The translation service returned an empty result. Try again.",
      502,
    );
  }

  track(request, true, toolSlug);

  return Response.json(
    { translatedText: cleaned },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
