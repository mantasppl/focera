import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import PdfToMobiLanding from "@/components/tools/PdfToMobiLanding";
import { PdfToMobiLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("pdf-to-mobi")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function PdfToMobiPage() {
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
        slug="pdf-to-mobi"
        workspaceId="pdf-to-mobi-tool"
        content={<PdfToMobiLanding />}
        ctaTitle="Need more PDF utilities?"
        ctaDescription="Merge, split, compress, or convert pages to Word, EPUB, and JPG — Focera keeps everyday tools fast, private, and free."
      >
        <PdfToMobiLazy />
      </ToolPageShell>
    </>
  );
}
