import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import ExtractImagesFromPdfLanding from "@/components/tools/ExtractImagesFromPdfLanding";
import { ExtractImagesFromPdfLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("extract-images-from-pdf")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function ExtractImagesFromPdfPage() {
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
        slug="extract-images-from-pdf"
        workspaceId="extract-images-from-pdf-tool"
        content={<ExtractImagesFromPdfLanding />}
        ctaTitle="Need more image utilities?"
        ctaDescription="Convert PDF pages to PNG, remove backgrounds, or upscale photos — Focera keeps everyday tools fast, private, and free."
      >
        <ExtractImagesFromPdfLazy />
      </ToolPageShell>
    </>
  );
}
