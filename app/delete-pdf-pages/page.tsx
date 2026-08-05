import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import DeletePdfPagesLanding from "@/components/tools/DeletePdfPagesLanding";
import { DeletePdfPagesLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("delete-pdf-pages")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function DeletePdfPagesPage() {
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
        slug="delete-pdf-pages"
        workspaceId="delete-pdf-pages-tool"
        content={<DeletePdfPagesLanding />}
        ctaTitle="Need more document utilities?"
        ctaDescription="Merge PDFs, split files, or edit pages visually — Focera keeps everyday tools fast, private, and free."
      >
        <DeletePdfPagesLazy />
      </ToolPageShell>
    </>
  );
}
