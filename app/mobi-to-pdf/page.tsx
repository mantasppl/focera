import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import MobiToPdfLanding from "@/components/tools/MobiToPdfLanding";
import { MobiToPdfLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("mobi-to-pdf")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function MobiToPdfPage() {
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
        slug="mobi-to-pdf"
        workspaceId="mobi-to-pdf-tool"
        content={<MobiToPdfLanding />}
        ctaTitle="Need more PDF utilities?"
        ctaDescription="Merge, split, compress, or convert EPUB and Word to PDF — Focera keeps everyday tools fast, private, and free."
      >
        <MobiToPdfLazy />
      </ToolPageShell>
    </>
  );
}
