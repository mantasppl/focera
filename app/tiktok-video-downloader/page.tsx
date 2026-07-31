import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import TikTokVideoDownloaderLanding from "@/components/tools/TikTokVideoDownloaderLanding";
import { TikTokVideoDownloaderLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("tiktok-video-downloader")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function TikTokVideoDownloaderPage() {
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
        slug="tiktok-video-downloader"
        workspaceId="tiktok-video-tool"
        content={<TikTokVideoDownloaderLanding />}
        ctaTitle="Need more video utilities?"
        ctaDescription="Download Instagram Reels, auto-caption your clips, or pull YouTube transcripts — Focera keeps everyday tools fast and free."
      >
        <TikTokVideoDownloaderLazy />
      </ToolPageShell>
    </>
  );
}
