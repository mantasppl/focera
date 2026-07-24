import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import LoremIpsumGenerator from "@/components/tools/LoremIpsumGenerator";
import LoremIpsumGeneratorLanding from "@/components/tools/LoremIpsumGeneratorLanding";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("lorem-ipsum-generator")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function LoremIpsumGeneratorPage() {
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
        slug="lorem-ipsum-generator"
        workspaceId="lorem-ipsum-generator-tool"
        content={<LoremIpsumGeneratorLanding />}
        ctaTitle="Explore more free generators and utilities"
        ctaDescription="From QR codes and invoices to developer helpers, Focera keeps everyday tools fast, private, and free."
      >
        <LoremIpsumGenerator />
      </ToolPageShell>
    </>
  );
}
