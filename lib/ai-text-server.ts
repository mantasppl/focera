/**
 * Shared server-side text generation for AI writing tools.
 * Prefers Groq chat (GROQ_API_KEY) because anonymous Pollinations text
 * now returns 402 for real rewrite prompts. Pollinations remains a fallback.
 */

export type AiTextMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AiTextGenerateOptions = {
  messages: AiTextMessage[];
  temperature?: number;
  seed?: number;
  /** Prefer a faster Groq model for short rewrites. */
  preferFast?: boolean;
  timeoutMs?: number;
  /** Max completion tokens for Groq (default 4096). */
  maxTokens?: number;
};

export type AiTextGenerateResult = {
  text: string;
  provider: "pollinations" | "groq";
};

export class AiTextGenerateError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AiTextGenerateError";
    this.status = status;
  }
}

function textFromContent(content: unknown): string | null {
  if (typeof content === "string") {
    const trimmed = content.trim();
    return trimmed || null;
  }

  if (!Array.isArray(content)) return null;

  const parts = content
    .map((part) => {
      if (typeof part === "string") return part;
      if (!part || typeof part !== "object") return "";
      const record = part as Record<string, unknown>;
      if (typeof record.text === "string") return record.text;
      if (typeof record.content === "string") return record.content;
      return "";
    })
    .join("")
    .trim();

  return parts || null;
}

function extractChatText(payload: unknown): string | null {
  if (typeof payload === "string") {
    const trimmed = payload.trim();
    return trimmed || null;
  }

  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;

  for (const key of [
    "text",
    "content",
    "story",
    "essay",
    "improved",
    "translation",
  ] as const) {
    const fromField = textFromContent(record[key]);
    if (fromField) return fromField;
  }

  const choices = record.choices;
  if (Array.isArray(choices) && choices[0] && typeof choices[0] === "object") {
    const choice = choices[0] as Record<string, unknown>;
    const message = choice.message;
    if (message && typeof message === "object") {
      const fromMessage = textFromContent(
        (message as Record<string, unknown>).content,
      );
      if (fromMessage) return fromMessage;
    }
    const fromChoice = textFromContent(choice.text);
    if (fromChoice) return fromChoice;
  }

  return null;
}

async function readUpstreamText(response: Response): Promise<string | null> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const data = (await response.json().catch(() => null)) as unknown;
    return extractChatText(data);
  }
  const text = (await response.text()).trim();
  return text || null;
}

async function generateWithPollinations(
  options: AiTextGenerateOptions,
  apiKey: string | undefined,
): Promise<{ ok: true; text: string } | { ok: false; status: number }> {
  const timeoutMs = options.timeoutMs ?? 55_000;
  const headers: Record<string, string> = {
    Accept: "application/json, text/plain;q=0.9,*/*;q=0.8",
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const chatBody: Record<string, unknown> = {
    model: "openai",
    messages: options.messages,
    temperature: options.temperature ?? 0.5,
  };
  if (typeof options.seed === "number" && Number.isFinite(options.seed)) {
    chatBody.seed = Math.floor(options.seed);
  }

  let response: Response;
  try {
    response = await fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      headers,
      body: JSON.stringify(chatBody),
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    return { ok: false, status: 504 };
  }

  if (!response.ok) {
    return { ok: false, status: response.status };
  }

  const text = await readUpstreamText(response);
  if (!text) {
    return { ok: false, status: 502 };
  }

  return { ok: true, text };
}

const GROQ_CHAT_MODELS_FAST = [
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
] as const;
const GROQ_CHAT_MODELS_QUALITY = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
] as const;

function groqModelsFor(options: AiTextGenerateOptions): readonly string[] {
  return options.preferFast ? GROQ_CHAT_MODELS_FAST : GROQ_CHAT_MODELS_QUALITY;
}

function shouldTryNextGroqModel(status: number): boolean {
  return status === 400 || status === 404 || status === 422;
}

