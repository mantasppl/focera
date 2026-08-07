import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import RemoveObjectsLanding from "@/components/tools/RemoveObjectsLanding";
import { RemoveObjectsLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("remove-objects")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function RemoveObjectsPage() {
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
        slug="remove-objects"
        workspaceId="remove-objects-tool"
        content={<RemoveObjectsLanding />}
        ctaTitle="Need more image utilities?"
        ctaDescription="Remove watermarks, cut out backgrounds, or upscale photos — Focera keeps everyday image tools fast, private, and free."
      >
        <RemoveObjectsLazy />
      </ToolPageShell>
    </>
  );
}
