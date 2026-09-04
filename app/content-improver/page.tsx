import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import ContentImprover from "@/components/tools/ContentImprover";
import ContentImproverLanding from "@/components/tools/ContentImproverLanding";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("content-improver")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function ContentImproverPage() {
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
        slug="content-improver"
        workspaceId="content-improver-tool"
        content={<ContentImproverLanding />}
        ctaTitle="Explore more free writing tools"
        ctaDescription="Count words, convert text case, draft Markdown, and keep everyday writing utilities in one fast hub."
      >
        <ContentImprover />
      </ToolPageShell>
    </>
  );
}
