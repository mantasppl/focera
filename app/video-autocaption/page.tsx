import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import VideoAutocaptionLanding from "@/components/tools/VideoAutocaptionLanding";
import { VideoAutocaptionLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("video-autocaption")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function VideoAutocaptionPage() {
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
        slug="video-autocaption"
        workspaceId="video-autocaption-tool"
        content={<VideoAutocaptionLanding />}
        ctaTitle="Need more creative utilities?"
        ctaDescription="Generate stories, convert text case, or extract text from images — Focera keeps everyday tools fast, private, and free."
      >
        <VideoAutocaptionLazy />
      </ToolPageShell>
    </>
  );
}
