import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import PdfWatermarkLanding from "@/components/tools/PdfWatermarkLanding";
import { PdfWatermarkLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("pdf-watermark")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function PdfWatermarkPage() {
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
        slug="pdf-watermark"
        workspaceId="pdf-watermark-tool"
        content={<PdfWatermarkLanding />}
        ctaTitle="Need more document utilities?"
        ctaDescription="Merge PDFs, compress files, or convert pages to JPG — Focera keeps everyday tools fast, private, and free."
      >
        <PdfWatermarkLazy />
      </ToolPageShell>
    </>
  );
}
