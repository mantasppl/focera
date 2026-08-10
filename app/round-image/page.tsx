import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import RoundImageLanding from "@/components/tools/RoundImageLanding";
import { RoundImageLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("round-image")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function RoundImagePage() {
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
        slug="round-image"
        workspaceId="round-image-tool"
        content={<RoundImageLanding />}
        ctaTitle="Need more image utilities?"
        ctaDescription="Crop rectangles, make profile photos, or compress files — Focera keeps everyday image tools fast, private, and free."
      >
        <RoundImageLazy />
      </ToolPageShell>
    </>
  );
}
