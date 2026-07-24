import { downloadBlob } from "@/lib/image";
import { clamp } from "@/lib/utils";

export type LoremMode = "words" | "sentences" | "paragraphs";

export type LoremOptions = {
  mode: LoremMode;
  count: number;
  startWithLorem: boolean;
};

export const LOREM_MODES: Array<{
  id: LoremMode;
  label: string;
  hint: string;
}> = [
  { id: "paragraphs", label: "Paragraphs", hint: "Blocks of filler text" },
  { id: "sentences", label: "Sentences", hint: "Individual sentences" },
  { id: "words", label: "Words", hint: "A plain word list" },
];

export const MIN_COUNT = 1;
export const MAX_COUNT: Record<LoremMode, number> = {
  words: 500,
  sentences: 100,
  paragraphs: 50,
};
export const DEFAULT_COUNT: Record<LoremMode, number> = {
  words: 50,
  sentences: 5,
  paragraphs: 3,
};

const CLASSIC_START =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit";

const WORDS = [
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
  "sed",
  "do",
  "eiusmod",
  "tempor",
  "incididunt",
  "ut",
  "labore",
  "et",
  "dolore",
  "magna",
  "aliqua",
  "enim",
  "ad",
  "minim",
  "veniam",
  "quis",
  "nostrud",
  "exercitation",
  "ullamco",
  "laboris",
  "nisi",
  "aliquip",
  "ex",
  "ea",
  "commodo",
  "consequat",
  "duis",
  "aute",
  "irure",
  "in",
  "reprehenderit",
  "voluptate",
  "velit",
  "esse",
  "cillum",
  "fugiat",
  "nulla",
  "pariatur",
  "excepteur",
  "sint",
  "occaecat",
  "cupidatat",
  "non",
  "proident",
  "sunt",
  "culpa",
  "qui",
  "officia",
  "deserunt",
  "mollit",
  "anim",
  "id",
  "est",
  "laborum",
  "curabitur",
  "pretium",
  "tincidunt",
  "lacus",
  "suspendisse",
  "potenti",
  "vivamus",
  "euismod",
  "sagittis",
  "pharetra",
  "mauris",
  "interdum",
  "elementum",
  "tempus",
  "vestibulum",
  "ante",
  "primis",
  "faucibus",
  "orci",
  "luctus",
  "ultrices",
  "posuere",
  "cubilia",
  "curae",
  "donec",
  "velit",
  "neque",
  "auctor",
  "elit",
  "rhoncus",
  "aenean",
  "viverra",
  "nam",
  "libero",
  "tempus",
  "cum",
  "sociis",
  "natoque",
  "penatibus",
  "magnis",
  "dis",
  "parturient",
  "montes",
  "nascetur",
  "ridiculus",
  "mus",
  "donec",
  "quam",
  "felis",
  "ultricies",
  "nec",
  "pellentesque",
  "eu",
  "pretium",
  "quis",
  "sem",
  "nulla",
  "consequat",
  "massa",
  "quis",
  "enim",
  "integer",
  "tincidunt",
  "cras",
  "dapibus",
  "vivamus",
  "elementum",
  "semper",
  "nisi",
  "aenean",
  "vulputate",
  "eleifend",
  "tellus",
  "aenean",
  "leo",
  "ligula",
  "porttitor",
  "eu",
  "consequat",
  "vitae",
  "eleifend",
  "ac",
  "enim",
];

function randomInt(max: number): number {
  if (max <= 1) return 0;
  return Math.floor(Math.random() * max);
}

function pickWord(): string {
  return WORDS[randomInt(WORDS.length)]!;
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function generateWords(count: number, startWithLorem: boolean): string {
  const n = clamp(count, MIN_COUNT, MAX_COUNT.words);
  if (startWithLorem) {
    const classic = CLASSIC_START.replace(/,/g, "").split(/\s+/);
    if (n <= classic.length) {
      return classic.slice(0, n).join(" ");
    }
    const rest = Array.from({ length: n - classic.length }, () => pickWord());
    return [...classic, ...rest].join(" ");
  }
  return Array.from({ length: n }, () => pickWord()).join(" ");
}

function buildSentence(wordCount: number): string {
  const words: string[] = [];
  for (let i = 0; i < wordCount; i += 1) {
    words.push(pickWord());
  }
  words[0] = capitalize(words[0]!);
  return `${words.join(" ")}.`;
}

function generateSentences(
  count: number,
  startWithLorem: boolean,
): string {
  const n = clamp(count, MIN_COUNT, MAX_COUNT.sentences);
  const sentences: string[] = [];

  for (let i = 0; i < n; i += 1) {
    if (i === 0 && startWithLorem) {
      sentences.push(`${CLASSIC_START}.`);
      continue;
    }
    const length = 6 + randomInt(10);
    sentences.push(buildSentence(length));
  }

  return sentences.join(" ");
}

function generateParagraphs(
  count: number,
  startWithLorem: boolean,
): string {
  const n = clamp(count, MIN_COUNT, MAX_COUNT.paragraphs);
  const paragraphs: string[] = [];

  for (let i = 0; i < n; i += 1) {
    const sentenceCount = 3 + randomInt(4);
    const useClassic = i === 0 && startWithLorem;
    paragraphs.push(generateSentences(sentenceCount, useClassic));
  }

  return paragraphs.join("\n\n");
}

export function generateLorem(options: LoremOptions): string {
  const count = clamp(
    Math.round(options.count),
    MIN_COUNT,
    MAX_COUNT[options.mode],
  );

  switch (options.mode) {
    case "words":
      return generateWords(count, options.startWithLorem);
    case "sentences":
      return generateSentences(count, options.startWithLorem);
    case "paragraphs":
      return generateParagraphs(count, options.startWithLorem);
  }
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function countSentences(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/[.!?]+/).filter((part) => part.trim().length > 0)
    .length;
}

export function countParagraphs(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\n\s*\n/).filter((part) => part.trim().length > 0)
    .length;
}

export function downloadLoremTxt(
  text: string,
  filename = "lorem-ipsum.txt",
): void {
  downloadBlob(new Blob([text], { type: "text/plain;charset=utf-8" }), filename);
}

export function modeLabel(mode: LoremMode): string {
  return LOREM_MODES.find((item) => item.id === mode)?.label ?? mode;
}
