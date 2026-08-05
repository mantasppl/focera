import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import UnlockPdfLanding from "@/components/tools/UnlockPdfLanding";
import { UnlockPdfLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("unlock-pdf")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function UnlockPdfPage() {
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
        slug="unlock-pdf"
        workspaceId="unlock-pdf-tool"
        content={<UnlockPdfLanding />}
        ctaTitle="Need more PDF utilities?"
        ctaDescription="Merge, split, compress, or convert PDFs — Focera keeps everyday tools fast, private, and free."
      >
        <UnlockPdfLazy />
      </ToolPageShell>
    </>
  );
}
