import type { Metadata } from "next";
import {
  absoluteUrl,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
} from "@/lib/seo";
import type { Post } from "@/lib/content/types";

export function blogPostMetadata(post: Post, options?: { noIndex?: boolean }): Metadata {
  const path = `/blog/${post.slug}`;
  const url = post.canonicalUrl || absoluteUrl(path);
  const title = post.seoTitle || post.title;
  const description = post.metaDescription || post.excerpt || post.title;
  const ogTitle = post.ogTitle || title;
  const ogDescription = post.ogDescription || description;
  const image = post.ogImage || post.coverImage || DEFAULT_OG_IMAGE;
  const noIndex =
    options?.noIndex ||
    post.robots.startsWith("noindex") ||
    post.status !== "published";

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: {
      index: !noIndex,
      follow: !post.robots.includes("nofollow"),
    },
    openGraph: {
      type: "article",
      title: `${ogTitle} | ${SITE_NAME}`,
      description: ogDescription,
      url,
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 630, alt: ogTitle }],
      publishedTime: post.publishedAt
        ? new Date(post.publishedAt).toISOString()
        : undefined,
      modifiedTime: new Date(post.updatedAt).toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [image],
    },
  };
}
