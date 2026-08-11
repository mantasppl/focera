import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import BlackAndWhitePhotoLanding from "@/components/tools/BlackAndWhitePhotoLanding";
import { BlackAndWhitePhotoLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("black-and-white-photo")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function BlackAndWhitePhotoPage() {
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
        slug="black-and-white-photo"
        workspaceId="black-and-white-photo-tool"
        content={<BlackAndWhitePhotoLanding />}
        ctaTitle="Need more image utilities?"
        ctaDescription="Colorize photos, upscale images, or compress files — Focera keeps everyday image tools fast, private, and free."
      >
        <BlackAndWhitePhotoLazy />
      </ToolPageShell>
    </>
  );
}
