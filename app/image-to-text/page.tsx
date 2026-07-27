import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import ImageToTextLanding from "@/components/tools/ImageToTextLanding";
import { ImageToTextLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("image-to-text")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function ImageToTextPage() {
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
        slug="image-to-text"
        workspaceId="image-to-text-tool"
        content={<ImageToTextLanding />}
        ctaTitle="Need more image utilities?"
        ctaDescription="Remove backgrounds, upscale photos, or clean watermarks — Focera keeps everyday image tools fast, private, and free."
      >
        <ImageToTextLazy />
      </ToolPageShell>
    </>
  );
}
