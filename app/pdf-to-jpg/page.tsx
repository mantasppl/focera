import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import PdfToJpgLanding from "@/components/tools/PdfToJpgLanding";
import { PdfToJpgLazy } from "@/components/tools/HeavyTools";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("pdf-to-jpg")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function PdfToJpgPage() {
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
        slug="pdf-to-jpg"
        workspaceId="pdf-to-jpg-tool"
        content={<PdfToJpgLanding />}
        ctaTitle="Need more image utilities?"
        ctaDescription="Remove backgrounds, generate QR codes, or convert units — Focera keeps everyday tools fast, private, and free."
      >
        <PdfToJpgLazy />
      </ToolPageShell>
    </>
  );
}
