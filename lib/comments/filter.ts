/** Basic keyword blocklist — extend as needed. */
const BLOCKED_KEYWORDS = [
  "viagra",
  "cialis",
  "casino",
  "crypto pump",
  "forex signal",
  "onlyfans",
  "porn",
  "xxx",
  "click here now",
  "buy followers",
  "seo service cheap",
];

export function containsBlockedContent(text: string): boolean {
  const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();
  return BLOCKED_KEYWORDS.some((word) => normalized.includes(word));
}
