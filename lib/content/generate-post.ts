import Groq from "groq-sdk";
import { z } from "zod";
import { getReadyTools, getToolBySlug } from "@/data/tools";
import { parseContentBlocks } from "@/lib/content/blocks";
import { slugify } from "@/lib/content/slug";
import { createPost, getPostBySlug } from "@/lib/content/store";
import {
  DEFAULT_CTA_CONFIG,
  type ContentBlock,
  type FaqItem,
  type Post,
  type SchemaType,
} from "@/lib/content/types";
import { validatePostInput } from "@/lib/content/validate";

const GROQ_POST_MODELS = [
  "llama-3.1-70b-versatile",
  "llama-3.3-70b-versatile",
  "openai/gpt-oss-120b",
] as const;

const aiFaqItemSchema = z
  .object({
    q: z.string().optional(),
    a: z.string().optional(),
    question: z.string().optional(),
    answer: z.string().optional(),
  })
  .passthrough();

const aiPostSchema = z
  .object({
    title: z.string().min(1),
    slug: z.string().optional(),
    excerpt: z.string().optional(),
    seo: z
      .object({
        seoTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        ogTitle: z.string().optional(),
        ogDescription: z.string().optional(),
        ogImage: z.string().optional(),
      })
      .passthrough()
      .optional(),
    conversion: z
      .object({
        primaryToolSlug: z.string().optional(),
        relatedTools: z.array(z.unknown()).optional(),
      })
      .passthrough()
      .optional(),
    schema: z
      .object({
        type: z.string().optional(),
        faq: z.array(aiFaqItemSchema).optional(),
      })
      .passthrough()
      .optional(),
    content: z.array(z.unknown()).optional(),
  })
  .passthrough();

export class GeneratePostError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = "GeneratePostError";
    this.status = status;
  }
}

function buildToolsList(): string {
  return getReadyTools()
    .map((tool) => `${tool.slug} — ${tool.name}`)
    .join("\n");
}

export function buildGeneratePostPrompt(keyword: string): string {
  const toolsList = buildToolsList();
  return `
You are an expert SEO content generator for a website called Focera.

Focera is a platform that provides free online tools and AI utilities.
Your goal is to generate SEO-optimized blog posts that:
- rank on Google
- drive users to internal tools
- maximize tool usage conversion

IMPORTANT RULES:
- Return ONLY valid JSON
- No explanations
- No markdown
- No extra text

TOOLS AVAILABLE:
${toolsList}

USER KEYWORD:
${keyword}

OUTPUT FORMAT:

{
  "title": "",
  "slug": "",
  "excerpt": "",

  "seo": {
    "seoTitle": "",
    "metaDescription": "",
    "ogTitle": "",
    "ogDescription": "",
    "ogImage": ""
  },

  "conversion": {
    "primaryToolSlug": "",
    "relatedTools": []
  },

  "schema": {
    "type": "faq",
    "faq": [
      {
        "q": "",
        "a": ""
      }
    ]
  },

  "content": [
    {
      "type": "text",
      "html": ""
    },
    {
      "type": "cta",
      "label": "",
      "toolSlug": ""
    },
    {
      "type": "tool_embed",
      "toolSlug": ""
    }
  ]
}

CONTENT RULES:
- First paragraph must hook user and lead to tool
- Must include at least 1 CTA near top
- Must include tool embed
- Must include FAQ section
- Must be SEO optimized for Google
`.trim();
}

