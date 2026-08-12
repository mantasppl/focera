import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import PhotoCollageLanding from "@/components/tools/PhotoCollageLanding";
import { PhotoCollageLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("photo-collage")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function PhotoCollagePage() {
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
        slug="photo-collage"
        workspaceId="photo-collage-tool"
        content={<PhotoCollageLanding />}
        ctaTitle="Need more image utilities?"
        ctaDescription="Combine photos, resize, crop, or compress — Focera keeps everyday image tools fast, private, and free."
      >
        <PhotoCollageLazy />
      </ToolPageShell>
    </>
  );
}
