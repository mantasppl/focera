import type { Metadata } from "next";
import Calculator from "@/components/Calculator";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import ProfitCalculatorLanding from "@/components/tools/ProfitCalculatorLanding";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("profit-calculator")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function ProfitCalculatorPage() {
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
        slug="profit-calculator"
        workspaceId="profit-calculator-tool"
        content={<ProfitCalculatorLanding />}
        ctaTitle="Explore more free online tools"
        ctaDescription="From profit modeling to invoices and campaign tracking, Focera keeps everyday utilities fast, private, and free."
      >
        <Calculator />
      </ToolPageShell>
    </>
  );
}
