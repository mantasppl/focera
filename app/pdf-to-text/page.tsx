import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import PdfToTextLanding from "@/components/tools/PdfToTextLanding";
import { PdfToTextLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("pdf-to-text")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function PdfToTextPage() {
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
        slug="pdf-to-text"
        workspaceId="pdf-to-text-tool"
        content={<PdfToTextLanding />}
        ctaTitle="Need more PDF utilities?"
        ctaDescription="Merge, split, compress, or convert to Word — Focera keeps everyday tools fast, private, and free."
      >
        <PdfToTextLazy />
      </ToolPageShell>
    </>
  );
}
