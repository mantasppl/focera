import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import PdfToEpubLanding from "@/components/tools/PdfToEpubLanding";
import { PdfToEpubLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("pdf-to-epub")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function PdfToEpubPage() {
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
        slug="pdf-to-epub"
        workspaceId="pdf-to-epub-tool"
        content={<PdfToEpubLanding />}
        ctaTitle="Need more PDF utilities?"
        ctaDescription="Merge, split, compress, or convert pages to Word and JPG — Focera keeps everyday tools fast, private, and free."
      >
        <PdfToEpubLazy />
      </ToolPageShell>
    </>
  );
}
