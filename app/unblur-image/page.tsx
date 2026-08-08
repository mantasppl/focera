import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import UnblurImageLanding from "@/components/tools/UnblurImageLanding";
import { UnblurImageLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("unblur-image")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function UnblurImagePage() {
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
        slug="unblur-image"
        workspaceId="unblur-image-tool"
        content={<UnblurImageLanding />}
        ctaTitle="Need more image utilities?"
        ctaDescription="Upscale resolution, remove backgrounds, or compress files — Focera keeps everyday image tools fast, private, and free."
      >
        <UnblurImageLazy />
      </ToolPageShell>
    </>
  );
}
