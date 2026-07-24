import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import InvoiceGeneratorLanding from "@/components/tools/InvoiceGeneratorLanding";
import { InvoiceGeneratorLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("invoice-generator")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function InvoiceGeneratorPage() {
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
        slug="invoice-generator"
        workspaceId="invoice-generator-tool"
        content={<InvoiceGeneratorLanding />}
        ctaTitle="More free finance and business tools"
        ctaDescription="From profit modeling to campaign tracking, Focera keeps everyday utilities fast, private, and free."
      >
        <InvoiceGeneratorLazy />
      </ToolPageShell>
    </>
  );
}
