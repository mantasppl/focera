import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import HeicToPngLanding from "@/components/tools/HeicToPngLanding";
import { HeicToPngLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("heic-to-png")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function HeicToPngPage() {
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
        slug="heic-to-png"
        workspaceId="heic-to-png-tool"
        content={<HeicToPngLanding />}
        ctaTitle="Need more image utilities?"
        ctaDescription="Compress, resize, or crop photos — Focera keeps everyday image tools fast, private, and free."
      >
        <HeicToPngLazy />
      </ToolPageShell>
    </>
  );
}
