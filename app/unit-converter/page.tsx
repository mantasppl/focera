import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import UnitConverter from "@/components/tools/UnitConverter";
import UnitConverterLanding from "@/components/tools/UnitConverterLanding";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("unit-converter")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function UnitConverterPage() {
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
        slug="unit-converter"
        workspaceId="unit-converter-tool"
        content={<UnitConverterLanding />}
        ctaTitle="Explore more free calculators and converters"
        ctaDescription="From unit conversions to invoices and developer helpers, Focera keeps everyday tools fast, private, and free."
      >
        <UnitConverter />
      </ToolPageShell>
    </>
  );
}