export function parseAiJson(raw: string): unknown {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new GeneratePostError("Invalid JSON from AI");
  }

  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(unfenced) as unknown;
  } catch {
    const start = unfenced.indexOf("{");
    const end = unfenced.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(unfenced.slice(start, end + 1)) as unknown;
      } catch {
        throw new GeneratePostError("Invalid JSON from AI");
      }
    }
    throw new GeneratePostError("Invalid JSON from AI");
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function resolveToolSlug(value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;
  const pathPart = raw
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/^\//, "")
    .split(/[/?#]/)[0];
  const slug = slugify(pathPart || raw);
  const bySlug = getToolBySlug(slug);
  if (bySlug?.status === "ready") return bySlug.slug;

  const lowered = raw.toLowerCase();
  const byName = getReadyTools().find(
    (tool) =>
      tool.name.toLowerCase() === lowered ||
      tool.shortName.toLowerCase() === lowered,
  );
  return byName?.status === "ready" ? byName.slug : null;
}

function relatedToolValues(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const slugs: string[] = [];
  for (const item of value) {
    if (typeof item === "string") {
      slugs.push(item);
      continue;
    }
    const rec = asRecord(item);
    if (!rec) continue;
    const fromFields = rec.slug ?? rec.toolSlug ?? rec.tool_slug ?? rec.id ?? rec.href;
    if (typeof fromFields === "string") slugs.push(fromFields);
  }
  return slugs;
}

function faqItemsFromSchema(
  items: z.infer<typeof aiFaqItemSchema>[] | undefined,
): FaqItem[] {
  if (!items?.length) return [];
  return items
    .map((item) => {
      const question = String(item.question ?? item.q ?? "").trim();
      const answer = String(item.answer ?? item.a ?? "").trim();
      if (!question && !answer) return null;
      return { question, answer };
    })
    .filter((item): item is FaqItem => Boolean(item));
}

function parseSchemaType(value: string | undefined): SchemaType {
  if (value === "faq" || value === "howto" || value === "article") return value;
  return "faq";
}

function pickPrimaryTool(keyword: string, candidates: string[]): string | null {
  for (const candidate of candidates) {
    const resolved = resolveToolSlug(candidate);
    if (resolved) return resolved;
  }

  const tokens = keyword
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2);
  const match = getReadyTools().find((tool) =>
    tokens.some(
      (token) =>
        tool.slug.includes(token) ||
        tool.name.toLowerCase().includes(token) ||
        tool.keywords.some((keywordItem) => keywordItem.toLowerCase().includes(token)),
    ),
  );
  return match?.slug ?? getReadyTools()[0]?.slug ?? null;
}

function ensureConversionBlocks(
  blocks: ContentBlock[],
  primaryToolId: string | null,
  faqItems: FaqItem[],
): ContentBlock[] {
  const next = [...blocks];
  const toolId = primaryToolId || "";

  if (!next.some((block) => block.type === "text")) {
    next.unshift({
      id: crypto.randomUUID(),
      type: "text",
      html: "<p>Use this free Focera tool in your browser — no signup required.</p>",
    });
  }

  if (!next.some((block) => block.type === "cta") && toolId) {
    const firstText = next.findIndex((block) => block.type === "text");
    const insertAt = firstText >= 0 ? firstText + 1 : 1;
    next.splice(insertAt, 0, {
      id: crypto.randomUUID(),
      type: "cta",
      label: "Try this free tool",
      toolId,
    });
  }

  if (!next.some((block) => block.type === "tool_embed") && toolId) {
    const ctaIndex = next.findIndex((block) => block.type === "cta");
    const insertAt = ctaIndex >= 0 ? ctaIndex + 1 : Math.min(2, next.length);
    next.splice(insertAt, 0, {
      id: crypto.randomUUID(),
      type: "tool_embed",
      toolId,
    });
  }

  if (!next.some((block) => block.type === "faq") && faqItems.length) {
    next.push({
      id: crypto.randomUUID(),
      type: "faq",
      items: faqItems,
    });
  }

  return next.map((block) => {
    if (block.type === "cta" && !block.toolId && toolId) {
      return { ...block, toolId };
    }
    if (block.type === "tool_embed" && !block.toolId && toolId) {
      return { ...block, toolId };
    }
    return block;
  });
}

function firstCtaLabel(blocks: ContentBlock[]): string | undefined {
  const cta = blocks.find((block) => block.type === "cta");
  const label = cta?.type === "cta" ? cta.label.trim() : "";
  return label || undefined;
}

async function allocateSlug(preferred: string): Promise<string> {
  const base = slugify(preferred) || "ai-post";
  if (!(await getPostBySlug(base))) return base;
  for (let index = 2; index <= 40; index += 1) {
    const candidate = `${base}-${index}`.slice(0, 120);
    if (!(await getPostBySlug(candidate))) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`.slice(0, 120);
}

function messageContentToString(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((part) => {
      if (typeof part === "string") return part;
      const rec = asRecord(part);
      if (!rec) return "";
      if (typeof rec.text === "string") return rec.text;
      if (typeof rec.content === "string") return rec.content;
      return "";
    })
    .join("");
}

function isRetryableModelError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const status = (error as { status?: number }).status;
  return status === 400 || status === 404 || status === 422;
}

async function createGroqCompletion(prompt: string) {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw new GeneratePostError(
      "AI generation is not configured. Set GROQ_API_KEY.",
      503,
    );
  }

  const groq = new Groq({
    apiKey,
    timeout: 50_000,
  });

  let lastError: unknown;
  for (const model of GROQ_POST_MODELS) {
    for (const useJsonObject of [true, false]) {
      try {
        return await groq.chat.completions.create({
          model,
          messages: [
            {
              role: "system",
              content: "You generate structured SEO content as strict JSON only.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 8192,
          ...(useJsonObject ? { response_format: { type: "json_object" as const } } : {}),
        });
      } catch (error) {
        lastError = error;
        if (useJsonObject && isRetryableModelError(error)) continue;
        if (isRetryableModelError(error)) break;
        throw error;
      }
    }
  }

  console.error("[ai/generate-post] Groq failed:", lastError);
  throw new GeneratePostError("Could not generate a blog post. Try again.", 502);
}

export async function persistGeneratedPost(
  parsed: unknown,
  keyword: string,
): Promise<Post> {
  const data = aiPostSchema.safeParse(parsed);
  if (!data.success) {
    throw new GeneratePostError("Invalid JSON from AI");
  }

  const payload = data.data;
  const relatedCandidates = relatedToolValues(payload.conversion?.relatedTools);
  const contentBlocksPreview = parseContentBlocks(payload.content ?? []);
  const contentToolHints = contentBlocksPreview.flatMap((block) => {
    if (block.type === "cta" || block.type === "tool_embed") return [block.toolId];
    return [];
  });
  const primaryToolId = pickPrimaryTool(keyword, [
    payload.conversion?.primaryToolSlug || "",
    ...relatedCandidates,
    ...contentToolHints,
  ]);
  const relatedToolIds = relatedCandidates
    .map((value) => resolveToolSlug(value))
    .filter((slug): slug is string => Boolean(slug) && slug !== primaryToolId)
    .slice(0, 6);
  const faqItems = faqItemsFromSchema(payload.schema?.faq);
  const remappedContent = parseContentBlocks(payload.content ?? []).map((block) => {
    if (block.type === "cta") {
      return {
        ...block,
        toolId: resolveToolSlug(block.toolId) || primaryToolId || "",
      };
    }
    if (block.type === "tool_embed") {
      return {
        ...block,
        toolId: resolveToolSlug(block.toolId) || primaryToolId || "",
      };
    }
    return block;
  });
  const content = ensureConversionBlocks(remappedContent, primaryToolId, faqItems);
  const ctaLabel = firstCtaLabel(content);
  const slug = await allocateSlug(payload.slug || payload.title);

  const validated = validatePostInput({
    title: payload.title,
    slug,
    excerpt: payload.excerpt || "",
    content,
    seoTitle: payload.seo?.seoTitle || payload.title,
    metaDescription: payload.seo?.metaDescription || payload.excerpt || "",
    ogTitle: payload.seo?.ogTitle || payload.seo?.seoTitle || payload.title,
    ogDescription:
      payload.seo?.ogDescription || payload.seo?.metaDescription || payload.excerpt || "",
    ogImage: payload.seo?.ogImage || "",
    schemaType: parseSchemaType(payload.schema?.type),
    schema: payload.schema ?? { type: "faq", faq: faqItems },
    primaryToolId,
    relatedToolIds,
    ctaConfig: {
      ...DEFAULT_CTA_CONFIG,
      labels: ctaLabel ? { top: ctaLabel, bottom: ctaLabel } : {},
    },
    status: "draft",
    publishedAt: null,
  });

  if (!validated.ok) {
    throw new GeneratePostError(validated.error, 400);
  }

  try {
    return await createPost(validated.data);
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "SLUG_TAKEN") {
      const retry = validatePostInput({
        ...validated.data,
        slug: await allocateSlug(`${validated.data.slug}-ai`),
      });
      if (!retry.ok) throw new GeneratePostError(retry.error, 400);
      return createPost(retry.data);
    }
    if (code === "INVALID_TOOL") {
      const retry = validatePostInput({
        ...validated.data,
        primaryToolId: null,
        relatedToolIds: [],
        content: content.map((block) => {
          if (block.type === "cta") return { ...block, toolId: primaryToolId || "" };
          if (block.type === "tool_embed") return { ...block, toolId: primaryToolId || "" };
          return block;
        }),
      });
      if (!retry.ok) throw new GeneratePostError(retry.error, 400);
      return createPost(retry.data);
    }
    throw error;
  }
}

export async function generateAndSavePost(keyword: string): Promise<Post> {
  const prompt = buildGeneratePostPrompt(keyword);
  const response = await createGroqCompletion(prompt);
  const raw = messageContentToString(response.choices[0]?.message?.content);

  let parsed: unknown;
  try {
    parsed = parseAiJson(raw);
  } catch (error) {
    if (error instanceof GeneratePostError) throw error;
    throw new GeneratePostError("Invalid JSON from AI");
  }

  return persistGeneratedPost(parsed, keyword);
}
