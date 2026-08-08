import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import BlurBackgroundLanding from "@/components/tools/BlurBackgroundLanding";
import { BlurBackgroundLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("blur-background")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function BlurBackgroundPage() {
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
        slug="blur-background"
        workspaceId="blur-background-tool"
        content={<BlurBackgroundLanding />}
        ctaTitle="Need a new background instead?"
        ctaDescription="Swap in a solid color or custom photo, remove backgrounds entirely, or upscale photos — Focera keeps everyday image utilities in one fast hub."
      >
        <BlurBackgroundLazy />
      </ToolPageShell>
    </>
  );
}
