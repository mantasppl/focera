export type TextCaseId =
  | "upper"
  | "lower"
  | "title"
  | "sentence"
  | "camel"
  | "pascal"
  | "snake"
  | "kebab";

export const TEXT_CASES: Array<{
  id: TextCaseId;
  label: string;
  hint: string;
}> = [
  { id: "upper", label: "UPPERCASE", hint: "ALL CAPS" },
  { id: "lower", label: "lowercase", hint: "all small letters" },
  { id: "title", label: "Title Case", hint: "Capitalize Each Word" },
  { id: "sentence", label: "Sentence case", hint: "Capitalize sentences" },
  { id: "camel", label: "camelCase", hint: "firstWordLower" },
  { id: "pascal", label: "PascalCase", hint: "EachWordCapital" },
  { id: "snake", label: "snake_case", hint: "words_with_underscores" },
  { id: "kebab", label: "kebab-case", hint: "words-with-hyphens" },
];

export function splitWords(input: string): string[] {
  const normalized = input
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim();

  if (!normalized) return [];
  return normalized.split(/\s+/);
}

function capitalizeWord(word: string): string {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function toTitleCase(input: string): string {
  return input.replace(/[A-Za-z0-9]+(?:['’][A-Za-z0-9]+)*/g, (word) =>
    capitalizeWord(word),
  );
}

function toSentenceCase(input: string): string {
  const lower = input.toLowerCase();
  return lower.replace(/(^\s*[a-z])|([.!?]\s+[a-z])/g, (match) =>
    match.toUpperCase(),
  );
}

function toCamelCase(words: string[]): string {
  return words
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index === 0) return lower;
      return capitalizeWord(lower);
    })
    .join("");
}

function toPascalCase(words: string[]): string {
  return words.map((word) => capitalizeWord(word.toLowerCase())).join("");
}

function toSnakeCase(words: string[]): string {
  return words.map((word) => word.toLowerCase()).join("_");
}

function toKebabCase(words: string[]): string {
  return words.map((word) => word.toLowerCase()).join("-");
}

export function convertTextCase(input: string, caseId: TextCaseId): string {
  if (!input) return "";

  switch (caseId) {
    case "upper":
      return input.toUpperCase();
    case "lower":
      return input.toLowerCase();
    case "title":
      return toTitleCase(input);
    case "sentence":
      return toSentenceCase(input);
    case "camel":
      return toCamelCase(splitWords(input));
    case "pascal":
      return toPascalCase(splitWords(input));
    case "snake":
      return toSnakeCase(splitWords(input));
    case "kebab":
      return toKebabCase(splitWords(input));
  }
}

export function countCharacters(text: string): number {
  return text.length;
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function caseLabel(caseId: TextCaseId): string {
  return TEXT_CASES.find((item) => item.id === caseId)?.label ?? caseId;
}
