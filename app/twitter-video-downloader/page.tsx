import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import TwitterVideoDownloaderLanding from "@/components/tools/TwitterVideoDownloaderLanding";
import { TwitterVideoDownloaderLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("twitter-video-downloader")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function TwitterVideoDownloaderPage() {
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
        slug="twitter-video-downloader"
        workspaceId="twitter-video-tool"
        content={<TwitterVideoDownloaderLanding />}
        ctaTitle="Need more video utilities?"
        ctaDescription="Download TikTok or Instagram clips, auto-caption your videos, or pull YouTube transcripts — Focera keeps everyday tools fast and free."
      >
        <TwitterVideoDownloaderLazy />
      </ToolPageShell>
    </>
  );
}
