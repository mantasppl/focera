import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import Mp4ToMp3Landing from "@/components/tools/Mp4ToMp3Landing";
import { Mp4ToMp3Lazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("mp4-to-mp3")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function Mp4ToMp3Page() {
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
        slug="mp4-to-mp3"
        workspaceId="mp4-to-mp3-tool"
        content={<Mp4ToMp3Landing />}
        ctaTitle="Need more video utilities?"
        ctaDescription="Compress clips, add captions, or transcribe audio — Focera keeps everyday tools fast, private, and free."
      >
        <Mp4ToMp3Lazy />
      </ToolPageShell>
    </>
  );
}
