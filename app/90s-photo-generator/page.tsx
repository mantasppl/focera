import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import ChildhoodPhotoLanding from "@/components/tools/ChildhoodPhotoLanding";
import { ChildhoodPhotoLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("90s-photo-generator")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function NinetiesPhotoGeneratorPage() {
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
        slug="90s-photo-generator"
        workspaceId="90s-photo-generator-tool"
        content={<ChildhoodPhotoLanding />}
        ctaTitle="Explore more free image tools"
        ctaDescription="Colorize old photos, upscale images, or generate AI art — Focera keeps everyday creative utilities fast and free."
      >
        <ChildhoodPhotoLazy />
      </ToolPageShell>
    </>
  );
}
