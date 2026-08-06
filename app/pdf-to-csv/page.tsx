import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import PdfToCsvLanding from "@/components/tools/PdfToCsvLanding";
import { PdfToCsvLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("pdf-to-csv")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function PdfToCsvPage() {
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
        slug="pdf-to-csv"
        workspaceId="pdf-to-csv-tool"
        content={<PdfToCsvLanding />}
        ctaTitle="Need more PDF utilities?"
        ctaDescription="Merge, split, compress, or convert pages to Excel, Word, and JPG — Focera keeps everyday tools fast, private, and free."
      >
        <PdfToCsvLazy />
      </ToolPageShell>
    </>
  );
}
