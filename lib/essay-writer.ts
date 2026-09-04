import { downloadBlob } from "@/lib/image";

/**
 * Essay types, levels, and citation options combine the strongest controls
 * from popular AI essay writers (EssayGPT / MyEssayWriter academic levels,
 * QuillBot essay types, Jenni outline + citations, Writesonic length/tone)
 * without paywalls or invented source lists.
 */
export const ESSAY_TYPES = [
  {
    id: "argumentative",
    label: "Argumentative",
    hint: "Claim + evidence",
    cue: "an argumentative essay with a clear thesis, reasoned claims, evidence, and a fair counterargument",
  },
  {
    id: "persuasive",
    label: "Persuasive",
    hint: "Convince the reader",
    cue: "a persuasive essay that builds a compelling case and calls the reader toward a conclusion",
  },
  {
    id: "expository",
    label: "Expository",
    hint: "Explain clearly",
    cue: "an expository essay that explains the topic clearly with definition, examples, and logical organization",
  },
  {
    id: "narrative",
    label: "Narrative",
    hint: "Story with a point",
    cue: "a narrative essay that uses a focused story, scene, and reflection to make a point",
  },
  {
    id: "descriptive",
    label: "Descriptive",
    hint: "Vivid detail",
    cue: "a descriptive essay with vivid sensory detail and a unifying impression",
  },
  {
    id: "compare",
    label: "Compare / Contrast",
    hint: "Similarities & differences",
    cue: "a compare-and-contrast essay that analyzes meaningful similarities and differences, not a simple list",
  },
  {
    id: "cause",
    label: "Cause / Effect",
    hint: "Why it happens",
    cue: "a cause-and-effect essay that traces why something happens and what follows from it",
  },
  {
    id: "analytical",
    label: "Analytical",
    hint: "Break it down",
    cue: "an analytical essay that breaks the topic into parts and explains how they work together",
  },
  {
    id: "research",
    label: "Research",
    hint: "Survey of a topic",
    cue: "a research-style essay that synthesizes established knowledge on the topic in a measured academic voice",
  },
  {
    id: "admission",
    label: "Admission",
    hint: "Personal statement",
    cue: "a college admission / personal-statement essay with a specific story, genuine voice, and a clear through-line",
  },
] as const;

export type EssayTypeId = (typeof ESSAY_TYPES)[number]["id"];

export const ESSAY_LEVELS = [
  {
    id: "middle",
    label: "Middle",
    hint: "Middle school",
    instruction:
      "Write at a middle-school level: shorter sentences, common vocabulary, and a straightforward structure.",
  },
  {
    id: "high",
    label: "High school",
    hint: "Typical classroom",
    instruction:
      "Write at a high-school level: clear thesis, structured paragraphs, and vocabulary suited to classroom essays.",
  },
  {
    id: "college",
    label: "College",
    hint: "Undergraduate",
    instruction:
      "Write at a college undergraduate level: precise claims, tighter analysis, and more mature academic phrasing.",
  },
  {
    id: "graduate",
    label: "Graduate",
    hint: "Advanced",
    instruction:
      "Write at a graduate level: nuanced argument, careful qualification, and a scholarly register without jargon for its own sake.",
  },
] as const;

export type EssayLevelId = (typeof ESSAY_LEVELS)[number]["id"];

export const ESSAY_LENGTHS = [
  {
    id: "short",
    label: "Short",
    hint: "~350 words",
    instruction:
      "Write about 320–380 words. Use a complete introduction, 2–3 body paragraphs, and a conclusion. Finish the essay — do not cut off mid-sentence.",
  },
  {
    id: "standard",
    label: "Standard",
    hint: "~650 words",
    instruction:
      "Write about 600–700 words with a full introduction, several developed body paragraphs, and a conclusion. Finish the essay completely.",
  },
  {
    id: "long",
    label: "Long",
    hint: "~1000 words",
    instruction:
      "Write about 900–1100 words with a substantial introduction, well-developed body sections, and a conclusion. Finish the essay completely within that range.",
  },
] as const;

