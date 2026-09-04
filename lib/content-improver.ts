import { downloadBlob } from "@/lib/image";

/**
 * Modes combine the strongest options from popular content improvers
 * (Grammarly polish/clarity, QuillBot paraphrase modes, Wordtune tone/
 * length rewrites, Hemingway concision, Jasper persuasive copy).
 */
export const CONTENT_IMPROVER_MODES = [
  {
    id: "polish",
    label: "Polish",
    hint: "Grammar & clarity",
    cue: "fix grammar, spelling, punctuation, and clarity while keeping the original voice and meaning",
  },
  {
    id: "paraphrase",
    label: "Paraphrase",
    hint: "Fresh wording",
    cue: "paraphrase the text with different wording while preserving the exact meaning",
  },
  {
    id: "fluency",
    label: "Fluency",
    hint: "Smooth flow",
    cue: "make the writing fluent and natural, fixing awkward phrasing and grammar without changing meaning",
  },
  {
    id: "formal",
    label: "Formal",
    hint: "Business tone",
    cue: "rewrite in a polished, professional, formal business tone",
  },
  {
    id: "casual",
    label: "Casual",
    hint: "Friendly voice",
    cue: "rewrite in a warm, conversational, casual tone that still sounds clear",
  },
  {
    id: "academic",
    label: "Academic",
    hint: "Scholarly",
    cue: "rewrite in a precise academic style suitable for essays, papers, and research writing",
  },
  {
    id: "simple",
    label: "Simplify",
    hint: "Plain language",
    cue: "simplify into plain language that a general audience can understand quickly",
  },
  {
    id: "creative",
    label: "Creative",
    hint: "Vivid phrasing",
    cue: "rewrite with more creative, vivid, and varied phrasing while keeping the core message",
  },
  {
    id: "shorten",
    label: "Shorten",
    hint: "Tighten copy",
    cue: "make the text substantially shorter and more concise without losing essential meaning",
  },
  {
    id: "expand",
    label: "Expand",
    hint: "Add detail",
    cue: "expand the text with helpful detail, examples, and smoother transitions while staying on topic",
  },
  {
    id: "humanize",
    label: "Humanize",
    hint: "Natural voice",
    cue: "rewrite so it sounds more human and less AI-generated — vary sentence length, soften formulaic phrasing, and keep a natural rhythm",
  },
  {
    id: "persuasive",
    label: "Persuasive",
    hint: "Marketing punch",
    cue: "rewrite as persuasive marketing copy that is clear, compelling, and action-oriented",
  },
  {
    id: "confident",
    label: "Confident",
    hint: "Assertive",
    cue: "rewrite in a confident, assertive voice — prefer clear claims and active phrasing",
  },
  {
    id: "seo",
    label: "SEO / Scannable",
    hint: "Easy to skim",
    cue: "rewrite for online readers: clear headings-friendly sentences, scannable flow, and engaging wording without keyword stuffing",
  },
] as const;

export type ContentImproverModeId =
  (typeof CONTENT_IMPROVER_MODES)[number]["id"];

export const CONTENT_IMPROVER_STRENGTHS = [
  {
    id: "light",
    label: "Light",
    hint: "Gentle edits",
    instruction:
      "Make light edits only. Prefer minimal changes that still achieve the goal.",
  },
  {
    id: "balanced",
    label: "Balanced",
    hint: "Recommended",
    instruction:
      "Use a balanced rewrite depth — improve clearly without reinventing the piece.",
  },
  {
    id: "strong",
    label: "Strong",
    hint: "Bold rewrite",
    instruction:
      "Rewrite more aggressively with stronger wording changes while preserving meaning.",
  },
] as const;

export type ContentImproverStrengthId =
  (typeof CONTENT_IMPROVER_STRENGTHS)[number]["id"];

export const MAX_CONTENT_IMPROVER_LENGTH = 8_000;
export const MIN_CONTENT_IMPROVER_LENGTH = 12;

export function getContentImproverMode(id: ContentImproverModeId) {
  return (
    CONTENT_IMPROVER_MODES.find((mode) => mode.id === id) ??
    CONTENT_IMPROVER_MODES[0]
  );
}

export function getContentImproverStrength(id: ContentImproverStrengthId) {
  return (
    CONTENT_IMPROVER_STRENGTHS.find((strength) => strength.id === id) ??
    CONTENT_IMPROVER_STRENGTHS[1]
  );
}

export function normalizeContentImproverText(text: string): string {
  return text.replace(/\r\n/g, "\n").trim();
}

export function validateContentImproverText(text: string): string | null {
  const value = normalizeContentImproverText(text);

  if (value.length < MIN_CONTENT_IMPROVER_LENGTH) {
    return "Paste at least a short sentence to improve.";
  }

  if (value.length > MAX_CONTENT_IMPROVER_LENGTH) {
    return `Keep text under ${MAX_CONTENT_IMPROVER_LENGTH.toLocaleString()} characters.`;
  }

  return null;
}

export function buildContentImproverSystemPrompt(
  modeId: ContentImproverModeId,
  strengthId: ContentImproverStrengthId,
): string {
  const mode = getContentImproverMode(modeId);
  const strength = getContentImproverStrength(strengthId);

  return [
    "You are an expert writing editor for a free online content improver.",
    `Your job is to ${mode.cue}.`,
    strength.instruction,
    "Preserve the author's intent, facts, names, numbers, URLs, and any markdown or formatting markers when present.",
    "Do not invent new claims, citations, or facts that are not implied by the original.",
    "Do not add a title, preamble, notes, bullet commentary, or quotation marks around the whole result.",
    "Return only the improved text.",
    "Keep the content appropriate for a general audience.",
  ].join(" ");
}

export function buildContentImproverUserPrompt(text: string): string {
  const content = normalizeContentImproverText(text);
  return `Improve the following text:\n\n${content}`;
}

export function randomContentImproverSeed(): number {
  return Math.floor(Math.random() * 1_000_000_000);
}

export function isContentImproverModeId(
  value: unknown,
): value is ContentImproverModeId {
  return (
    typeof value === "string" &&
    CONTENT_IMPROVER_MODES.some((mode) => mode.id === value)
  );
}

export function isContentImproverStrengthId(
  value: unknown,
): value is ContentImproverStrengthId {
  return (
    typeof value === "string" &&
    CONTENT_IMPROVER_STRENGTHS.some((strength) => strength.id === value)
  );
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function downloadContentImproverTxt(
  text: string,
  filename = "improved-content.txt",
): void {
  downloadBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), filename);
}
