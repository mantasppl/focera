import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import RemovePersonLanding from "@/components/tools/RemovePersonLanding";
import { RemovePersonLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("remove-person")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function RemovePersonPage() {
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
        slug="remove-person"
        workspaceId="remove-person-tool"
        content={<RemovePersonLanding />}
        ctaTitle="Need more image utilities?"
        ctaDescription="Remove objects, cut out backgrounds, or upscale photos — Focera keeps everyday image tools fast, private, and free."
      >
        <RemovePersonLazy />
      </ToolPageShell>
    </>
  );
}
