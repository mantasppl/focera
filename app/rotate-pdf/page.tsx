import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import RotatePdfLanding from "@/components/tools/RotatePdfLanding";
import { RotatePdfLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("rotate-pdf")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function RotatePdfPage() {
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
        slug="rotate-pdf"
        workspaceId="rotate-pdf-tool"
        content={<RotatePdfLanding />}
        ctaTitle="Need more document utilities?"
        ctaDescription="Rearrange pages, delete extras, or edit visually — Focera keeps everyday tools fast, private, and free."
      >
        <RotatePdfLazy />
      </ToolPageShell>
    </>
  );
}
