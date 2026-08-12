import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import SvgToPngLanding from "@/components/tools/SvgToPngLanding";
import { SvgToPngLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("svg-to-png")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function SvgToPngPage() {
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
        slug="svg-to-png"
        workspaceId="svg-to-png-tool"
        content={<SvgToPngLanding />}
        ctaTitle="Need more image utilities?"
        ctaDescription="Compress, resize, or convert photos — Focera keeps everyday image tools fast, private, and free."
      >
        <SvgToPngLazy />
      </ToolPageShell>
    </>
  );
}
