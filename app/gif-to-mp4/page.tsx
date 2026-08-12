import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import GifToMp4Landing from "@/components/tools/GifToMp4Landing";
import { GifToMp4Lazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("gif-to-mp4")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function GifToMp4Page() {
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
        slug="gif-to-mp4"
        workspaceId="gif-to-mp4-tool"
        content={<GifToMp4Landing />}
        ctaTitle="Need more video utilities?"
        ctaDescription="Turn video into GIFs, compress clips, or extract audio — Focera keeps everyday tools fast, private, and free."
      >
        <GifToMp4Lazy />
      </ToolPageShell>
    </>
  );
}
