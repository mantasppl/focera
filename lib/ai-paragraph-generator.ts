import { downloadBlob } from "@/lib/image";

export const PARAGRAPH_TONES = [
  {
    id: "neutral",
    label: "Neutral",
    hint: "Clear and balanced",
    cue: "a clear, neutral voice — informative without hype",
  },
  {
    id: "formal",
    label: "Formal",
    hint: "Professional prose",
    cue: "a formal, professional voice with precise wording",
  },
  {
    id: "casual",
    label: "Casual",
    hint: "Conversational",
    cue: "a casual, conversational voice that still reads cleanly",
  },
  {
    id: "persuasive",
    label: "Persuasive",
    hint: "Convince the reader",
    cue: "a persuasive voice that builds a clear case without sounding salesy",
  },
  {
    id: "friendly",
    label: "Friendly",
    hint: "Warm and approachable",
    cue: "a warm, friendly voice that feels approachable and human",
  },
  {
    id: "professional",
    label: "Professional",
    hint: "Business-ready",
    cue: "a polished business voice suited to workplace and client writing",
  },
] as const;

export type ParagraphToneId = (typeof PARAGRAPH_TONES)[number]["id"];

export const PARAGRAPH_LENGTHS = [
  {
    id: "short",
    label: "Short",
    hint: "~50 words each",
    instruction:
      "Write each paragraph about 40–60 words. Keep sentences tight and finish every paragraph completely.",
  },
  {
    id: "medium",
    label: "Medium",
    hint: "~100 words each",
    instruction:
      "Write each paragraph about 90–120 words with a clear topic sentence and supporting detail. Finish every paragraph completely.",
  },
  {
    id: "long",
    label: "Long",
    hint: "~180 words each",
    instruction:
      "Write each paragraph about 160–200 words with developed explanation and concrete examples. Finish every paragraph completely.",
  },
] as const;

export type ParagraphLengthId = (typeof PARAGRAPH_LENGTHS)[number]["id"];

export const PARAGRAPH_COUNTS = [
  {
    id: "1",
    label: "1",
    hint: "Single paragraph",
    count: 1,
  },
  {
    id: "2",
    label: "2",
    hint: "Two paragraphs",
    count: 2,
  },
  {
    id: "3",
    label: "3",
    hint: "Three paragraphs",
    count: 3,
  },
  {
    id: "5",
    label: "5",
    hint: "Five paragraphs",
    count: 5,
  },
] as const;

export type ParagraphCountId = (typeof PARAGRAPH_COUNTS)[number]["id"];

export const PARAGRAPH_PURPOSES = [
  {
    id: "general",
    label: "General",
    hint: "Any topic",
    cue: "general-purpose prose suitable for most readers",
  },
  {
    id: "blog",
    label: "Blog",
    hint: "Article body",
    cue: "blog or article body copy that scans well and stays engaging",
  },
  {
    id: "product",
    label: "Product",
    hint: "Features & benefits",
    cue: "product or feature copy focused on benefits and clarity",
  },
  {
    id: "email",
    label: "Email",
    hint: "Message body",
    cue: "email body copy that gets to the point and sounds natural",
  },
  {
    id: "school",
    label: "School",
    hint: "Classroom writing",
    cue: "classroom or homework prose with clear structure and appropriate formality",
  },
] as const;

export type ParagraphPurposeId = (typeof PARAGRAPH_PURPOSES)[number]["id"];

export const MAX_PARAGRAPH_TOPIC_LENGTH = 800;
export const MIN_PARAGRAPH_TOPIC_LENGTH = 8;
export const MAX_PARAGRAPH_KEYWORDS_LENGTH = 300;

export function getParagraphTone(id: ParagraphToneId) {
  return PARAGRAPH_TONES.find((item) => item.id === id) ?? PARAGRAPH_TONES[0];
}

export function getParagraphLength(id: ParagraphLengthId) {
  return (
    PARAGRAPH_LENGTHS.find((item) => item.id === id) ?? PARAGRAPH_LENGTHS[1]
  );
}

export function getParagraphCount(id: ParagraphCountId) {
  return PARAGRAPH_COUNTS.find((item) => item.id === id) ?? PARAGRAPH_COUNTS[0];
}

export function getParagraphPurpose(id: ParagraphPurposeId) {
  return (
    PARAGRAPH_PURPOSES.find((item) => item.id === id) ?? PARAGRAPH_PURPOSES[0]
  );
}

export function normalizeParagraphTopic(topic: string): string {
  return topic.replace(/\r\n/g, "\n").trim();
}

