import { contentMarkdownToHtml } from "@/lib/content/markdown";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/seo";
import type { ContentBlock, FaqItem, Post, SchemaType } from "@/lib/content/types";

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function faqItemsFromBlocks(blocks: ContentBlock[]): FaqItem[] {
  return blocks.flatMap((block) => (block.type === "faq" ? block.items : []));
}

function howToStepsFromBlocks(blocks: ContentBlock[]): string[] {
  const steps: string[] = [];
  for (const block of blocks) {
    if (block.type === "list") {
      for (const item of block.items) {
        const text = item.trim();
        if (text) steps.push(text);
      }
    }
    if (block.type === "text") {
      const text = stripTags(contentMarkdownToHtml(block.html));
      if (text) steps.push(text);
    }
  }
  return steps.slice(0, 12);
}

export function articleSchema(post: Post) {
  const url = post.canonicalUrl || absoluteUrl(`/blog/${post.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.seoTitle || post.title,
    description: post.metaDescription || post.excerpt,
    image: post.ogImage || post.coverImage || undefined,
    datePublished: post.publishedAt
      ? new Date(post.publishedAt).toISOString()
      : undefined,
    dateModified: new Date(post.updatedAt).toISOString(),
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    url,
  };
}

export function faqSchemaFromPost(post: Post) {
  const items = faqItemsFromBlocks(post.content).filter(
    (item) => item.question.trim() && item.answer.trim(),
  );
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function howToSchemaFromPost(post: Post) {
  const steps = howToStepsFromBlocks(post.content);
  if (!steps.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: post.seoTitle || post.title,
    description: post.metaDescription || post.excerpt,
    step: steps.map((text, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: `Step ${index + 1}`,
      text,
    })),
  };
}

function parseCustomSchema(raw: string): Record<string, unknown> | null {
  if (!raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function postStructuredData(
  post: Post,
  schemaType: SchemaType = post.schemaType,
): Record<string, unknown> | Record<string, unknown>[] {
  const custom = parseCustomSchema(post.schemaJson);
  if (custom) {
    return { "@context": "https://schema.org", ...custom };
  }

  if (schemaType === "faq") {
    return faqSchemaFromPost(post) || articleSchema(post);
  }
  if (schemaType === "howto") {
    return howToSchemaFromPost(post) || articleSchema(post);
  }
  const faq = faqSchemaFromPost(post);
  return faq ? [articleSchema(post), faq] : articleSchema(post);
}
