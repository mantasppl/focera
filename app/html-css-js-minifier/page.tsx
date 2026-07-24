import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import HtmlCssJsMinifierLanding from "@/components/tools/HtmlCssJsMinifierLanding";
import { HtmlCssJsMinifierLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("html-css-js-minifier")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function HtmlCssJsMinifierPage() {
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
        slug="html-css-js-minifier"
        workspaceId="html-css-js-minifier-tool"
        content={<HtmlCssJsMinifierLanding />}
        ctaTitle="Explore more free developer and utility tools"
        ctaDescription="From JSON utilities to Markdown and converters, Focera keeps everyday tools fast, private, and free."
      >
        <HtmlCssJsMinifierLazy />
      </ToolPageShell>
    </>
  );
}
