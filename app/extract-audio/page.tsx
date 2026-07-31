import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import ExtractAudioLanding from "@/components/tools/ExtractAudioLanding";
import { ExtractAudioLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("extract-audio")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function ExtractAudioPage() {
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
        slug="extract-audio"
        workspaceId="extract-audio-tool"
        content={<ExtractAudioLanding />}
        ctaTitle="Need more video utilities?"
        ctaDescription="Compress clips, convert MP4 to MP3, or transcribe audio — Focera keeps everyday tools fast, private, and free."
      >
        <ExtractAudioLazy />
      </ToolPageShell>
    </>
  );
}
