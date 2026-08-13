import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import FlipImageLanding from "@/components/tools/FlipImageLanding";
import { FlipImageLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("flip-image")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function FlipImagePage() {
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
        slug="flip-image"
        workspaceId="flip-image-tool"
        content={<FlipImageLanding />}
        ctaTitle="Need more image utilities?"
        ctaDescription="Crop, resize, or compress files — Focera keeps everyday image tools fast, private, and free."
      >
        <FlipImageLazy />
      </ToolPageShell>
    </>
  );
}
