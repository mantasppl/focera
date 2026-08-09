import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import WebpToJpgLanding from "@/components/tools/WebpToJpgLanding";
import { WebpToJpgLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("webp-to-jpg")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function WebpToJpgPage() {
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
        slug="webp-to-jpg"
        workspaceId="webp-to-jpg-tool"
        content={<WebpToJpgLanding />}
        ctaTitle="Need more image utilities?"
        ctaDescription="Compress, resize, or convert photos — Focera keeps everyday image tools fast, private, and free."
      >
        <WebpToJpgLazy />
      </ToolPageShell>
    </>
  );
}
