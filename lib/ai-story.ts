import { downloadBlob } from "@/lib/image";

export const AI_STORY_GENRES = [
  {
    id: "adventure",
    label: "Adventure",
    hint: "Journeys & quests",
    cue: "an adventure story with momentum, discovery, and a clear goal",
  },
  {
    id: "fantasy",
    label: "Fantasy",
    hint: "Magic & myth",
    cue: "a fantasy story with wonder, magic, and vivid world details",
  },
  {
    id: "mystery",
    label: "Mystery",
    hint: "Clues & twists",
    cue: "a mystery with intrigue, clues, and a satisfying reveal",
  },
  {
    id: "scifi",
    label: "Sci-fi",
    hint: "Future tech",
    cue: "a science-fiction story with speculative ideas and a human core",
  },
  {
    id: "romance",
    label: "Romance",
    hint: "Heart & hope",
    cue: "a romance with emotional tension, chemistry, and a hopeful arc",
  },
  {
    id: "horror",
    label: "Horror",
    hint: "Dread & suspense",
    cue: "a horror story with atmosphere, dread, and controlled suspense",
  },
  {
    id: "comedy",
    label: "Comedy",
    hint: "Light & witty",
    cue: "a comedy with witty dialogue, playful situations, and a light touch",
  },
  {
    id: "fable",
    label: "Fable",
    hint: "Lesson & charm",
    cue: "a short fable with charming characters and a clear moral",
  },
] as const;

export type AiStoryGenreId = (typeof AI_STORY_GENRES)[number]["id"];

export const AI_STORY_LENGTHS = [
  {
    id: "flash",
    label: "Flash",
    hint: "~150 words",
    instruction: "Write about 120–180 words. Keep it tight and complete.",
  },
  {
    id: "short",
    label: "Short",
    hint: "~350 words",
    instruction: "Write about 300–400 words with a clear beginning, middle, and end.",
  },
  {
    id: "medium",
    label: "Medium",
    hint: "~700 words",
    instruction:
      "Write about 650–800 words with scene detail, character voice, and a full arc.",
  },
] as const;

export type AiStoryLengthId = (typeof AI_STORY_LENGTHS)[number]["id"];

export const AI_STORY_TONES = [
  {
    id: "neutral",
    label: "Neutral",
    hint: "Balanced",
    cue: "a balanced, readable tone",
  },
  {
    id: "warm",
    label: "Warm",
    hint: "Heartfelt",
    cue: "a warm, heartfelt tone",
  },
  {
    id: "dark",
    label: "Dark",
    hint: "Moody",
    cue: "a dark, moody tone",
  },
  {
    id: "whimsical",
    label: "Whimsical",
    hint: "Playful",
    cue: "a whimsical, playful tone",
  },
  {
    id: "epic",
    label: "Epic",
    hint: "Grand",
    cue: "an epic, sweeping tone",
  },
  {
    id: "tense",
    label: "Tense",
    hint: "Urgent",
    cue: "a tense, urgent tone",
  },
] as const;

export type AiStoryToneId = (typeof AI_STORY_TONES)[number]["id"];

export const MAX_AI_STORY_PROMPT_LENGTH = 800;
export const MIN_AI_STORY_PROMPT_LENGTH = 3;

export function getAiStoryGenre(id: AiStoryGenreId) {
  return AI_STORY_GENRES.find((genre) => genre.id === id) ?? AI_STORY_GENRES[0];
}

export function getAiStoryLength(id: AiStoryLengthId) {
  return (
    AI_STORY_LENGTHS.find((length) => length.id === id) ?? AI_STORY_LENGTHS[1]
  );
}

export function getAiStoryTone(id: AiStoryToneId) {
  return AI_STORY_TONES.find((tone) => tone.id === id) ?? AI_STORY_TONES[0];
}

export function normalizeAiStoryPrompt(prompt: string): string {
  return prompt.trim().replace(/\s+/g, " ");
}

export function validateAiStoryPrompt(prompt: string): string | null {
  const value = normalizeAiStoryPrompt(prompt);

  if (value.length < MIN_AI_STORY_PROMPT_LENGTH) {
    return "Enter a short idea, premise, or theme for the story.";
  }

  if (value.length > MAX_AI_STORY_PROMPT_LENGTH) {
    return `Keep prompts under ${MAX_AI_STORY_PROMPT_LENGTH} characters.`;
  }

  return null;
}

export function buildAiStorySystemPrompt(
  genreId: AiStoryGenreId,
  lengthId: AiStoryLengthId,
  toneId: AiStoryToneId,
): string {
  const genre = getAiStoryGenre(genreId);
  const length = getAiStoryLength(lengthId);
  const tone = getAiStoryTone(toneId);

  return [
    "You are a skilled fiction writer for a free online story generator.",
    `Write ${genre.cue} in ${tone.cue}.`,
    length.instruction,
    "Use natural prose with paragraphs. Do not include a title unless the user asks for one.",
    "Do not add preambles, notes, bullet lists, or commentary — return only the story text.",
    "Keep the content appropriate for a general audience.",
  ].join(" ");
}

export function buildAiStoryUserPrompt(prompt: string): string {
  const idea = normalizeAiStoryPrompt(prompt);
  return `Story idea: ${idea}`;
}

export function randomAiStorySeed(): number {
  return Math.floor(Math.random() * 1_000_000_000);
}

export function isAiStoryGenreId(value: unknown): value is AiStoryGenreId {
  return (
    typeof value === "string" &&
    AI_STORY_GENRES.some((genre) => genre.id === value)
  );
}

export function isAiStoryLengthId(value: unknown): value is AiStoryLengthId {
  return (
    typeof value === "string" &&
    AI_STORY_LENGTHS.some((length) => length.id === value)
  );
}

export function isAiStoryToneId(value: unknown): value is AiStoryToneId {
  return (
    typeof value === "string" &&
    AI_STORY_TONES.some((tone) => tone.id === value)
  );
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function downloadAiStoryTxt(
  text: string,
  filename = "focera-ai-story.txt",
): void {
  downloadBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), filename);
}
