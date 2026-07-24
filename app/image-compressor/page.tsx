import type { Metadata } from "next";
import ComingSoon from "@/components/tools/ComingSoon";
import ComingSoonLanding from "@/components/tools/ComingSoonLanding";
import JsonLd from "@/components/JsonLd";
import ToolPageShell from "@/components/tools/ToolPageShell";
import { getToolBySlug } from "@/data/tools";
import {
  breadcrumbSchema,
  faqPageSchema,
  toolLandingMetadata,
  webApplicationSchema,
} from "@/lib/seo";

const tool = getToolBySlug("image-compressor")!;

export const metadata: Metadata = toolLandingMetadata(tool);

export default function ImageCompressorPage() {
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
        slug="image-compressor"
        content={
          <ComingSoonLanding
            name="image compressor"
            summary="Compress JPG, PNG, and WebP files in your browser to shrink uploads without leaving Focera. Processing will stay local so originals never need to be sent to a server."
            howTo={[
              "Upload an image from your device.",
              "Choose a quality or target size preset.",
              "Download the compressed file instantly.",
            ]}
          />
        }
        ctaTitle="Try ready image tools"
        ctaDescription="Remove backgrounds today while the compressor ships — Focera keeps image utilities private and free."
      >
        <ComingSoon name={tool.name} />
      </ToolPageShell>
    </>
  );
}
