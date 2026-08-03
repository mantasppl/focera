import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import WordCounter from "@/components/tools/WordCounter";
import WordCounterLanding from "@/components/tools/WordCounterLanding";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("word-counter")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function WordCounterPage() {
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
        slug="word-counter"
        workspaceId="word-counter-tool"
        content={<WordCounterLanding />}
        ctaTitle="Explore more free converters and utilities"
        ctaDescription="From units and JSON to generators and developer helpers, Focera keeps everyday tools fast, private, and free."
      >
        <WordCounter />
      </ToolPageShell>
    </>
  );
}
