import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import AddImagesToImageLanding from "@/components/tools/AddImagesToImageLanding";
import { AddImagesToImageLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("add-images-to-image")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function AddImagesToImagePage() {
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
        slug="add-images-to-image"
        workspaceId="add-images-to-image-tool"
        content={<AddImagesToImageLanding />}
        ctaTitle="Need more image utilities?"
        ctaDescription="Combine photos, add text, remove backgrounds, or compress files — Focera keeps everyday image tools fast, private, and free."
      >
        <AddImagesToImageLazy />
      </ToolPageShell>
    </>
  );
}
