import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import MakeBackgroundTransparentLanding from "@/components/tools/MakeBackgroundTransparentLanding";
import { MakeBackgroundTransparentLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("make-background-transparent")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function MakeBackgroundTransparentPage() {
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
        slug="make-background-transparent"
        workspaceId="make-background-transparent-tool"
        content={<MakeBackgroundTransparentLanding />}
        ctaTitle="Need a new background instead?"
        ctaDescription="Swap in a solid color or custom photo, blur the scene, or remove backgrounds with more export options — Focera keeps everyday image utilities in one fast hub."
      >
        <MakeBackgroundTransparentLazy />
      </ToolPageShell>
    </>
  );
}