export function normalizeParagraphKeywords(keywords: string): string {
  return keywords.replace(/\r\n/g, "\n").trim();
}

export function validateParagraphTopic(topic: string): string | null {
  const value = normalizeParagraphTopic(topic);

  if (value.length < MIN_PARAGRAPH_TOPIC_LENGTH) {
    return "Enter a topic, idea, or short brief for the paragraph.";
  }

  if (value.length > MAX_PARAGRAPH_TOPIC_LENGTH) {
    return `Keep the topic under ${MAX_PARAGRAPH_TOPIC_LENGTH.toLocaleString()} characters.`;
  }

  return null;
}

export function validateParagraphKeywords(keywords: string): string | null {
  const value = normalizeParagraphKeywords(keywords);
  if (value.length > MAX_PARAGRAPH_KEYWORDS_LENGTH) {
    return `Keep keywords under ${MAX_PARAGRAPH_KEYWORDS_LENGTH.toLocaleString()} characters.`;
  }
  return null;
}

export function buildParagraphSystemPrompt(
  toneId: ParagraphToneId,
  lengthId: ParagraphLengthId,
  countId: ParagraphCountId,
  purposeId: ParagraphPurposeId,
): string {
  const tone = getParagraphTone(toneId);
  const length = getParagraphLength(lengthId);
  const count = getParagraphCount(countId);
  const purpose = getParagraphPurpose(purposeId);
  const n = count.count;
  const paragraphWord =
    n === 1 ? "exactly one paragraph" : `exactly ${n} paragraphs`;

  return [
    "You are an expert writing assistant for a free online AI paragraph generator.",
    `Write ${paragraphWord} in ${tone.cue}, suited to ${purpose.cue}.`,
    length.instruction,
    `Separate paragraphs with a blank line. Do not number them or add bullet lists unless the topic requires it.`,
    "Each paragraph should have a clear focus and flow naturally into the next when there is more than one.",
    "Prefer concrete detail over vague filler. Avoid stock AI transitions like 'moreover', 'in today's world', and 'in conclusion'.",
    "Do not invent statistics, quotes, studies, or facts you are not confident about.",
    "Do not add a title, preamble, disclaimer, or commentary before or after the paragraphs.",
    "Do not wrap the result in quotation marks or markdown code fences.",
    "Keep the content appropriate for a general audience.",
    "This is a drafting aid: write original prose, not copied passages.",
  ].join(" ");
}

export function buildParagraphUserPrompt(
  topic: string,
  keywords: string,
): string {
  const idea = normalizeParagraphTopic(topic);
  const extra = normalizeParagraphKeywords(keywords);
  if (extra) {
    return `Topic or brief:\n${idea}\n\nKeywords or points to include (weave in naturally):\n${extra}`;
  }
  return `Topic or brief:\n${idea}`;
}

export function randomParagraphSeed(): number {
  return Math.floor(Math.random() * 1_000_000_000);
}

export function isParagraphToneId(value: unknown): value is ParagraphToneId {
  return (
    typeof value === "string" &&
    PARAGRAPH_TONES.some((item) => item.id === value)
  );
}

export function isParagraphLengthId(
  value: unknown,
): value is ParagraphLengthId {
  return (
    typeof value === "string" &&
    PARAGRAPH_LENGTHS.some((item) => item.id === value)
  );
}

export function isParagraphCountId(value: unknown): value is ParagraphCountId {
  return (
    typeof value === "string" &&
    PARAGRAPH_COUNTS.some((item) => item.id === value)
  );
}

export function isParagraphPurposeId(
  value: unknown,
): value is ParagraphPurposeId {
  return (
    typeof value === "string" &&
    PARAGRAPH_PURPOSES.some((item) => item.id === value)
  );
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function countParagraphs(text: string): number {
  const blocks = text
    .trim()
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
  return blocks.length;
}

export function downloadParagraphTxt(
  text: string,
  filename = "paragraphs.txt",
): void {
  downloadBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), filename);
}

export function paragraphTemperature(toneId: ParagraphToneId): number {
  if (toneId === "casual" || toneId === "friendly") return 0.62;
  if (toneId === "persuasive") return 0.55;
  return 0.45;
}

export function paragraphMaxTokens(
  lengthId: ParagraphLengthId,
  countId: ParagraphCountId,
): number {
  const count = getParagraphCount(countId).count;
  const perParagraph =
    lengthId === "long" ? 320 : lengthId === "medium" ? 220 : 140;
  return Math.min(3072, Math.max(512, count * perParagraph + 128));
}
