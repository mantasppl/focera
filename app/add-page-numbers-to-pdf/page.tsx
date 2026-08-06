import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import AddPageNumbersToPdfLanding from "@/components/tools/AddPageNumbersToPdfLanding";
import { AddPageNumbersToPdfLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("add-page-numbers-to-pdf")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function AddPageNumbersToPdfPage() {
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
        slug="add-page-numbers-to-pdf"
        workspaceId="add-page-numbers-to-pdf-tool"
        content={<AddPageNumbersToPdfLanding />}
        ctaTitle="Need more document utilities?"
        ctaDescription="Merge PDFs, compress files, or stamp a watermark — Focera keeps everyday tools fast, private, and free."
      >
        <AddPageNumbersToPdfLazy />
      </ToolPageShell>
    </>
  );
}
