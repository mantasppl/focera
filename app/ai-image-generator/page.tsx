import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import AiImageGenerator from "@/components/tools/AiImageGenerator";
import AiImageGeneratorLanding from "@/components/tools/AiImageGeneratorLanding";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("ai-image-generator")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function AiImageGeneratorPage() {
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
        slug="ai-image-generator"
        workspaceId="ai-image-generator-tool"
        content={<AiImageGeneratorLanding />}
        ctaTitle="Explore more free image tools"
        ctaDescription="Remove backgrounds, convert PDFs to JPG, and keep everyday creative utilities in one fast hub."
      >
        <AiImageGenerator />
      </ToolPageShell>
    </>
  );
}
