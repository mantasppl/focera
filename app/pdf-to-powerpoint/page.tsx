import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import PdfToPowerpointLanding from "@/components/tools/PdfToPowerpointLanding";
import { PdfToPowerpointLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("pdf-to-powerpoint")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function PdfToPowerpointPage() {
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
        slug="pdf-to-powerpoint"
        workspaceId="pdf-to-powerpoint-tool"
        content={<PdfToPowerpointLanding />}
        ctaTitle="Need more PDF utilities?"
        ctaDescription="Merge, split, compress, or convert to Word and Excel — Focera keeps everyday tools fast, private, and free."
      >
        <PdfToPowerpointLazy />
      </ToolPageShell>
    </>
  );
}
