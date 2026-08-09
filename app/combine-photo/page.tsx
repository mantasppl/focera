import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import CombinePhotoLanding from "@/components/tools/CombinePhotoLanding";
import { CombinePhotoLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("combine-photo")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function CombinePhotoPage() {
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
        slug="combine-photo"
        workspaceId="combine-photo-tool"
        content={<CombinePhotoLanding />}
        ctaTitle="Need more image utilities?"
        ctaDescription="Resize dimensions, compress files, or remove backgrounds — Focera keeps everyday image tools fast, private, and free."
      >
        <CombinePhotoLazy />
      </ToolPageShell>
    </>
  );
}