async function generateWithGroqModel(
  options: AiTextGenerateOptions,
  apiKey: string,
  model: string,
  includeSeed: boolean,
): Promise<{ ok: true; text: string } | { ok: false; status: number }> {
  const timeoutMs = options.timeoutMs ?? 55_000;
  const seed =
    includeSeed &&
    typeof options.seed === "number" &&
    Number.isFinite(options.seed)
      ? Math.floor(options.seed)
      : undefined;

  let response: Response;
  try {
    response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: options.messages,
        temperature: options.temperature ?? 0.5,
        max_tokens:
          typeof options.maxTokens === "number" &&
          Number.isFinite(options.maxTokens)
            ? Math.min(8192, Math.max(256, Math.floor(options.maxTokens)))
            : 4096,
        seed,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    return { ok: false, status: 504 };
  }

  if (!response.ok) {
    return { ok: false, status: response.status };
  }

  const text = await readUpstreamText(response);
  if (!text) {
    return { ok: false, status: 502 };
  }

  return { ok: true, text };
}

async function generateWithGroq(
  options: AiTextGenerateOptions,
  apiKey: string,
): Promise<{ ok: true; text: string } | { ok: false; status: number }> {
  const hasSeed =
    typeof options.seed === "number" && Number.isFinite(options.seed);
  let lastStatus = 502;

  for (const model of groqModelsFor(options)) {
    let result = await generateWithGroqModel(options, apiKey, model, hasSeed);

    // Some Groq chat models reject seed; retry the same model without it.
    if (!result.ok && result.status === 400 && hasSeed) {
      result = await generateWithGroqModel(options, apiKey, model, false);
    }

    if (result.ok) return result;

    lastStatus = result.status;
    if (!shouldTryNextGroqModel(result.status)) {
      return result;
    }
  }

  return { ok: false, status: lastStatus };
}

/**
 * Generate assistant text. Prefer Groq; if it is missing or fails, try
 * Pollinations (keyed, then anonymous on 401/402).
 */
export async function generateAiText(
  options: AiTextGenerateOptions,
): Promise<AiTextGenerateResult> {
  if (!options.messages.length) {
    throw new AiTextGenerateError("Missing prompt messages.", 400);
  }

  const pollinationsKey = process.env.POLLINATIONS_API_KEY?.trim() || undefined;
  const groqKey = process.env.GROQ_API_KEY?.trim() || undefined;

  let groqStatus: number | undefined;

  if (groqKey) {
    const groq = await generateWithGroq(options, groqKey);
    if (groq.ok) {
      return { text: groq.text, provider: "groq" };
    }

    groqStatus = groq.status;

    if (groq.status === 429) {
      throw new AiTextGenerateError(
        "Too many requests right now. Wait about 15 seconds and try again.",
        429,
      );
    }

    if (groq.status === 401 || groq.status === 403) {
      throw new AiTextGenerateError(
        "AI text generation is temporarily unavailable. Try again in a minute.",
        503,
      );
    }
  }

  let pollinations = await generateWithPollinations(options, pollinationsKey);

  if (
    !pollinations.ok &&
    pollinationsKey &&
    (pollinations.status === 401 || pollinations.status === 402)
  ) {
    pollinations = await generateWithPollinations(options, undefined);
  }

  if (pollinations.ok) {
    return { text: pollinations.text, provider: "pollinations" };
  }

  if (groqStatus === 504 || pollinations.status === 504) {
    throw new AiTextGenerateError(
      "The AI service timed out. Wait a moment and try again.",
      504,
    );
  }

  if (pollinations.status === 429) {
    throw new AiTextGenerateError(
      "Too many requests right now. Wait about 15 seconds and try again.",
      429,
    );
  }

  if (pollinations.status === 401 || pollinations.status === 402) {
    throw new AiTextGenerateError(
      groqKey
        ? "AI text generation is temporarily unavailable. Try again in a minute."
        : "AI text generation is temporarily unavailable. Configure GROQ_API_KEY or a funded POLLINATIONS_API_KEY, then try again.",
      503,
    );
  }

  throw new AiTextGenerateError(
    "Could not generate a response right now. Try again shortly.",
    502,
  );
}
