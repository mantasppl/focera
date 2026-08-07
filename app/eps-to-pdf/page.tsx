import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import EpsToPdfLanding from "@/components/tools/EpsToPdfLanding";
import { EpsToPdfLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("eps-to-pdf")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function EpsToPdfPage() {
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
        slug="eps-to-pdf"
        workspaceId="eps-to-pdf-tool"
        content={<EpsToPdfLanding />}
        ctaTitle="Need more PDF utilities?"
        ctaDescription="Merge, split, compress, or convert images to PDF — Focera keeps everyday tools fast, private, and free."
      >
        <EpsToPdfLazy />
      </ToolPageShell>
    </>
  );
}
