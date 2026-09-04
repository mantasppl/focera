import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import AiParagraphGenerator from "@/components/tools/AiParagraphGenerator";
import AiParagraphGeneratorLanding from "@/components/tools/AiParagraphGeneratorLanding";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("ai-paragraph-generator")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function AiParagraphGeneratorPage() {
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
        slug="ai-paragraph-generator"
        workspaceId="ai-paragraph-generator-tool"
        content={<AiParagraphGeneratorLanding />}
        ctaTitle="Explore more free writing tools"
        ctaDescription="Improve drafts, write essays, count words, and keep everyday writing utilities in one fast hub."
      >
        <AiParagraphGenerator />
      </ToolPageShell>
    </>
  );
}
