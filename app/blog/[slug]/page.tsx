import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogPostView from "@/components/content/BlogPostView";
import { BLOG_REVALIDATE_SECONDS } from "@/lib/content/types";
import {
  getPublishedPostBySlug,
  listPublishedPostSlugs,
} from "@/lib/content/store";
import { blogPostMetadata } from "@/lib/content/seo";
import { pageMetadata, SITE_NAME } from "@/lib/seo";

export const runtime = "nodejs";
export const revalidate = BLOG_REVALIDATE_SECONDS;
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const slugs = await listPublishedPostSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    console.error("[blog] generateStaticParams failed:", error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) {
    return pageMetadata({
      title: "Post not found",
      description: `Read guides and tutorials from ${SITE_NAME}.`,
      path: "/blog",
      noIndex: true,
    });
  }
  return blogPostMetadata(post);
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();
  return <BlogPostView post={post} />;
}