export type EssayLengthId = (typeof ESSAY_LENGTHS)[number]["id"];

export const ESSAY_CITATIONS = [
  {
    id: "none",
    label: "None",
    hint: "No references",
    instruction:
      "Do not include in-text citations, footnotes, or a works-cited / references list.",
  },
  {
    id: "mla",
    label: "MLA",
    hint: "Works Cited",
    instruction:
      "Use MLA 9 in-text citations and a Works Cited list. Cite only widely known, real sources you are confident exist (canonical books, major news outlets, government sites, or landmark papers). If you are not sure a source is real, omit it. Never invent authors, titles, years, URLs, or page numbers.",
  },
  {
    id: "apa",
    label: "APA",
    hint: "References",
    instruction:
      "Use APA 7 in-text citations and a References list. Cite only widely known, real sources you are confident exist. If you are not sure a source is real, omit it. Never invent authors, titles, years, DOIs, URLs, or page numbers.",
  },
  {
    id: "chicago",
    label: "Chicago",
    hint: "Bibliography",
    instruction:
      "Use Chicago author-date in-text citations and a Bibliography. Cite only widely known, real sources you are confident exist. If you are not sure a source is real, omit it. Never invent authors, titles, years, URLs, or page numbers.",
  },
] as const;

export type EssayCitationId = (typeof ESSAY_CITATIONS)[number]["id"];

export const ESSAY_VOICES = [
  {
    id: "academic",
    label: "Academic",
    hint: "Formal prose",
    cue: "a precise academic voice — third person unless the essay type requires otherwise",
  },
  {
    id: "natural",
    label: "Natural",
    hint: "Human, less AI",
    cue: "a natural human voice — vary sentence length, avoid formulaic transitions like 'moreover' and 'in conclusion', and skip generic AI phrasing",
  },
  {
    id: "confident",
    label: "Confident",
    hint: "Clear claims",
    cue: "a confident, assertive voice with clear claims and active phrasing",
  },
] as const;

export type EssayVoiceId = (typeof ESSAY_VOICES)[number]["id"];

export const ESSAY_OUTPUTS = [
  {
    id: "essay",
    label: "Essay",
    hint: "Title + prose",
    instruction:
      "Return a title on the first line, a blank line, then the full essay in paragraphs. Do not include an outline.",
  },
  {
    id: "outline-essay",
    label: "Outline + essay",
    hint: "Plan then draft",
    instruction:
      "Return a title, then a short outline (4–8 bullet lines), then the full essay in paragraphs. Label the outline 'Outline' and the essay 'Essay'. Keep the outline brief so the essay still hits the word target.",
  },
] as const;

export type EssayOutputId = (typeof ESSAY_OUTPUTS)[number]["id"];

export const MAX_ESSAY_TOPIC_LENGTH = 800;
export const MIN_ESSAY_TOPIC_LENGTH = 8;
export const MAX_ESSAY_NOTES_LENGTH = 600;

export function getEssayType(id: EssayTypeId) {
  return ESSAY_TYPES.find((item) => item.id === id) ?? ESSAY_TYPES[0];
}

export function getEssayLevel(id: EssayLevelId) {
  return ESSAY_LEVELS.find((item) => item.id === id) ?? ESSAY_LEVELS[1];
}

export function getEssayLength(id: EssayLengthId) {
  return ESSAY_LENGTHS.find((item) => item.id === id) ?? ESSAY_LENGTHS[1];
}

export function getEssayCitation(id: EssayCitationId) {
  return ESSAY_CITATIONS.find((item) => item.id === id) ?? ESSAY_CITATIONS[0];
}

export function getEssayVoice(id: EssayVoiceId) {
  return ESSAY_VOICES.find((item) => item.id === id) ?? ESSAY_VOICES[0];
}

export function getEssayOutput(id: EssayOutputId) {
  return ESSAY_OUTPUTS.find((item) => item.id === id) ?? ESSAY_OUTPUTS[0];
}

export function normalizeEssayTopic(topic: string): string {
  return topic.replace(/\r\n/g, "\n").trim();
}

