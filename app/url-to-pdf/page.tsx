import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import UrlToPdfLanding from "@/components/tools/UrlToPdfLanding";
import { UrlToPdfLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("url-to-pdf")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function UrlToPdfPage() {
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
        slug="url-to-pdf"
        workspaceId="url-to-pdf-tool"
        content={<UrlToPdfLanding />}
        ctaTitle="Need more PDF utilities?"
        ctaDescription="Merge, compress, edit, or convert PDFs — Focera keeps everyday document tools fast and free."
      >
        <UrlToPdfLazy />
      </ToolPageShell>
    </>
  );
}
