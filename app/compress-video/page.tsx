import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import CompressVideoLanding from "@/components/tools/CompressVideoLanding";
import { CompressVideoLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("compress-video")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function CompressVideoPage() {
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
        slug="compress-video"
        workspaceId="compress-video-tool"
        content={<CompressVideoLanding />}
        ctaTitle="Need more video utilities?"
        ctaDescription="Add captions, download social clips, or compress images — Focera keeps everyday tools fast, private, and free."
      >
        <CompressVideoLazy />
      </ToolPageShell>
    </>
  );
}
