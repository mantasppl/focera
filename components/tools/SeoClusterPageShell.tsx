import type { ReactNode } from "react";
import Breadcrumbs, { type BreadcrumbItem } from "@/components/Breadcrumbs";
import CTA from "@/components/CTA";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ToolFeedbackPrompt from "@/components/ToolFeedbackPrompt";
import type { ToolFaq } from "@/data/tools";
import { ToolAnalyticsProvider } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

type SeoClusterPageShellProps = {
  parentToolSlug: string;
  title: string;
  intro: string[];
  faq: ToolFaq[];
  children: ReactNode;
  content?: ReactNode;
  workspaceId?: string;
  breadcrumbs: BreadcrumbItem[];
  ctaTitle: string;
  ctaDescription: string;
  ctaHref: string;
  ctaLabel?: string;
  className?: string;
};

export default function SeoClusterPageShell({
  parentToolSlug,
  title,
  intro,
  faq,
  children,
  content,
  workspaceId,
  breadcrumbs,
  ctaTitle,
  ctaDescription,
  ctaHref,
  ctaLabel = "Open the main tool",
  className,
}: SeoClusterPageShellProps) {
  return (
    <ToolAnalyticsProvider toolId={parentToolSlug}>
      <div className={cn("tool-shell", className)}>
        <div className="tool-shell__glow" aria-hidden="true" />
        <Header />

        <main className="tool-shell__main">
          <Breadcrumbs items={breadcrumbs} />

          <section className="tool-hero tool-hero--seo">
            <p className="tool-hero__eyebrow">Free · in your browser</p>
            <h1 className="tool-hero__title">{title}</h1>
            <div className="tool-hero__intro">
              {intro.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section
            id={workspaceId}
            className="tool-workspace"
            aria-label={title}
          >
            {children}
          </section>

          <ToolFeedbackPrompt toolSlug={parentToolSlug} />

          {content}

          <FAQ items={faq} />
          <CTA
            title={ctaTitle}
            description={ctaDescription}
            href={ctaHref}
            label={ctaLabel}
          />
        </main>

        <Footer />
      </div>
    </ToolAnalyticsProvider>
  );
}
