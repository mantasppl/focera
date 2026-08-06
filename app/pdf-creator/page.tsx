import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import PdfCreatorLanding from "@/components/tools/PdfCreatorLanding";
import { PdfCreatorLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("pdf-creator")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function PdfCreatorPage() {
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
        slug="pdf-creator"
        workspaceId="pdf-creator-tool"
        content={<PdfCreatorLanding />}
        ctaTitle="Need more document utilities?"
        ctaDescription="Merge files, convert images, or edit pages visually — Focera keeps everyday tools fast, private, and free."
      >
        <PdfCreatorLazy />
      </ToolPageShell>
    </>
  );
}
