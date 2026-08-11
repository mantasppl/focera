import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import ImageSplitterLanding from "@/components/tools/ImageSplitterLanding";
import { ImageSplitterLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("image-splitter")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function ImageSplitterPage() {
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
        slug="image-splitter"
        workspaceId="image-splitter-tool"
        content={<ImageSplitterLanding />}
        ctaTitle="Need more image utilities?"
        ctaDescription="Crop, resize, combine photos, or compress files — Focera keeps everyday image tools fast, private, and free."
      >
        <ImageSplitterLazy />
      </ToolPageShell>
    </>
  );
}
