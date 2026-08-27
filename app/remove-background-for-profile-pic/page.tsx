import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolLayout from "@/components/ToolLayout";
import RemoveBackgroundForProfilePicSeoLanding from "@/components/tools/RemoveBackgroundForProfilePicSeoLanding";
import { MakeBackgroundTransparentLazy } from "@/components/tools/HeavyTools";
import { getSeoLandingBySlug } from "@/data/seo-landings";
import { getToolBySlug } from "@/data/tools";
import { ToolAnalyticsProvider } from "@/lib/analytics/client";
import {
  breadcrumbSchema,
  faqPageSchema,
  pageMetadata,
  seoLandingPageSchema,
} from "@/lib/seo";

const page = getSeoLandingBySlug("remove-background-for-profile-pic")!;
const parentTool = getToolBySlug(page.parentToolSlug)!;

export const metadata: Metadata = pageMetadata({
  title: page.title,
  description: page.description,
  path: page.href,
  keywords: page.keywords,
});

export default function RemoveBackgroundForProfilePicPage() {
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
          workspaceId="remove-background-for-profile-pic-tool"
          content={<RemoveBackgroundForProfilePicSeoLanding />}
          ctaTitle="Need a new background instead?"
          ctaDescription="Swap in a solid color or custom photo, blur the scene, or keep using everyday image utilities in one fast hub."
        >
          <MakeBackgroundTransparentLazy />
        </ToolLayout>
      </ToolAnalyticsProvider>
    </>
  );
}
