/**
 * Shared server-side text generation for AI writing tools.
 * Tries Pollinations first (optional key), then falls back to Groq chat
 * when Pollinations returns auth/payment errors or is unreachable.
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

function extractChatText(payload: unknown): string | null {
  if (typeof payload === "string") {
    const trimmed = payload.trim();
    return trimmed || null;
  }

  if (!payload || typeof payload !== "object") return null;

  const record = payload as Record<string, unknown>;

  for (const key of ["text", "content", "story", "improved", "translation"] as const) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
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

async function generateWithGroq(
  options: AiTextGenerateOptions,
  apiKey: string,
): Promise<{ ok: true; text: string } | { ok: false; status: number }> {
  const timeoutMs = options.timeoutMs ?? 55_000;
  const model = options.preferFast
    ? "llama-3.1-8b-instant"
    : "llama-3.3-70b-versatile";

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
        seed:
          typeof options.seed === "number" && Number.isFinite(options.seed)
            ? Math.floor(options.seed)
            : undefined,
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

/**
 * Generate assistant text. Prefer Pollinations; on auth/payment failure or
 * empty key budget, retry anonymously, then fall back to Groq when configured.
 */
export async function generateAiText(
  options: AiTextGenerateOptions,
): Promise<AiTextGenerateResult> {
  if (!options.messages.length) {
    throw new AiTextGenerateError("Missing prompt messages.", 400);
  }

  const pollinationsKey = process.env.POLLINATIONS_API_KEY?.trim() || undefined;
  const groqKey = process.env.GROQ_API_KEY?.trim() || undefined;

  // 1) Pollinations with key (if present)
  let pollinations = await generateWithPollinations(options, pollinationsKey);

  // 2) If keyed request hit auth/payment limits, retry anonymously
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

  // 3) Groq fallback (already used elsewhere on Focera for transcription)
  if (groqKey) {
    const groq = await generateWithGroq(options, groqKey);
    if (groq.ok) {
      return { text: groq.text, provider: "groq" };
    }

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

    if (groq.status === 504) {
      throw new AiTextGenerateError(
        "The AI service timed out. Wait a moment and try again.",
        504,
      );
    }
  }

  if (pollinations.status === 429) {
    throw new AiTextGenerateError(
      "Too many requests right now. Wait about 15 seconds and try again.",
      429,
    );
  }

  if (pollinations.status === 504) {
    throw new AiTextGenerateError(
      "The AI service timed out. Wait a moment and try again.",
      504,
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
