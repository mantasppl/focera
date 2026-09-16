import { z } from "zod";
import { parseContentBlocks, parseCtaConfig, parseRelatedToolIds } from "@/lib/content/blocks";
import { isValidSlug, slugify } from "@/lib/content/slug";
import {
  ROBOTS_OPTIONS,
  SCHEMA_TYPES,
  POST_STATUSES,
  type PostInput,
  type RobotsDirective,
  type SchemaType,
} from "@/lib/content/types";

const postInputObject = z
  .object({
    title: z.string().trim().min(1, "Title is required.").max(200),
    slug: z.string().trim().max(120).optional(),
    excerpt: z.string().max(800).optional().nullable(),
    coverImage: z.string().max(2000).optional().nullable(),
    content: z.unknown().optional(),
    contentJson: z.string().max(500_000).optional().nullable(),
    seoTitle: z.string().max(200).optional().nullable(),
    metaDescription: z.string().max(320).optional().nullable(),
    ogTitle: z.string().max(200).optional().nullable(),
    ogDescription: z.string().max(320).optional().nullable(),
    ogImage: z.string().max(2000).optional().nullable(),
    canonicalUrl: z.string().max(2000).optional().nullable(),
    robots: z.enum(ROBOTS_OPTIONS).optional(),
    schemaType: z.enum(SCHEMA_TYPES).optional(),
    schemaJson: z.string().max(100_000).optional().nullable(),
    schema: z.unknown().optional(),
    primaryToolId: z.string().max(120).optional().nullable(),
    relatedToolIds: z.array(z.string()).optional(),
    relatedToolsJson: z.string().max(20_000).optional().nullable(),
    ctaConfig: z.unknown().optional(),
    ctaConfigJson: z.string().max(10_000).optional().nullable(),
    status: z.enum(POST_STATUSES).optional(),
    publishedAt: z.number().int().nonnegative().nullable().optional(),
  })
  .passthrough();

export type ValidatedPostInput = Required<
  Pick<PostInput, "title" | "slug">
> &
  PostInput;

function jsonField(
  raw: unknown,
  encoded: string | null | undefined,
  label: string,
): { ok: true; value: unknown } | { ok: false; error: string } {
  if (raw !== undefined) return { ok: true, value: raw };
  if (encoded == null || encoded === "") return { ok: true, value: undefined };
  try {
    return { ok: true, value: JSON.parse(encoded) as unknown };
  } catch {
    return { ok: false, error: `${label} must be valid JSON.` };
  }
}

export function validatePostInput(
  body: unknown,
): { ok: true; data: ValidatedPostInput } | { ok: false; error: string } {
  const parsed = postInputObject.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: first?.message || "Invalid post payload." };
  }

  const input = parsed.data;
  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.title);
  if (!slug || !isValidSlug(slug)) {
    return { ok: false, error: "Slug must be lowercase letters, numbers, and hyphens." };
  }

  const contentParsed = jsonField(input.content, input.contentJson, "contentJson");
  if (!contentParsed.ok) return contentParsed;
  const content = parseContentBlocks(contentParsed.value ?? []);

  const relatedParsed = jsonField(
    input.relatedToolIds,
    input.relatedToolsJson,
    "relatedToolsJson",
  );
  if (!relatedParsed.ok) return relatedParsed;
  const relatedToolIds = parseRelatedToolIds(relatedParsed.value ?? []);

  const ctaParsed = jsonField(input.ctaConfig, input.ctaConfigJson, "ctaConfigJson");
  if (!ctaParsed.ok) return ctaParsed;
  const ctaConfig = parseCtaConfig(ctaParsed.value);

  let schemaJson = typeof input.schemaJson === "string" ? input.schemaJson.trim() : "";
  if (input.schema !== undefined) {
    try {
      schemaJson = JSON.stringify(input.schema);
    } catch {
      return { ok: false, error: "schema must be valid JSON." };
    }
  } else if (schemaJson) {
    try {
      JSON.parse(schemaJson);
    } catch {
      return { ok: false, error: "schemaJson must be valid JSON." };
    }
  }

  if (input.canonicalUrl) {
    const canonical = input.canonicalUrl.trim();
    if (canonical && !/^https?:\/\//i.test(canonical) && !canonical.startsWith("/")) {
      return { ok: false, error: "canonicalUrl must be an absolute or site-relative URL." };
    }
  }

  return {
    ok: true,
    data: {
      title: input.title.trim(),
      slug,
      excerpt: input.excerpt?.trim() || "",
      coverImage: input.coverImage?.trim() || "",
      content,
      seoTitle: input.seoTitle?.trim() || "",
      metaDescription: input.metaDescription?.trim() || "",
      ogTitle: input.ogTitle?.trim() || "",
      ogDescription: input.ogDescription?.trim() || "",
      ogImage: input.ogImage?.trim() || "",
      canonicalUrl: input.canonicalUrl?.trim() || "",
      robots: (input.robots || "index,follow") as RobotsDirective,
      schemaType: (input.schemaType || "article") as SchemaType,
      schemaJson,
      primaryToolId: input.primaryToolId?.trim() || null,
      relatedToolIds,
      ctaConfig,
      status: input.status || "draft",
      publishedAt: input.publishedAt ?? null,
    },
  };
}

export function validatePartialPostInput(
  body: unknown,
): { ok: true; data: Partial<ValidatedPostInput> } | { ok: false; error: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Invalid JSON body." };
  }

  const record = body as Record<string, unknown>;
  if (Object.keys(record).length === 0) {
    return { ok: false, error: "No fields to update." };
  }

  const validated = validatePostInput({
    title:
      typeof record.title === "string" && record.title.trim()
        ? record.title
        : "untitled-draft",
    ...record,
  });
  if (!validated.ok) return validated;

  const patch: Partial<ValidatedPostInput> = {};
  const set = <K extends keyof ValidatedPostInput>(key: K, present: boolean) => {
    if (present) patch[key] = validated.data[key];
  };

  set("title", typeof record.title === "string");
  set("slug", record.slug !== undefined);
  set("excerpt", record.excerpt !== undefined);
  set("coverImage", record.coverImage !== undefined);
  set("content", record.content !== undefined || record.contentJson !== undefined);
  set("seoTitle", record.seoTitle !== undefined);
  set("metaDescription", record.metaDescription !== undefined);
  set("ogTitle", record.ogTitle !== undefined);
  set("ogDescription", record.ogDescription !== undefined);
  set("ogImage", record.ogImage !== undefined);
  set("canonicalUrl", record.canonicalUrl !== undefined);
  set("robots", record.robots !== undefined);
  set("schemaType", record.schemaType !== undefined);
  set("schemaJson", record.schemaJson !== undefined || record.schema !== undefined);
  set("primaryToolId", record.primaryToolId !== undefined);
  set(
    "relatedToolIds",
    record.relatedToolIds !== undefined || record.relatedToolsJson !== undefined,
  );
  set("ctaConfig", record.ctaConfig !== undefined || record.ctaConfigJson !== undefined);
  set("status", record.status !== undefined);
  set("publishedAt", record.publishedAt !== undefined);

  if (Object.keys(patch).length === 0) {
    return { ok: false, error: "No fields to update." };
  }

  return { ok: true, data: patch };
}

export const eventPayloadSchema = z.object({
  type: z.enum(["page_view", "tool_click"]),
  path: z.string().trim().min(1).max(240).optional(),
  slug: z.string().trim().max(120).optional(),
  toolId: z.string().trim().max(120).optional(),
});
