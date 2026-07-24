import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import UTMBuilder from "@/components/tools/UTMBuilder";
import UTMBuilderLanding from "@/components/tools/UTMBuilderLanding";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("utm-builder")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function UTMBuilderPage() {
  const schema = [
    webApplicationSchema(tool),
    faqPageSchema(tool.faq),
    breadcrumbSchema([
      { name: "Home", href: "/" },
      { name: "All tools", href: "/tools" },
      { name: tool.name, href: tool.href },
    ]),
  ];

  return (
    <>
      <JsonLd data={schema} />
      <ToolPageShell
        slug="utm-builder"
        workspaceId="utm-builder-tool"
        content={<UTMBuilderLanding />}
        ctaTitle="Explore more free online tools"
        ctaDescription="From campaign tracking to invoices and generators, Focera keeps everyday utilities fast, private, and free."
      >
        <UTMBuilder />
      </ToolPageShell>
    </>
  );
}
