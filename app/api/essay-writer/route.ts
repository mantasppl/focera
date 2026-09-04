import {
  buildEssaySystemPrompt,
  buildEssayUserPrompt,
  essayTemperature,
  isEssayCitationId,
  isEssayLevelId,
  isEssayLengthId,
  isEssayOutputId,
  isEssayTypeId,
  isEssayVoiceId,
  validateEssayNotes,
  validateEssayTopic,
} from "@/lib/essay-writer";
import {
  AiTextGenerateError,
  generateAiText,
} from "@/lib/ai-text-server";
import { trackToolUsageServer } from "@/lib/analytics/track";
import { getToolBySlug } from "@/data/tools";
import { guardApiRequest } from "@/lib/security/request";

export const runtime = "nodejs";
export const maxDuration = 60;

const TOOL_SLUG = "essay-writer";

type EssayBody = {
  topic?: unknown;
  notes?: unknown;
  type?: unknown;
  level?: unknown;
  length?: unknown;
  citation?: unknown;
  voice?: unknown;
  output?: unknown;
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
    bucket: "essay-writer",
    limit: 8,
    windowMs: 60_000,
    requireSameOrigin: true,
    maxBodyBytes: 16_384,
  });
  if (guarded) return guarded;

  let body: EssayBody;

  try {
    body = (await request.json()) as EssayBody;
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const topic = typeof body.topic === "string" ? body.topic : "";
  const notes = typeof body.notes === "string" ? body.notes : "";

  const topicError = validateEssayTopic(topic);
  if (topicError) {
    return jsonError(topicError, 400);
  }

  const notesError = validateEssayNotes(notes);
  if (notesError) {
    return jsonError(notesError, 400);
  }

  if (!isEssayTypeId(body.type)) {
    return jsonError("Choose a valid essay type.", 400);
  }

  if (!isEssayLevelId(body.level)) {
    return jsonError("Choose a valid academic level.", 400);
  }

  if (!isEssayLengthId(body.length)) {
    return jsonError("Choose a valid essay length.", 400);
  }

  if (!isEssayCitationId(body.citation)) {
    return jsonError("Choose a valid citation style.", 400);
  }

  if (!isEssayVoiceId(body.voice)) {
    return jsonError("Choose a valid writing voice.", 400);
  }

  if (!isEssayOutputId(body.output)) {
    return jsonError("Choose a valid output format.", 400);
  }

  const seed =
    typeof body.seed === "number" &&
    Number.isFinite(body.seed) &&
    body.seed >= 0
      ? Math.floor(body.seed)
      : Math.floor(Math.random() * 1_000_000_000);

  const systemPrompt = buildEssaySystemPrompt(
    body.type,
    body.level,
    body.length,
    body.citation,
    body.voice,
    body.output,
  );
  const userPrompt = buildEssayUserPrompt(topic, notes);
  const temperature = essayTemperature(body.type, body.voice);
  const maxTokens = body.length === "long" ? 4096 : 3072;

  if (process.env.ESSAY_WRITER_MOCK === "1") {
    const essay = mockEssay(topic, body.type, body.level, body.output);
    track(request, true);
    return Response.json(
      {
        essay,
        seed,
        type: body.type,
        level: body.level,
        length: body.length,
        citation: body.citation,
        voice: body.voice,
        output: body.output,
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
      preferFast: body.length === "short",
      timeoutMs: 55_000,
      maxTokens,
    });

    const cleaned = result.text
      .replace(
        /^(here(?:'s| is) (?:the |your )?(?:essay|draft|outline)[:\s-]*)/i,
        "",
      )
      .replace(/^```(?:\w+)?\n?([\s\S]*?)\n?```$/u, "$1")
      .trim();

    if (!cleaned) {
      track(request, false);
      return jsonError(
        "The essay writer returned an empty result. Try again.",
        502,
      );
    }

    track(request, true);

    return Response.json(
      {
        essay: cleaned,
        seed,
        type: body.type,
        level: body.level,
        length: body.length,
        citation: body.citation,
        voice: body.voice,
        output: body.output,
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
      "Could not write that essay. Try a shorter length or a clearer topic.",
      502,
    );
  }
}

function mockEssay(
  topic: string,
  type: string,
  level: string,
  output: string,
): string {
  const title = topic.replace(/\s+/g, " ").trim().replace(/\?$/, "");
  const heading = title.charAt(0).toUpperCase() + title.slice(1);
  const body = [
    `${heading} remains a useful subject because it asks readers to weigh evidence rather than slogans. A clear thesis helps: the strongest position is the one that names a specific problem, explains why it matters, and shows a practical next step.`,
    `At a ${level} level, an ${type} essay works best when each paragraph does one job. The first body paragraph defines the issue in concrete terms. The next paragraph presents a reason with an example a reader can picture. A later paragraph acknowledges a fair objection, then answers it without dismissing the other side.`,
    `The conclusion should not repeat the introduction word for word. It should restate the claim in plainer language and leave the reader with a decision, a question, or a next action. That structure is enough to turn a prompt into a complete draft you can revise in your own voice.`,
  ].join("\n\n");

  if (output === "outline-essay") {
    return [
      heading,
      "",
      "Outline",
      "- Introduction and thesis",
      "- Define the issue with a concrete example",
      "- Main reason and supporting detail",
      "- Address a counterargument",
      "- Conclusion with a next step",
      "",
      "Essay",
      "",
      body,
    ].join("\n");
  }

  return `${heading}\n\n${body}`;
}
