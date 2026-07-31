import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import VideoToTextLanding from "@/components/tools/VideoToTextLanding";
import { VideoToTextLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("video-to-text")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function VideoToTextPage() {
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
        slug="video-to-text"
        workspaceId="video-to-text-tool"
        content={<VideoToTextLanding />}
        ctaTitle="Need more transcript or video utilities?"
        ctaDescription="Transcribe audio, pull YouTube captions, or auto-caption your own clips — Focera keeps everyday tools fast and free."
      >
        <VideoToTextLazy />
      </ToolPageShell>
    </>
  );
}
