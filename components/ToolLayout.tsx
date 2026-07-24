import type { ReactNode } from "react";
import type { Tool } from "@/data/tools";
import Breadcrumbs from "@/components/Breadcrumbs";
import CTA from "@/components/CTA";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import RelatedTools from "@/components/RelatedTools";
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
        </section>

        <section
          id={workspaceId}
          className="tool-workspace"
          aria-label={tool.name}
        >
          {children}
        </section>

        {content}

        <FAQ items={tool.faq} />
        <RelatedTools currentSlug={tool.slug} />
        <CTA title={ctaTitle} description={ctaDescription} />
      </main>

      <Footer />
    </div>
  );
}
