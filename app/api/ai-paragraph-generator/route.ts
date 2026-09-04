import {
  buildParagraphSystemPrompt,
  buildParagraphUserPrompt,
  isParagraphCountId,
  isParagraphLengthId,
  isParagraphPurposeId,
  isParagraphToneId,
  paragraphMaxTokens,
  paragraphTemperature,
  validateParagraphKeywords,
  validateParagraphTopic,
} from "@/lib/ai-paragraph-generator";
import {
  AiTextGenerateError,
  generateAiText,
} from "@/lib/ai-text-server";
import { trackToolUsageServer } from "@/lib/analytics/track";
import { getToolBySlug } from "@/data/tools";
import { guardApiRequest } from "@/lib/security/request";

export const runtime = "nodejs";
export const maxDuration = 60;

const TOOL_SLUG = "ai-paragraph-generator";

type ParagraphBody = {
  topic?: unknown;
  keywords?: unknown;
  tone?: unknown;
  length?: unknown;
  count?: unknown;
  purpose?: unknown;
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
    bucket: "ai-paragraph-generator",
    limit: 12,
    windowMs: 60_000,
    requireSameOrigin: true,
    maxBodyBytes: 12_288,
  });
  if (guarded) return guarded;

  let body: ParagraphBody;

  try {
    body = (await request.json()) as ParagraphBody;
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const topic = typeof body.topic === "string" ? body.topic : "";
  const keywords = typeof body.keywords === "string" ? body.keywords : "";

  const topicError = validateParagraphTopic(topic);
  if (topicError) {
    return jsonError(topicError, 400);
  }

  const keywordsError = validateParagraphKeywords(keywords);
  if (keywordsError) {
    return jsonError(keywordsError, 400);
  }

  if (!isParagraphToneId(body.tone)) {
    return jsonError("Choose a valid tone.", 400);
  }

  if (!isParagraphLengthId(body.length)) {
    return jsonError("Choose a valid paragraph length.", 400);
  }

  if (!isParagraphCountId(body.count)) {
    return jsonError("Choose a valid paragraph count.", 400);
  }

  if (!isParagraphPurposeId(body.purpose)) {
    return jsonError("Choose a valid purpose.", 400);
  }

  const seed =
    typeof body.seed === "number" &&
    Number.isFinite(body.seed) &&
    body.seed >= 0
      ? Math.floor(body.seed)
      : Math.floor(Math.random() * 1_000_000_000);

  const systemPrompt = buildParagraphSystemPrompt(
    body.tone,
    body.length,
    body.count,
    body.purpose,
  );
  const userPrompt = buildParagraphUserPrompt(topic, keywords);
  const temperature = paragraphTemperature(body.tone);
  const maxTokens = paragraphMaxTokens(body.length, body.count);

  if (process.env.AI_PARAGRAPH_GENERATOR_MOCK === "1") {
    const paragraphs = mockParagraphs(topic, body.count, body.tone);
    track(request, true);
    return Response.json(
      {
        paragraphs,
        seed,
        tone: body.tone,
        length: body.length,
        count: body.count,
        purpose: body.purpose,
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
      preferFast: body.length === "short" && body.count === "1",
      timeoutMs: 55_000,
      maxTokens,
    });

    const cleaned = result.text
      .replace(
        /^(here(?:'s| is) (?:the |your )?(?:paragraphs?|text|draft)[:\s-]*)/i,
        "",
      )
      .replace(/^```(?:\w+)?\n?([\s\S]*?)\n?```$/u, "$1")
      .trim();

    if (!cleaned) {
      track(request, false);
      return jsonError(
        "The paragraph generator returned an empty result. Try again.",
        502,
      );
    }

    track(request, true);

    return Response.json(
      {
        paragraphs: cleaned,
        seed,
        tone: body.tone,
        length: body.length,
        count: body.count,
        purpose: body.purpose,
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
      "Could not generate those paragraphs. Try a shorter length or a clearer topic.",
      502,
    );
  }
}

function mockParagraphs(topic: string, countId: string, tone: string): string {
  const idea = topic.replace(/\s+/g, " ").trim().replace(/\?$/, "");
  const subject = idea.charAt(0).toUpperCase() + idea.slice(1);
  const count =
    countId === "5" ? 5 : countId === "3" ? 3 : countId === "2" ? 2 : 1;

  const templates = [
    `${subject} works best when you start with one clear idea and support it with a concrete detail a reader can picture. A ${tone} paragraph should sound intentional: say what matters, why it matters, and what follows next.`,
    `The next point should add a new angle rather than restate the first. Use an everyday example, then explain the implication so the reader understands the payoff without filler transitions.`,
    `If you need more depth, address a fair objection or a practical constraint. That keeps the writing honest and helps the paragraph feel finished instead of padded.`,
    `When several paragraphs sit together, each one should own a single job — define, illustrate, or resolve — so the page stays easy to scan.`,
    `Close with a forward step: a decision, a question, or a small action the reader can take. That turns a draft into something useful you can revise in your own voice.`,
  ];

  return templates.slice(0, count).join("\n\n");
}
