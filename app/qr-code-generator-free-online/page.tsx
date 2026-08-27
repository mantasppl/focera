import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolLayout from "@/components/ToolLayout";
import QrCodeGeneratorFreeOnlineSeoLanding from "@/components/tools/QrCodeGeneratorFreeOnlineSeoLanding";
import QRGenerator from "@/components/tools/QRGenerator";
import { getSeoLandingBySlug } from "@/data/seo-landings";
import { getToolBySlug } from "@/data/tools";
import { ToolAnalyticsProvider } from "@/lib/analytics/client";
import {
  breadcrumbSchema,
  faqPageSchema,
  pageMetadata,
  seoLandingPageSchema,
} from "@/lib/seo";

const page = getSeoLandingBySlug("qr-code-generator-free-online")!;
const parentTool = getToolBySlug(page.parentToolSlug)!;

export const metadata: Metadata = pageMetadata({
  title: page.title,
  description: page.description,
  path: page.href,
  keywords: page.keywords,
});

export default function QrCodeGeneratorFreeOnlinePage() {
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
          workspaceId="qr-code-generator-free-online-tool"
          content={<QrCodeGeneratorFreeOnlineSeoLanding />}
          ctaTitle="Explore more free online tools"
          ctaDescription="From campaign tracking to profit modeling, Focera keeps your everyday utilities in one fast, mobile-friendly hub."
        >
          <QRGenerator />
        </ToolLayout>
      </ToolAnalyticsProvider>
    </>
  );
}
