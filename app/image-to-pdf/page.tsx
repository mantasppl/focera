import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import ImageToPdfLanding from "@/components/tools/ImageToPdfLanding";
import { ImageToPdfLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("image-to-pdf")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function ImageToPdfPage() {
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
        slug="image-to-pdf"
        workspaceId="image-to-pdf-tool"
        content={<ImageToPdfLanding />}
        ctaTitle="Need more PDF utilities?"
        ctaDescription="Merge, split, compress, or convert PDF to JPG — Focera keeps everyday tools fast, private, and free."
      >
        <ImageToPdfLazy />
      </ToolPageShell>
    </>
  );
}
