import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import VideoToGifLanding from "@/components/tools/VideoToGifLanding";
import { VideoToGifLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("video-to-gif")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function VideoToGifPage() {
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
        slug="video-to-gif"
        workspaceId="video-to-gif-tool"
        content={<VideoToGifLanding />}
        ctaTitle="Need more video utilities?"
        ctaDescription="Compress clips, extract audio, or download social videos — Focera keeps everyday tools fast, private, and free."
      >
        <VideoToGifLazy />
      </ToolPageShell>
    </>
  );
}