export function normalizeEssayNotes(notes: string): string {
  return notes.replace(/\r\n/g, "\n").trim();
}

export function validateEssayTopic(topic: string): string | null {
  const value = normalizeEssayTopic(topic);

  if (value.length < MIN_ESSAY_TOPIC_LENGTH) {
    return "Enter a topic, question, or assignment prompt.";
  }

  if (value.length > MAX_ESSAY_TOPIC_LENGTH) {
    return `Keep the topic under ${MAX_ESSAY_TOPIC_LENGTH.toLocaleString()} characters.`;
  }

  return null;
}

export function validateEssayNotes(notes: string): string | null {
  const value = normalizeEssayNotes(notes);
  if (value.length > MAX_ESSAY_NOTES_LENGTH) {
    return `Keep extra notes under ${MAX_ESSAY_NOTES_LENGTH.toLocaleString()} characters.`;
  }
  return null;
}

export function buildEssaySystemPrompt(
  typeId: EssayTypeId,
  levelId: EssayLevelId,
  lengthId: EssayLengthId,
  citationId: EssayCitationId,
  voiceId: EssayVoiceId,
  outputId: EssayOutputId,
): string {
  const type = getEssayType(typeId);
  const level = getEssayLevel(levelId);
  const length = getEssayLength(lengthId);
  const citation = getEssayCitation(citationId);
  const voice = getEssayVoice(voiceId);
  const output = getEssayOutput(outputId);

  return [
    "You are an expert academic writing tutor for a free online essay writer.",
    `Write ${type.cue} in ${voice.cue}.`,
    level.instruction,
    length.instruction,
    citation.instruction,
    output.instruction,
    "Use a specific thesis and topic sentences. Prefer concrete examples over vague generalities.",
    "Do not invent statistics, quotes, studies, or historical facts you are not confident about.",
    "Do not add a preamble, disclaimer, or commentary before or after the essay.",
    "Do not wrap the result in quotation marks or markdown code fences.",
    "Keep the content appropriate for a general audience.",
    "This is a drafting aid: write original prose, not copied passages.",
  ].join(" ");
}

export function buildEssayUserPrompt(topic: string, notes: string): string {
  const idea = normalizeEssayTopic(topic);
  const extra = normalizeEssayNotes(notes);
  if (extra) {
    return `Essay topic or assignment:\n${idea}\n\nExtra guidance (thesis, points to cover, or constraints):\n${extra}`;
  }
  return `Essay topic or assignment:\n${idea}`;
}

export function randomEssaySeed(): number {
  return Math.floor(Math.random() * 1_000_000_000);
}

export function isEssayTypeId(value: unknown): value is EssayTypeId {
  return (
    typeof value === "string" && ESSAY_TYPES.some((item) => item.id === value)
  );
}

export function isEssayLevelId(value: unknown): value is EssayLevelId {
  return (
    typeof value === "string" && ESSAY_LEVELS.some((item) => item.id === value)
  );
}

export function isEssayLengthId(value: unknown): value is EssayLengthId {
  return (
    typeof value === "string" && ESSAY_LENGTHS.some((item) => item.id === value)
  );
}

export function isEssayCitationId(value: unknown): value is EssayCitationId {
  return (
    typeof value === "string" &&
    ESSAY_CITATIONS.some((item) => item.id === value)
  );
}

export function isEssayVoiceId(value: unknown): value is EssayVoiceId {
  return (
    typeof value === "string" && ESSAY_VOICES.some((item) => item.id === value)
  );
}

export function isEssayOutputId(value: unknown): value is EssayOutputId {
  return (
    typeof value === "string" && ESSAY_OUTPUTS.some((item) => item.id === value)
  );
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function downloadEssayTxt(
  text: string,
  filename = "essay.txt",
): void {
  downloadBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), filename);
}

export function essayTemperature(
  typeId: EssayTypeId,
  voiceId: EssayVoiceId,
): number {
  if (typeId === "narrative" || typeId === "descriptive" || typeId === "admission") {
    return voiceId === "natural" ? 0.72 : 0.62;
  }
  if (voiceId === "natural") return 0.58;
  return 0.42;
}
