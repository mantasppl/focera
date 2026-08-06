import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import Azw3ToPdfLanding from "@/components/tools/Azw3ToPdfLanding";
import { Azw3ToPdfLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("azw3-to-pdf")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function Azw3ToPdfPage() {
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
        slug="azw3-to-pdf"
        workspaceId="azw3-to-pdf-tool"
        content={<Azw3ToPdfLanding />}
        ctaTitle="Need more PDF utilities?"
        ctaDescription="Merge, split, compress, or convert EPUB, MOBI, and Word to PDF — Focera keeps everyday tools fast, private, and free."
      >
        <Azw3ToPdfLazy />
      </ToolPageShell>
    </>
  );
}
