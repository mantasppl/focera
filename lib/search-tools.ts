import {
  categoryLabels,
  type Tool,
  type ToolCategory,
  tools,
} from "@/data/tools";

export type ToolSearchHit = {
  tool: Tool;
  score: number;
};

const MIN_SCORE = 24;

/** Common shorthand people type instead of full feature words. */
const TOKEN_ALIASES: Record<string, string[]> = {
  img: ["image", "images", "picture", "photo"],
  pics: ["picture", "photo", "image"],
  pic: ["picture", "photo", "image"],
  bg: ["background"],
  bkg: ["background"],
  pw: ["password"],
  pwd: ["password"],
  js: ["javascript"],
  doc: ["word", "docx", "document"],
  docs: ["word", "docx", "document"],
  ppt: ["powerpoint", "pptx", "presentation", "slides"],
  pptx: ["powerpoint", "presentation", "slides"],
  slides: ["powerpoint", "pptx", "presentation"],
  jpg: ["jpeg", "image"],
  png: ["image", "pdf"],
  tif: ["tiff", "image", "pdf"],
  tiff: ["tif", "image", "pdf"],
  eps: ["eps", "postscript", "pdf", "png", "image"],
  epsf: ["eps", "postscript", "pdf", "png", "image"],
  postscript: ["eps", "postscript", "pdf", "png", "image"],
  txt: ["text"],
  md: ["markdown"],
  gen: ["generator", "generate"],
  rewrite: ["rewrite", "rephrase", "paraphrase", "improve", "improver"],
  rephrase: ["rephrase", "rewrite", "paraphrase", "improve"],
  paraphrase: ["paraphrase", "rewrite", "rephrase", "improver"],
  grammar: ["grammar", "polish", "clarity", "improve", "writing"],
  rem: ["remove", "remover", "removal"],
  mrg: ["merge", "merger"],
  overlay: ["overlay", "stamp", "layer", "watermark"],
  stamp: ["stamp", "overlay", "watermark", "logo"],
  compr: ["compress", "compressor", "compression"],
  crop: ["crop", "trim", "margin"],
  trim: ["crop", "trim", "margin"],
  border: ["border", "frame", "mat", "edge"],
  frame: ["border", "frame", "mat"],
  mat: ["border", "frame", "mat"],
  upsc: ["upscale", "upscaler"],
  resize: ["resize", "dimensions", "scale", "resizer"],
  dimensions: ["resize", "dimensions", "scale"],
  colorize: ["colorize", "colourise", "color", "colour"],
  colourise: ["colorize", "colourise", "color", "colour"],
  bw: ["black", "white", "grayscale", "grey", "monochrome"],
  grayscale: ["grey", "black", "white", "monochrome"],
  greyscale: ["grayscale", "grey", "black", "white", "monochrome"],
  monochrome: ["black", "white", "grayscale", "grey"],
  ocr: ["ocr", "text"],
  trl: ["translate", "translation", "translator"],
  translate: ["translation", "translator"],
  translator: ["translate", "translation"],
  stt: ["speech", "transcribe", "transcript", "audio", "video"],
  asr: ["speech", "transcribe", "transcript", "audio", "video"],
  whisper: ["transcribe", "transcript", "speech", "audio", "video"],
  rip: ["extract", "audio"],
  gif: ["gif", "video"],
  fb: ["facebook"],
  ig: ["instagram"],
  tt: ["tiktok"],
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function tokenize(value: string): string[] {
  const normalized = normalize(value);
  return normalized ? normalized.split(" ") : [];
}

function expandToken(token: string): string[] {
  const aliases = TOKEN_ALIASES[token];
  return aliases ? [token, ...aliases] : [token];
}

/**
 * How tightly `needle` packs into `haystack` as a subsequence.
 * Lower gap count = better (e.g. "mrg" in "merge" beats "mrg" in "markdown").
 */
function subsequenceGaps(haystack: string, needle: string): number {
  if (!needle) return 0;
  if (needle.length > haystack.length) return Number.POSITIVE_INFINITY;

  let best = Number.POSITIVE_INFINITY;

  for (let start = 0; start < haystack.length; start += 1) {
    if (haystack[start] !== needle[0]) continue;

    let hi = start + 1;
    let matched = 1;
    while (matched < needle.length && hi < haystack.length) {
      if (haystack[hi] === needle[matched]) matched += 1;
      hi += 1;
    }

    if (matched === needle.length) {
      best = Math.min(best, hi - start - needle.length);
      if (best === 0) return 0;
    }
  }

  return best;
}

function maxSubsequenceGaps(token: string): number {
  if (token.length <= 2) return 0;
  if (token.length <= 4) return 1;
  return Math.min(3, Math.floor(token.length / 2));
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const prev = new Array<number>(b.length + 1);
  const curr = new Array<number>(b.length + 1);

  for (let j = 0; j <= b.length; j += 1) prev[j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j += 1) prev[j] = curr[j];
  }

  return prev[b.length];
}

function maxEditDistance(token: string): number {
  if (token.length <= 3) return 0;
  if (token.length <= 5) return 1;
  return 2;
}

function identityWords(tool: Tool): string[] {
  return tokenize(
    [tool.name, tool.shortName, tool.slug.replace(/-/g, " ")].join(" "),
  );
}

function keywordWords(tool: Tool): string[] {
  return tokenize(tool.keywords.join(" "));
}

