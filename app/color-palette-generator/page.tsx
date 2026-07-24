import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import ColorPaletteGenerator from "@/components/tools/ColorPaletteGenerator";
import ColorPaletteGeneratorLanding from "@/components/tools/ColorPaletteGeneratorLanding";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("color-palette-generator")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function ColorPaletteGeneratorPage() {
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
        slug="color-palette-generator"
        workspaceId="color-palette-generator-tool"
        content={<ColorPaletteGeneratorLanding />}
        ctaTitle="Explore more free design and utility tools"
        ctaDescription="From generators to converters and developer helpers, Focera keeps everyday tools fast, private, and free."
      >
        <ColorPaletteGenerator />
      </ToolPageShell>
    </>
  );
}
