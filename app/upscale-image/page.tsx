import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import UpscaleImageLanding from "@/components/tools/UpscaleImageLanding";
import { UpscaleImageLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("upscale-image")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function UpscaleImagePage() {
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
        slug="upscale-image"
        workspaceId="upscale-image-tool"
        content={<UpscaleImageLanding />}
        ctaTitle="Need more image utilities?"
        ctaDescription="Remove backgrounds, compress files, or convert formats — Focera keeps everyday image tools fast, private, and free."
      >
        <UpscaleImageLazy />
      </ToolPageShell>
    </>
  );
}
