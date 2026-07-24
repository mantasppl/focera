import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import JsonFormatter from "@/components/tools/JsonFormatter";
import JsonFormatterLanding from "@/components/tools/JsonFormatterLanding";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("json-formatter")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function JSONFormatterPage() {
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
        slug="json-formatter"
        workspaceId="json-formatter-tool"
        content={<JsonFormatterLanding />}
        ctaTitle="Explore more free developer and utility tools"
        ctaDescription="From JSON utilities to QR codes and generators, Focera keeps everyday tools fast, private, and free."
      >
        <JsonFormatter />
      </ToolPageShell>
    </>
  );
}
