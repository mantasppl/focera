import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogPostView from "@/components/content/BlogPostView";
import { isAdminPageRequest } from "@/lib/content/admin-access";
import { blogPostMetadata } from "@/lib/content/seo";
import { getPostBySlug, getPublishedPostBySlug } from "@/lib/content/store";
import { pageMetadata, SITE_NAME } from "@/lib/seo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const admin = await isAdminPageRequest();
  const post = admin ? await getPostBySlug(slug) : await getPublishedPostBySlug(slug);
  if (!post) {
    return pageMetadata({
      title: "Post not found",
      description: `Read guides and tutorials from ${SITE_NAME}.`,
      path: "/blog",
      noIndex: true,
    });
  }
  return blogPostMetadata(post, { noIndex: true });
}

export default async function BlogPreviewPage({ params }: PageProps) {
  const { slug } = await params;
  const admin = await isAdminPageRequest();
  const post = admin ? await getPostBySlug(slug) : await getPublishedPostBySlug(slug);
  if (!post) notFound();
  return <BlogPostView post={post} preview={admin && post.status !== "published"} />;
}
