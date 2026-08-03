import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import YoutubeSummarizeLanding from "@/components/tools/YoutubeSummarizeLanding";
import { YoutubeSummarizeLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("youtube-summarize")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function YoutubeSummarizePage() {
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
        slug="youtube-summarize"
        workspaceId="youtube-summarize-tool"
        content={<YoutubeSummarizeLanding />}
        ctaTitle="Need the full transcript or more video utilities?"
        ctaDescription="Transcribe YouTube to text, convert local audio, or browse more free video tools — Focera keeps everyday utilities fast and free."
      >
        <YoutubeSummarizeLazy />
      </ToolPageShell>
    </>
  );
}
