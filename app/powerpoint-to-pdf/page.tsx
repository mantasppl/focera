import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import PowerpointToPdfLanding from "@/components/tools/PowerpointToPdfLanding";
import { PowerpointToPdfLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("powerpoint-to-pdf")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function PowerpointToPdfPage() {
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
        slug="powerpoint-to-pdf"
        workspaceId="powerpoint-to-pdf-tool"
        content={<PowerpointToPdfLanding />}
        ctaTitle="Need more PDF utilities?"
        ctaDescription="Merge, split, compress, or convert PDF to PowerPoint — Focera keeps everyday tools fast, private, and free."
      >
        <PowerpointToPdfLazy />
      </ToolPageShell>
    </>
  );
}
