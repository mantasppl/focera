import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import RearrangePdfLanding from "@/components/tools/RearrangePdfLanding";
import { RearrangePdfLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("rearrange-pdf")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function RearrangePdfPage() {
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
        slug="rearrange-pdf"
        workspaceId="rearrange-pdf-tool"
        content={<RearrangePdfLanding />}
        ctaTitle="Need more document utilities?"
        ctaDescription="Delete pages, merge PDFs, or edit visually — Focera keeps everyday tools fast, private, and free."
      >
        <RearrangePdfLazy />
      </ToolPageShell>
    </>
  );
}
