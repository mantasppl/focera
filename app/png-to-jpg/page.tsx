import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import PngToJpgLanding from "@/components/tools/PngToJpgLanding";
import { PngToJpgLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("png-to-jpg")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function PngToJpgPage() {
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
        slug="png-to-jpg"
        workspaceId="png-to-jpg-tool"
        content={<PngToJpgLanding />}
        ctaTitle="Need more image utilities?"
        ctaDescription="Compress, resize, or convert photos — Focera keeps everyday image tools fast, private, and free."
      >
        <PngToJpgLazy />
      </ToolPageShell>
    </>
  );
}
