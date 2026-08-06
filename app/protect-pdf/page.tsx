import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import ProtectPdfLanding from "@/components/tools/ProtectPdfLanding";
import { ProtectPdfLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("protect-pdf")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function ProtectPdfPage() {
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
        slug="protect-pdf"
        workspaceId="protect-pdf-tool"
        content={<ProtectPdfLanding />}
        ctaTitle="Need more PDF utilities?"
        ctaDescription="Merge, split, compress, unlock, or convert PDFs — Focera keeps everyday tools fast, private, and free."
      >
        <ProtectPdfLazy />
      </ToolPageShell>
    </>
  );
}
