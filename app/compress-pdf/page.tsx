import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import CompressPdfLanding from "@/components/tools/CompressPdfLanding";
import { CompressPdfLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("compress-pdf")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function CompressPdfPage() {
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
        slug="compress-pdf"
        workspaceId="compress-pdf-tool"
        content={<CompressPdfLanding />}
        ctaTitle="Need more document utilities?"
        ctaDescription="Merge PDFs, convert pages to JPG, or edit page order — Focera keeps everyday tools fast, private, and free."
      >
        <CompressPdfLazy />
      </ToolPageShell>
    </>
  );
}
