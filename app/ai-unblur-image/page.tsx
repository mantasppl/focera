import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolLayout from "@/components/ToolLayout";
import AiUnblurImageSeoLanding from "@/components/tools/AiUnblurImageSeoLanding";
import { UnblurImageLazy } from "@/components/tools/HeavyTools";
import { getSeoLandingBySlug } from "@/data/seo-landings";
import { getToolBySlug } from "@/data/tools";
import { ToolAnalyticsProvider } from "@/lib/analytics/client";
import {
  breadcrumbSchema,
  faqPageSchema,
  pageMetadata,
  seoLandingPageSchema,
} from "@/lib/seo";

const page = getSeoLandingBySlug("ai-unblur-image")!;
const parentTool = getToolBySlug(page.parentToolSlug)!;

export const metadata: Metadata = pageMetadata({
  title: page.title,
  description: page.description,
  path: page.href,
  keywords: page.keywords,
});

export default function AiUnblurImagePage() {
  const displayTool = {
    ...parentTool,
    name: page.h1,
    shortName: page.shortName,
    description: page.description,
    href: page.href,
    faq: page.faq,
  };

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "All tools", href: "/tools" },
    { name: page.h1, href: page.href },
  ];

  const schema = [
    seoLandingPageSchema({
      title: page.title,
      description: page.description,
      path: page.href,
      parentName: page.parentName,
      parentHref: page.parentHref,
    }),
    faqPageSchema(page.faq),
    breadcrumbSchema(crumbs),
  ];

  return (
    <>
      <JsonLd data={schema} />
      <ToolAnalyticsProvider toolId={parentTool.slug}>
        <ToolLayout
          tool={displayTool}
          workspaceId="ai-unblur-image-tool"
          content={<AiUnblurImageSeoLanding />}
          ctaTitle="Need more image utilities?"
          ctaDescription="Upscale resolution, remove backgrounds, or compress files — Focera keeps everyday image tools fast, private, and free."
        >
          <UnblurImageLazy />
        </ToolLayout>
      </ToolAnalyticsProvider>
    </>
  );
}
