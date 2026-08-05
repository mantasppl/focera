import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import CropPdfLanding from "@/components/tools/CropPdfLanding";
import { CropPdfLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("crop-pdf")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function CropPdfPage() {
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
        slug="crop-pdf"
        workspaceId="crop-pdf-tool"
        content={<CropPdfLanding />}
        ctaTitle="Need more document utilities?"
        ctaDescription="Merge PDFs, compress files, or edit page order — Focera keeps everyday tools fast, private, and free."
      >
        <CropPdfLazy />
      </ToolPageShell>
    </>
  );
}
