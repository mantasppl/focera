import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { listPublishedPosts } from "@/lib/content/store";
import { breadcrumbSchema, pageMetadata, SITE_NAME } from "@/lib/seo";

export const runtime = "nodejs";
// Numeric literal required — Next.js cannot statically extract imported identifiers.
export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description: `Guides and tutorials for free ${SITE_NAME} tools — PDF, image, video, and AI utilities.`,
  path: "/blog",
  keywords: ["Focera blog", "online tools guides", "PDF tutorials", "image tools"],
});

function formatDate(ms: number | null): string {
  if (!ms) return "";
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function BlogIndexPage() {
  let posts: Awaited<ReturnType<typeof listPublishedPosts>> = [];
  try {
    posts = await listPublishedPosts();
  } catch (error) {
    console.error("[blog] list failed:", error);
  }

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
  ];

  return (
    <div className="page-shell">
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Header />
      <main className="page-main blog-index">
        <Breadcrumbs items={crumbs} />
        <section className="page-hero">
          <p className="page-hero__brand">{SITE_NAME}</p>
          <h1 className="page-hero__title">Blog</h1>
          <p className="page-hero__lede">
            Practical guides for PDF, image, video, and AI tools — written to help you
            get work done faster.
          </p>
        </section>

        {posts.length ? (
          <ul className="blog-index__list">
            {posts.map((post) => (
              <li key={post.id}>
                <article className="blog-index__card">
                  <p className="blog-index__meta">{formatDate(post.publishedAt)}</p>
                  <h2 className="blog-index__title">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  {post.excerpt ? <p className="blog-index__excerpt">{post.excerpt}</p> : null}
                  <Link href={`/blog/${post.slug}`} className="blog-index__more">
                    Read guide
                    <span aria-hidden="true"> →</span>
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <p className="blog-index__empty">New guides are on the way.</p>
        )}
      </main>
      <Footer />
    </div>
  );
}
