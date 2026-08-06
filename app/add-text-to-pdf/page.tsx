import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import AddTextToPdfLanding from "@/components/tools/AddTextToPdfLanding";
import { AddTextToPdfLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("add-text-to-pdf")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function AddTextToPdfPage() {
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
        slug="add-text-to-pdf"
        workspaceId="add-text-to-pdf-tool"
        content={<AddTextToPdfLanding />}
        ctaTitle="Need more document utilities?"
        ctaDescription="Add page numbers, stamp a watermark, or sign a PDF — Focera keeps everyday tools fast, private, and free."
      >
        <AddTextToPdfLazy />
      </ToolPageShell>
    </>
  );
}
