import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import TrimVideoLanding from "@/components/tools/TrimVideoLanding";
import { TrimVideoLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("trim-video")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function TrimVideoPage() {
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
        slug="trim-video"
        workspaceId="trim-video-tool"
        content={<TrimVideoLanding />}
        ctaTitle="Need more video utilities?"
        ctaDescription="Compress clips, add captions, or convert to GIF — Focera keeps everyday tools fast, private, and free."
      >
        <TrimVideoLazy />
      </ToolPageShell>
    </>
  );
}
