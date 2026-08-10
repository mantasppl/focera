import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import CropImageLanding from "@/components/tools/CropImageLanding";
import { CropImageLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("crop-image")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function CropImagePage() {
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
        slug="crop-image"
        workspaceId="crop-image-tool"
        content={<CropImageLanding />}
        ctaTitle="Need more image utilities?"
        ctaDescription="Resize dimensions, make profile photos, or compress files — Focera keeps everyday image tools fast, private, and free."
      >
        <CropImageLazy />
      </ToolPageShell>
    </>
  );
}
