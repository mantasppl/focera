import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import InstagramVideoDownloaderLanding from "@/components/tools/InstagramVideoDownloaderLanding";
import { InstagramVideoDownloaderLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("instagram-video-downloader")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function InstagramVideoDownloaderPage() {
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
        slug="instagram-video-downloader"
        workspaceId="instagram-video-tool"
        content={<InstagramVideoDownloaderLanding />}
        ctaTitle="Need more video utilities?"
        ctaDescription="Auto-caption your clips, pull YouTube transcripts, or compress images — Focera keeps everyday tools fast and free."
      >
        <InstagramVideoDownloaderLazy />
      </ToolPageShell>
    </>
  );
}
