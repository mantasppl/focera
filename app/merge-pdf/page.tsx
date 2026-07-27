import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import MergePdfLanding from "@/components/tools/MergePdfLanding";
import { MergePdfLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("merge-pdf")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function MergePdfPage() {
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
        slug="merge-pdf"
        workspaceId="merge-pdf-tool"
        content={<MergePdfLanding />}
        ctaTitle="Need more document utilities?"
        ctaDescription="Convert PDFs to JPG, generate invoices, or write Markdown — Focera keeps everyday tools fast, private, and free."
      >
        <MergePdfLazy />
      </ToolPageShell>
    </>
  );
}
