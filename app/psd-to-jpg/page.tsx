import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import PsdToJpgLanding from "@/components/tools/PsdToJpgLanding";
import { PsdToJpgLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("psd-to-jpg")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function PsdToJpgPage() {
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
        slug="psd-to-jpg"
        workspaceId="psd-to-jpg-tool"
        content={<PsdToJpgLanding />}
        ctaTitle="Need more image utilities?"
        ctaDescription="Compress, resize, or convert photos — Focera keeps everyday image tools fast, private, and free."
      >
        <PsdToJpgLazy />
      </ToolPageShell>
    </>
  );
}
