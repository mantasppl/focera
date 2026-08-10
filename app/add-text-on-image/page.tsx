import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import AddTextOnImageLanding from "@/components/tools/AddTextOnImageLanding";
import { AddTextOnImageLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("add-text-on-image")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function AddTextOnImagePage() {
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
        slug="add-text-on-image"
        workspaceId="add-text-on-image-tool"
        content={<AddTextOnImageLanding />}
        ctaTitle="Need more image utilities?"
        ctaDescription="Crop, resize, compress, or remove backgrounds — Focera keeps everyday image tools fast, private, and free."
      >
        <AddTextOnImageLazy />
      </ToolPageShell>
    </>
  );
}
