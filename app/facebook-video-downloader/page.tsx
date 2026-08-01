import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import FacebookVideoDownloaderLanding from "@/components/tools/FacebookVideoDownloaderLanding";
import { FacebookVideoDownloaderLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("facebook-video-downloader")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function FacebookVideoDownloaderPage() {
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
        slug="facebook-video-downloader"
        workspaceId="facebook-video-tool"
        content={<FacebookVideoDownloaderLanding />}
        ctaTitle="Need more video utilities?"
        ctaDescription="Download TikTok or Instagram clips, auto-caption your videos, or pull YouTube transcripts — Focera keeps everyday tools fast and free."
      >
        <FacebookVideoDownloaderLazy />
      </ToolPageShell>
    </>
  );
}
