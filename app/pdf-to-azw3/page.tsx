import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import PdfToAzw3Landing from "@/components/tools/PdfToAzw3Landing";
import { PdfToAzw3Lazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("pdf-to-azw3")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function PdfToAzw3Page() {
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
        slug="pdf-to-azw3"
        workspaceId="pdf-to-azw3-tool"
        content={<PdfToAzw3Landing />}
        ctaTitle="Need more PDF utilities?"
        ctaDescription="Merge, split, compress, or convert pages to Word, EPUB, MOBI, and JPG — Focera keeps everyday tools fast, private, and free."
      >
        <PdfToAzw3Lazy />
      </ToolPageShell>
    </>
  );
}
