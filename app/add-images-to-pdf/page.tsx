import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import AddImagesToPdfLanding from "@/components/tools/AddImagesToPdfLanding";
import { AddImagesToPdfLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("add-images-to-pdf")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function AddImagesToPdfPage() {
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
        slug="add-images-to-pdf"
        workspaceId="add-images-to-pdf-tool"
        content={<AddImagesToPdfLanding />}
        ctaTitle="Need more document utilities?"
        ctaDescription="Convert images to PDF, stamp a watermark, or merge files — Focera keeps everyday tools fast, private, and free."
      >
        <AddImagesToPdfLazy />
      </ToolPageShell>
    </>
  );
}
