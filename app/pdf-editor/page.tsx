import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import PdfEditorLanding from "@/components/tools/PdfEditorLanding";
import { PdfEditorLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("pdf-editor")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function PdfEditorPage() {
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
        slug="pdf-editor"
        workspaceId="pdf-editor-tool"
        content={<PdfEditorLanding />}
        ctaTitle="Need more document utilities?"
        ctaDescription="Merge PDFs, convert pages to JPG, or generate invoices — Focera keeps everyday tools fast, private, and free."
      >
        <PdfEditorLazy />
      </ToolPageShell>
    </>
  );
}
