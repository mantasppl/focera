import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import TranslateYourImageLanding from "@/components/tools/TranslateYourImageLanding";
import { TranslateYourImageLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("translate-your-image")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function TranslateYourImagePage() {
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
        slug="translate-your-image"
        workspaceId="translate-your-image-tool"
        content={<TranslateYourImageLanding />}
        ctaTitle="Need more image utilities?"
        ctaDescription="Extract text, upscale photos, or stamp captions — Focera keeps everyday image tools fast, private, and free."
      >
        <TranslateYourImageLazy />
      </ToolPageShell>
    </>
  );
}
