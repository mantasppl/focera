import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import TextCaseConverter from "@/components/tools/TextCaseConverter";
import TextCaseConverterLanding from "@/components/tools/TextCaseConverterLanding";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("text-case-converter")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function TextCaseConverterPage() {
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
        slug="text-case-converter"
        workspaceId="text-case-converter-tool"
        content={<TextCaseConverterLanding />}
        ctaTitle="Explore more free converters and utilities"
        ctaDescription="From units and JSON to generators and developer helpers, Focera keeps everyday tools fast, private, and free."
      >
        <TextCaseConverter />
      </ToolPageShell>
    </>
  );
}
