import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import EpubToPdfLanding from "@/components/tools/EpubToPdfLanding";
import { EpubToPdfLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("epub-to-pdf")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function EpubToPdfPage() {
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
        slug="epub-to-pdf"
        workspaceId="epub-to-pdf-tool"
        content={<EpubToPdfLanding />}
        ctaTitle="Need more PDF utilities?"
        ctaDescription="Merge, split, compress, or convert Word and images to PDF — Focera keeps everyday tools fast, private, and free."
      >
        <EpubToPdfLazy />
      </ToolPageShell>
    </>
  );
}
