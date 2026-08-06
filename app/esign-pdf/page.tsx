import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import EsignPdfLanding from "@/components/tools/EsignPdfLanding";
import { EsignPdfLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("esign-pdf")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function EsignPdfPage() {
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
        slug="esign-pdf"
        workspaceId="esign-pdf-tool"
        content={<EsignPdfLanding />}
        ctaTitle="Need more document utilities?"
        ctaDescription="Watermark pages, merge files, or unlock protected PDFs — Focera keeps everyday tools fast, private, and free."
      >
        <EsignPdfLazy />
      </ToolPageShell>
    </>
  );
}
