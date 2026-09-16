import {
  BLOCK_TYPES,
  CTA_POSITIONS,
  CTA_VARIANTS,
  DEFAULT_CTA_CONFIG,
  type ContentBlock,
  type CtaConfig,
  type CtaPosition,
  type CtaVariant,
  type FaqItem,
} from "@/lib/content/types";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function newBlockId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function parseFaqItems(value: unknown): FaqItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const rec = asRecord(item);
      if (!rec) return null;
      const question = asString(rec.question ?? rec.q).trim();
      const answer = asString(rec.answer ?? rec.a).trim();
      if (!question && !answer) return null;
      return { question, answer };
    })
    .filter((item): item is FaqItem => Boolean(item));
}

export function parseContentBlocks(value: unknown): ContentBlock[] {
  const raw = typeof value === "string" ? safeJson(value) : value;
  if (!Array.isArray(raw)) return [];

  const blocks: ContentBlock[] = [];
  for (const item of raw) {
    const rec = asRecord(item);
    if (!rec) continue;
    const type = asString(rec.type);
    if (!BLOCK_TYPES.includes(type as ContentBlock["type"])) continue;
    const id = asString(rec.id) || newBlockId();

    switch (type) {
      case "text":
        blocks.push({ id, type: "text", html: asString(rec.html ?? rec.body ?? rec.text) });
        break;
      case "image":
        blocks.push({
          id,
          type: "image",
          url: asString(rec.url ?? rec.src),
          alt: asString(rec.alt),
        });
        break;
      case "video":
        blocks.push({ id, type: "video", url: asString(rec.url ?? rec.src) });
        break;
      case "cta":
        blocks.push({
          id,
          type: "cta",
          label: asString(rec.label) || "Open tool",
          toolId: asString(rec.toolId ?? rec.tool_id ?? rec.toolSlug ?? rec.tool_slug),
        });
        break;
      case "tool_embed":
        blocks.push({
          id,
          type: "tool_embed",
          toolId: asString(rec.toolId ?? rec.tool_id ?? rec.toolSlug ?? rec.tool_slug),
        });
        break;
      case "faq":
        blocks.push({
          id,
          type: "faq",
          items: parseFaqItems(rec.items ?? rec.faq),
        });
        break;
      case "list":
        blocks.push({
          id,
          type: "list",
          ordered: Boolean(rec.ordered),
          items: Array.isArray(rec.items)
            ? rec.items.map((entry) => asString(entry)).filter(Boolean)
            : [],
        });
        break;
      case "table": {
        const headers = Array.isArray(rec.headers)
          ? rec.headers.map((header) => asString(header))
          : [];
        const rows = Array.isArray(rec.rows)
          ? rec.rows
              .filter(Array.isArray)
              .map((row) => (row as unknown[]).map((cell) => asString(cell)))
          : [];
        blocks.push({ id, type: "table", headers, rows });
        break;
      }
      default:
        break;
    }
  }
  return blocks;
}

export function stringifyContentBlocks(blocks: ContentBlock[]): string {
  return JSON.stringify(blocks);
}

export function parseRelatedToolIds(value: unknown): string[] {
  const raw = typeof value === "string" ? safeJson(value) : value;
  if (!Array.isArray(raw)) return [];
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    const id = typeof item === "string" ? item.trim() : "";
    if (!id || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return ids.slice(0, 24);
}

export function parseCtaConfig(value: unknown): CtaConfig {
  const raw = typeof value === "string" ? safeJson(value) : value;
  const rec = asRecord(raw);
  if (!rec) return { ...DEFAULT_CTA_CONFIG, labels: { ...DEFAULT_CTA_CONFIG.labels } };

  const positions = Array.isArray(rec.positions)
    ? rec.positions.filter((pos): pos is CtaPosition =>
        CTA_POSITIONS.includes(pos as CtaPosition),
      )
    : [...DEFAULT_CTA_CONFIG.positions];

  const labelsRec = asRecord(rec.labels) || {};
  const labels: CtaConfig["labels"] = {};
  for (const position of CTA_POSITIONS) {
    const label = asString(labelsRec[position]).trim();
    if (label) labels[position] = label;
  }

  const rawVariant = rec.variant;
  const variant: CtaVariant = CTA_VARIANTS.includes(rawVariant as CtaVariant)
    ? (rawVariant as CtaVariant)
    : "button";

  return {
    positions: positions.length ? positions : [...DEFAULT_CTA_CONFIG.positions],
    labels,
    variant,
  };
}

export function createEmptyBlock(type: ContentBlock["type"]): ContentBlock {
  const id = newBlockId();
  switch (type) {
    case "text":
      return { id, type, html: "" };
    case "image":
      return { id, type, url: "", alt: "" };
    case "video":
      return { id, type, url: "" };
    case "cta":
      return { id, type, label: "Try this tool", toolId: "" };
    case "tool_embed":
      return { id, type, toolId: "" };
    case "faq":
      return { id, type, items: [{ question: "", answer: "" }] };
    case "list":
      return { id, type, ordered: false, items: [""] };
    case "table":
      return { id, type, headers: ["Column 1", "Column 2"], rows: [["", ""]] };
  }
}

function safeJson(value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}
