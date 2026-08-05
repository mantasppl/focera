import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import PdfTranslatorLanding from "@/components/tools/PdfTranslatorLanding";
import { PdfTranslatorLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("pdf-translator")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function PdfTranslatorPage() {
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
        slug="pdf-translator"
        workspaceId="pdf-translator-tool"
        content={<PdfTranslatorLanding />}
        ctaTitle="Need more PDF utilities?"
        ctaDescription="Extract text, convert to Word, compress, or unlock PDFs — Focera keeps everyday tools fast, private, and free."
      >
        <PdfTranslatorLazy />
      </ToolPageShell>
    </>
  );
}
