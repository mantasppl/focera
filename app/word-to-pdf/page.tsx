import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import WordToPdfLanding from "@/components/tools/WordToPdfLanding";
import { WordToPdfLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("word-to-pdf")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function WordToPdfPage() {
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
        slug="word-to-pdf"
        workspaceId="word-to-pdf-tool"
        content={<WordToPdfLanding />}
        ctaTitle="Need more PDF utilities?"
        ctaDescription="Merge, split, compress, or convert PDF to Word — Focera keeps everyday tools fast, private, and free."
      >
        <WordToPdfLazy />
      </ToolPageShell>
    </>
  );
}
