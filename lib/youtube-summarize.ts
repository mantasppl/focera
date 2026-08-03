import { downloadBlob } from "@/lib/image";
import { countWords, validateYoutubeUrl } from "@/lib/youtube-to-text";

export const YOUTUBE_SUMMARY_STYLES = [
  {
    id: "brief",
    label: "Brief",
    hint: "2–4 sentences",
    instruction:
      "Write a brief overview in 2–4 clear sentences. Cover the main topic and takeaway only.",
  },
  {
    id: "detailed",
    label: "Detailed",
    hint: "Full paragraphs",
    instruction:
      "Write a detailed multi-paragraph summary covering the main arguments, examples, and conclusions. Aim for about 250–450 words unless the source is very short.",
  },
  {
    id: "bullets",
    label: "Key points",
    hint: "Bullet list",
    instruction:
      "Write 6–12 concise bullet points of the most important takeaways. Start each line with \"- \". Do not add an intro or closing paragraph.",
  },
] as const;

export type YoutubeSummaryStyleId =
  (typeof YOUTUBE_SUMMARY_STYLES)[number]["id"];

/** Soft cap so the chat model stays within a workable context window. */
export const MAX_TRANSCRIPT_CHARS_FOR_SUMMARY = 14_000;

export function getYoutubeSummaryStyle(id: YoutubeSummaryStyleId) {
  return (
    YOUTUBE_SUMMARY_STYLES.find((style) => style.id === id) ??
    YOUTUBE_SUMMARY_STYLES[0]
  );
}

export function isYoutubeSummaryStyleId(
  value: unknown,
): value is YoutubeSummaryStyleId {
  return (
    typeof value === "string" &&
    YOUTUBE_SUMMARY_STYLES.some((style) => style.id === value)
  );
}

export function truncateTranscriptForSummary(text: string): {
  text: string;
  truncated: boolean;
} {
  const trimmed = text.trim();
  if (trimmed.length <= MAX_TRANSCRIPT_CHARS_FOR_SUMMARY) {
    return { text: trimmed, truncated: false };
  }

  const slice = trimmed.slice(0, MAX_TRANSCRIPT_CHARS_FOR_SUMMARY);
  const lastBreak = Math.max(
    slice.lastIndexOf("\n\n"),
    slice.lastIndexOf(". "),
    slice.lastIndexOf("? "),
    slice.lastIndexOf("! "),
  );
  const cut =
    lastBreak > MAX_TRANSCRIPT_CHARS_FOR_SUMMARY * 0.7
      ? slice.slice(0, lastBreak + 1)
      : slice;

  return {
    text: `${cut.trim()}\n\n[Transcript truncated for length.]`,
    truncated: true,
  };
}

export function buildYoutubeSummarySystemPrompt(
  styleId: YoutubeSummaryStyleId,
): string {
  const style = getYoutubeSummaryStyle(styleId);

  return [
    "You are a careful video summarizer for a free online tool.",
    "Summarize only from the provided transcript and video title. Do not invent facts that are not supported by the transcript.",
    style.instruction,
    "Use clear, natural language. Do not mention that you are an AI.",
    "Do not include preambles like \"Here is a summary\" — return only the summary.",
    "Keep the content appropriate for a general audience.",
  ].join(" ");
}

export function buildYoutubeSummaryUserPrompt(input: {
  title: string;
  transcript: string;
  truncated: boolean;
}): string {
  const title = input.title.trim() || "Untitled YouTube video";
  const note = input.truncated
    ? "\nNote: The transcript was truncated because the video is long. Summarize what is available.\n"
    : "";

  return `Video title: ${title}\n${note}\nTranscript:\n${input.transcript}`;
}

export function describeSummaryResult(input: {
  styleId: YoutubeSummaryStyleId;
  summary: string;
  source: "captions" | "speech";
  truncated: boolean;
}): string {
  const style = getYoutubeSummaryStyle(input.styleId);
  const words = countWords(input.summary);
  const source =
    input.source === "speech" ? "speech transcription" : "captions";
  const trunc = input.truncated ? " · long video truncated" : "";
  return `${words.toLocaleString()} words · ${style.label.toLowerCase()} · ${source}${trunc}`;
}

export function downloadYoutubeSummaryTxt(
  text: string,
  videoId: string,
  styleId: YoutubeSummaryStyleId,
): void {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  downloadBlob(blob, `youtube-${videoId}-summary-${styleId}.txt`);
}

export { countWords, validateYoutubeUrl };
