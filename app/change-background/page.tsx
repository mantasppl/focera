import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import ChangeBackgroundLanding from "@/components/tools/ChangeBackgroundLanding";
import { ChangeBackgroundLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("change-background")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function ChangeBackgroundPage() {
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
        slug="change-background"
        workspaceId="change-background-tool"
        content={<ChangeBackgroundLanding />}
        ctaTitle="Need a transparent cutout instead?"
        ctaDescription="Remove backgrounds, compress images, or upscale photos — Focera keeps everyday image utilities in one fast hub."
      >
        <ChangeBackgroundLazy />
      </ToolPageShell>
    </>
  );
}
