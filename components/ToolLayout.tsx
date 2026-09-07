import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import type { Tool } from "@/data/tools";
import { getToolBySlug } from "@/data/tools";
import Breadcrumbs from "@/components/Breadcrumbs";
import CTA from "@/components/CTA";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import RelatedTools from "@/components/RelatedTools";
import ShareMenu from "@/components/ShareMenu";
import ToolInquiry from "@/components/ToolInquiry";
import ToolComments from "@/components/comments/ToolComments";
import ToolFeedbackPrompt from "@/components/ToolFeedbackPrompt";
import ToolPublicRating from "@/components/ToolPublicRating";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";
import { cn } from "@/lib/utils";

type ToolLayoutProps = {
  tool: Tool;
  children: ReactNode;
  content?: ReactNode;
  workspaceId?: string;
  className?: string;
  ctaTitle?: string;
  ctaDescription?: string;
};

export default function ToolLayout({
  tool,
  children,
  content,
  workspaceId,
  className,
  ctaTitle,
  ctaDescription,
}: ToolLayoutProps) {
  const catalogTool = getToolBySlug(tool.slug);
  const parentTool =
    catalogTool && catalogTool.href !== tool.href ? catalogTool : undefined;

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "All tools", href: "/tools" },
    { name: tool.shortName, href: tool.href },
  ];

  return (
    <div className={cn("tool-shell", className)}>
      <div className="tool-shell__glow" aria-hidden="true" />
      <Header />

      <main className="tool-shell__main">
        <Breadcrumbs items={crumbs} />

        <section className="tool-hero">
          <p className="tool-hero__eyebrow">
            {tool.status === "soon" ? "Coming soon" : "Free tool"}
          </p>
          <h1 className="tool-hero__title">{tool.name}</h1>
          <p className="tool-hero__lede">{tool.description}</p>
          <Suspense fallback={null}>
            <ToolPublicRating toolSlug={tool.slug} toolName={tool.name} />
          </Suspense>
        </section>

        <div className="tool-workspace-block">
          <section
            id={workspaceId}
            className="tool-workspace"
            aria-label={tool.name}
          >
            {children}
          </section>
          <div className="tool-share-row">
            <ShareMenu
              variant="labeled"
              align="start"
              title={`${tool.name} | ${SITE_NAME}`}
              text={tool.description}
              url={absoluteUrl(tool.href)}
            />
          </div>
        </div>

        <div className="tool-after-workspace">
          {parentTool ? (
            <Link href={parentTool.href} className="ui-btn ui-btn--primary">
              {parentTool.name}
            </Link>
          ) : null}
          <ToolFeedbackPrompt toolSlug={tool.slug} />
        </div>
        <RelatedTools key={tool.href} currentSlug={tool.slug} />
        <Suspense
          fallback={
            <div className="tool-comments tool-comments--loading" aria-hidden="true">
              <div className="tool-comments__intro">
                <h2 className="tool-comments__title">How did you use this tool?</h2>
                <p className="tool-comments__subtitle">
                  Share your results, tips, or best prompts.
                </p>
              </div>
            </div>
          }
        >
          <ToolComments toolSlug={tool.slug} toolName={tool.name} />
        </Suspense>
        <ToolInquiry />

        {content}

        <FAQ items={tool.faq} />
        <CTA title={ctaTitle} description={ctaDescription} />
      </main>

      <Footer />
    </div>
  );
}
