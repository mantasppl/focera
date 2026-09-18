import BlogAnalytics from "@/components/content/BlogAnalytics";
import BlogPostMetrics from "@/components/content/BlogPostMetrics";
import ContentRenderer from "@/components/content/ContentRenderer";
import ConversionCta from "@/components/content/ConversionCta";
import RelatedToolCards from "@/components/content/RelatedToolCards";
import Breadcrumbs from "@/components/Breadcrumbs";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import { getBlogPostMetrics } from "@/lib/analytics/blog-metrics";
import { getContentTool } from "@/lib/content/db";
import { postStructuredData } from "@/lib/content/structured-data";
import type { Post } from "@/lib/content/types";
import { breadcrumbSchema, SITE_NAME } from "@/lib/seo";

export default async function BlogPostView({
  post,
  preview = false,
}: {
  post: Post;
  preview?: boolean;
}) {
  const [primaryTool, metrics, ...relatedTools] = await Promise.all([
    post.primaryToolId ? getContentTool(post.primaryToolId) : Promise.resolve(null),
    getBlogPostMetrics(post.slug),
    ...post.relatedToolIds.map((id) => getContentTool(id)),
  ]);
  const related = relatedTools.filter((tool): tool is NonNullable<typeof tool> =>
    Boolean(tool),
  );
  const rendererTools = [...(primaryTool ? [primaryTool] : []), ...related];
  const mid = Math.ceil(post.content.length / 2);
  const before = post.content.slice(0, mid);
  const after = post.content.slice(mid);
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: post.title, href: `/blog/${post.slug}` },
  ];
  const structured = postStructuredData(post);
  const jsonLd = [
    breadcrumbSchema(crumbs),
    ...(Array.isArray(structured) ? structured : [structured]),
  ];

  return (
    <div className="page-shell">
      <JsonLd data={jsonLd} />
      <Header />
      <main className="page-main blog-page">
        {preview ? (
          <p className="blog-preview-banner">Preview — this post is not public yet.</p>
        ) : null}
        <Breadcrumbs items={crumbs} />
        <article className="blog-article">
          <header className="blog-hero">
            <p className="page-hero__brand">{SITE_NAME} Blog</p>
            <h1 className="blog-hero__title">{post.title}</h1>
            {post.excerpt ? <p className="blog-hero__excerpt">{post.excerpt}</p> : null}
            <BlogPostMetrics slug={post.slug} initial={metrics} />
            {post.coverImage ? (
              // User-supplied cover URLs are not on the Next image host allowlist.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="blog-hero__cover"
                src={post.coverImage}
                alt=""
                loading="lazy"
              />
            ) : null}
          </header>

          <ConversionCta
            position="top"
            config={post.ctaConfig}
            tool={primaryTool}
            slug={post.slug}
          />
          <ContentRenderer blocks={before} tools={rendererTools} slug={post.slug} />
          <ConversionCta
            position="middle"
            config={post.ctaConfig}
            tool={primaryTool}
            slug={post.slug}
          />
          <ContentRenderer blocks={after} tools={rendererTools} slug={post.slug} />
          <RelatedToolCards tools={related} />
          <ConversionCta
            position="bottom"
            config={post.ctaConfig}
            tool={primaryTool}
            slug={post.slug}
          />
        </article>
        <BlogAnalytics slug={post.slug} path={`/blog/${post.slug}`} />
      </main>
      <Footer />
    </div>
  );
}
