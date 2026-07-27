import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import SplitPdfLanding from "@/components/tools/SplitPdfLanding";
import { SplitPdfLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("split-pdf")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function SplitPdfPage() {
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
        slug="split-pdf"
        workspaceId="split-pdf-tool"
        content={<SplitPdfLanding />}
        ctaTitle="Need more document utilities?"
        ctaDescription="Merge PDFs, compress files, or convert pages to JPG — Focera keeps everyday tools fast, private, and free."
      >
        <SplitPdfLazy />
      </ToolPageShell>
    </>
  );
}
