import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import AudioToTextLanding from "@/components/tools/AudioToTextLanding";
import { AudioToTextLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("audio-to-text")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function AudioToTextPage() {
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
        slug="audio-to-text"
        workspaceId="audio-to-text-tool"
        content={<AudioToTextLanding />}
        ctaTitle="Need more transcript or video utilities?"
        ctaDescription="Pull YouTube captions, auto-caption your own clips, or convert text case — Focera keeps everyday tools fast and free."
      >
        <AudioToTextLazy />
      </ToolPageShell>
    </>
  );
}
