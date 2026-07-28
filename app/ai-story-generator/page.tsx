import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import AiStoryGenerator from "@/components/tools/AiStoryGenerator";
import AiStoryGeneratorLanding from "@/components/tools/AiStoryGeneratorLanding";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("ai-story-generator")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function AiStoryGeneratorPage() {
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
        slug="ai-story-generator"
        workspaceId="ai-story-generator-tool"
        content={<AiStoryGeneratorLanding />}
        ctaTitle="Explore more free writing tools"
        ctaDescription="Generate placeholder copy, format Markdown, and keep everyday writing utilities in one fast hub."
      >
        <AiStoryGenerator />
      </ToolPageShell>
    </>
  );
}
