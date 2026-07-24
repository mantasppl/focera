import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import BackgroundRemoverLanding from "@/components/tools/BackgroundRemoverLanding";
import { BackgroundRemoverLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("background-remover")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function BackgroundRemoverPage() {
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
        slug="background-remover"
        workspaceId="background-remover-tool"
        content={<BackgroundRemoverLanding />}
        ctaTitle="Need to optimize images next?"
        ctaDescription="Compress, convert, or generate QR codes — Focera keeps everyday image and marketing utilities in one fast hub."
      >
        <BackgroundRemoverLazy />
      </ToolPageShell>
    </>
  );
}
