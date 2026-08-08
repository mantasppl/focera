import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import HeicToJpgLanding from "@/components/tools/HeicToJpgLanding";
import { HeicToJpgLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("heic-to-jpg")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function HeicToJpgPage() {
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
        slug="heic-to-jpg"
        workspaceId="heic-to-jpg-tool"
        content={<HeicToJpgLanding />}
        ctaTitle="Need more image utilities?"
        ctaDescription="Compress, resize, or crop photos — Focera keeps everyday image tools fast, private, and free."
      >
        <HeicToJpgLazy />
      </ToolPageShell>
    </>
  );
}
