import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import PdfToExcelLanding from "@/components/tools/PdfToExcelLanding";
import { PdfToExcelLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("pdf-to-excel")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function PdfToExcelPage() {
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
        slug="pdf-to-excel"
        workspaceId="pdf-to-excel-tool"
        content={<PdfToExcelLanding />}
        ctaTitle="Need more PDF utilities?"
        ctaDescription="Merge, split, compress, or convert pages to Word and JPG — Focera keeps everyday tools fast, private, and free."
      >
        <PdfToExcelLazy />
      </ToolPageShell>
    </>
  );
}
