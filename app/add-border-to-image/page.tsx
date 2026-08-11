import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import AddBorderToImageLanding from "@/components/tools/AddBorderToImageLanding";
import { AddBorderToImageLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("add-border-to-image")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function AddBorderToImagePage() {
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
        slug="add-border-to-image"
        workspaceId="add-border-to-image-tool"
        content={<AddBorderToImageLanding />}
        ctaTitle="Need more image utilities?"
        ctaDescription="Resize, crop, stamp text, or compress — Focera keeps everyday image tools fast, private, and free."
      >
        <AddBorderToImageLazy />
      </ToolPageShell>
    </>
  );
}
