import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import YoutubeToTextLanding from "@/components/tools/YoutubeToTextLanding";
import { YoutubeToTextLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("youtube-to-text")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function YoutubeToTextPage() {
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
        slug="youtube-to-text"
        workspaceId="youtube-to-text-tool"
        content={<YoutubeToTextLanding />}
        ctaTitle="Need more video or text utilities?"
        ctaDescription="Auto-caption your own clips, convert text case, or write in Markdown — Focera keeps everyday tools fast and free."
      >
        <YoutubeToTextLazy />
      </ToolPageShell>
    </>
  );
}
