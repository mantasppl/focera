import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import ViewMetadataForYourImageLanding from "@/components/tools/ViewMetadataForYourImageLanding";
import { ViewMetadataForYourImageLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("view-metadata-for-your-image")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function ViewMetadataForYourImagePage() {
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
        slug="view-metadata-for-your-image"
        workspaceId="view-metadata-for-your-image-tool"
        content={<ViewMetadataForYourImageLanding />}
        ctaTitle="Need more image utilities?"
        ctaDescription="Crop, compress, or extract text — Focera keeps everyday image tools fast, private, and free."
      >
        <ViewMetadataForYourImageLazy />
      </ToolPageShell>
    </>
  );
}
