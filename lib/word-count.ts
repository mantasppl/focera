export type WordCountStats = {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingMinutes: number;
  speakingMinutes: number;
};

/** Average adult silent reading speed (words per minute). */
export const READING_WPM = 200;

/** Average conversational speaking speed (words per minute). */
export const SPEAKING_WPM = 130;

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function countCharacters(text: string): number {
  return text.length;
}

export function countCharactersNoSpaces(text: string): number {
  return text.replace(/\s/g, "").length;
}

export function countSentences(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const matches = trimmed.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g);
  if (!matches) return 0;
  return matches.filter((part) => part.trim().length > 0).length;
}

export function countParagraphs(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\n\s*\n/).filter((part) => part.trim().length > 0)
    .length;
}

export function countLines(text: string): number {
  if (!text) return 0;
  return text.split(/\r\n|\r|\n/).length;
}

export function estimateMinutes(words: number, wpm: number): number {
  if (words <= 0 || wpm <= 0) return 0;
  return Math.max(1, Math.ceil(words / wpm));
}

export function analyzeText(text: string): WordCountStats {
  const words = countWords(text);
  return {
    words,
    characters: countCharacters(text),
    charactersNoSpaces: countCharactersNoSpaces(text),
    sentences: countSentences(text),
    paragraphs: countParagraphs(text),
    lines: countLines(text),
    readingMinutes: words === 0 ? 0 : estimateMinutes(words, READING_WPM),
    speakingMinutes: words === 0 ? 0 : estimateMinutes(words, SPEAKING_WPM),
  };
}

export function formatDurationLabel(minutes: number): string {
  if (minutes <= 0) return "0 min";
  if (minutes === 1) return "1 min";
  return `${minutes} min`;
}
