import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import EssayWriter from "@/components/tools/EssayWriter";
import EssayWriterLanding from "@/components/tools/EssayWriterLanding";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("essay-writer")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function EssayWriterPage() {
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
        slug="essay-writer"
        workspaceId="essay-writer-tool"
        content={<EssayWriterLanding />}
        ctaTitle="Explore more free writing tools"
        ctaDescription="Improve drafts, count words, convert text case, and keep everyday writing utilities in one fast hub."
      >
        <EssayWriter />
      </ToolPageShell>
    </>
  );
}
