import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import PdfToWordLanding from "@/components/tools/PdfToWordLanding";
import { PdfToWordLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("pdf-to-word")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function PdfToWordPage() {
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
        slug="pdf-to-word"
        workspaceId="pdf-to-word-tool"
        content={<PdfToWordLanding />}
        ctaTitle="Need more PDF utilities?"
        ctaDescription="Merge, split, compress, or convert pages to JPG — Focera keeps everyday tools fast, private, and free."
      >
        <PdfToWordLazy />
      </ToolPageShell>
    </>
  );
}
