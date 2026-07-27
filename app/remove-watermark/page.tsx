import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import RemoveWatermarkLanding from "@/components/tools/RemoveWatermarkLanding";
import { RemoveWatermarkLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("remove-watermark")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function RemoveWatermarkPage() {
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
        slug="remove-watermark"
        workspaceId="remove-watermark-tool"
        content={<RemoveWatermarkLanding />}
        ctaTitle="Need more image utilities?"
        ctaDescription="Remove backgrounds, upscale photos, or convert formats — Focera keeps everyday image tools fast, private, and free."
      >
        <RemoveWatermarkLazy />
      </ToolPageShell>
    </>
  );
}