function tokenMatchesWord(token: string, word: string): number {
  if (!token || !word) return 0;
  if (word === token) return 100;
  if (word.startsWith(token)) return 86;
  if (token.length >= 3 && word.includes(token)) return 70;

  const dist = levenshtein(token, word);
  if (dist <= maxEditDistance(token)) {
    return Math.round(58 * (1 - dist / (token.length + 1)));
  }

  const gaps = subsequenceGaps(word, token);
  if (gaps <= maxSubsequenceGaps(token)) {
    return Math.round(48 * (1 / (1 + gaps)));
  }

  return 0;
}

function bestTokenScore(token: string, words: string[]): number {
  let best = 0;
  for (const variant of expandToken(token)) {
    for (const word of words) {
      best = Math.max(best, tokenMatchesWord(variant, word));
    }
  }
  return best;
}

function fieldPhraseScore(field: string, query: string): number {
  const hay = normalize(field);
  if (!hay || !query) return 0;
  if (hay === query) return 140;
  if (hay.startsWith(query)) return 120;
  if (hay.includes(query)) return 100;
  return 0;
}

function categoryTokenScore(tool: Tool, token: string): number {
  let best = 0;
  for (const category of tool.categories) {
    const labelWords = tokenize(
      categoryLabels[category as ToolCategory] ?? category,
    );
    const id = normalize(category);
    best = Math.max(best, bestTokenScore(token, [...labelWords, id]));
  }
  return best > 0 ? Math.min(22, Math.round(best * 0.25)) : 0;
}

type TokenHit = {
  score: number;
  source: "identity" | "keyword" | "category" | "description" | "none";
};

function scoreToken(tool: Tool, token: string): TokenHit {
  const identity = bestTokenScore(token, identityWords(tool));
  if (identity > 0) return { score: identity, source: "identity" };

  const keyword = bestTokenScore(token, keywordWords(tool));
  if (keyword > 0) {
    return { score: Math.round(keyword * 0.82), source: "keyword" };
  }

  const category = categoryTokenScore(tool, token);
  if (category > 0) return { score: category, source: "category" };

  const descWords = tokenize(tool.description);
  for (const variant of expandToken(token)) {
    for (const word of descWords) {
      if (word === variant) return { score: 28, source: "description" };
      if (word.startsWith(variant) && variant.length >= 3) {
        return { score: 22, source: "description" };
      }
    }
  }

  return { score: 0, source: "none" };
}

function scoreTool(tool: Tool, rawQuery: string): number {
  const query = normalize(rawQuery);
  if (!query) return 0;

  const tokens = tokenize(query);
  let score = 0;

  score = Math.max(
    score,
    fieldPhraseScore(tool.name, query),
    fieldPhraseScore(tool.shortName, query) * 0.95,
    fieldPhraseScore(tool.slug.replace(/-/g, " "), query) * 0.9,
  );

  for (const keyword of tool.keywords) {
    score = Math.max(score, fieldPhraseScore(keyword, query) * 0.88);
  }

  const tokenScores = tokens.map((token) => scoreToken(tool, token));
  if (tokenScores.some((t) => t.score === 0)) return 0;

  const coverage =
    tokenScores.reduce((sum, t) => sum + t.score, 0) / tokens.length;
  score = Math.max(score, coverage);

  const identityHits = tokenScores.filter((t) => t.source === "identity").length;
  const keywordHits = tokenScores.filter((t) => t.source === "keyword").length;

  if (identityHits === tokens.length) {
    score += 22 + tokens.length * 8;
  } else if (identityHits > 0) {
    score += 10 + identityHits * 6;
  } else if (keywordHits === tokens.length) {
    score += 8;
  }

  // Compact shorthand against identity + top keywords
  const identity = normalize(
    [
      tool.shortName,
      tool.slug.replace(/-/g, " "),
      ...tool.keywords.slice(0, 4),
    ].join(" "),
  ).replace(/\s+/g, "");
  const compactQuery = query.replace(/\s+/g, "");
  if (compactQuery.length >= 3 && identity.length > 0) {
    const gaps = subsequenceGaps(identity, compactQuery);
    if (gaps <= maxSubsequenceGaps(compactQuery)) {
      score = Math.max(score, Math.round(62 * (1 / (1 + gaps))));
    }
  }

  if (tool.status === "ready") score += 2;

  return score >= MIN_SCORE ? Math.round(score) : 0;
}

/**
 * Rank tools by fuzzy relevance. Matches partial names, keywords,
 * typos, and shorthand (e.g. "bg rem", "mrg pdf", "qr").
 */
export function searchTools(
  query: string,
  options: { limit?: number; list?: Tool[] } = {},
): ToolSearchHit[] {
  const list = options.list ?? tools;
  const trimmed = query.trim();
  if (!trimmed) {
    return list.map((tool) => ({ tool, score: 0 }));
  }

  const hits: ToolSearchHit[] = [];
  for (const tool of list) {
    const score = scoreTool(tool, trimmed);
    if (score > 0) hits.push({ tool, score });
  }

  hits.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.tool.status !== b.tool.status) {
      return a.tool.status === "ready" ? -1 : 1;
    }
    return a.tool.name.localeCompare(b.tool.name);
  });

  const limit = options.limit;
  return typeof limit === "number" ? hits.slice(0, limit) : hits;
}
